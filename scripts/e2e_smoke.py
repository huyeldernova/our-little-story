#!/usr/bin/env python3
"""
End-to-end smoke test for Our Little Story (two real browsers, real backend, real MySQL).

Prerequisites: backend on :8080, `npm run dev` on :5173, the two accounts created, and
pip install playwright && playwright install chromium

Usage:
  OLS_E2E_USER1=user1name OLS_E2E_PASS1=... OLS_E2E_USER2=user2name OLS_E2E_PASS2=... \
  python3 scripts/e2e_smoke.py [--base http://localhost:5173] [--shots ./e2e-shots] [--image some.jpg]

user1 is the story author/inviter (desktop browser), user2 the invitee (mobile browser).
Screenshots may contain private story content: they are written OUTSIDE the repo by default
and must never be committed.
"""
import argparse
import asyncio
import os
import sys
import time

from playwright.async_api import async_playwright, expect

ok, failed = [], []


def check(name, cond, detail=''):
    (ok if cond else failed).append(name)
    print(('PASS ' if cond else 'FAIL ') + name + (f' — {detail}' if detail and not cond else ''))


async def login(page, base, user, pw):
    await page.goto(base + '/')
    await page.wait_for_url('**/login')
    await page.fill('input[name=username]', user)
    await page.fill('input[name=password]', pw)
    await page.click('button[type=submit]')
    await page.wait_for_url('**/story/1')


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://localhost:5173')
    ap.add_argument('--shots', default=os.path.expanduser('~/ols-e2e-shots'))
    ap.add_argument('--image', default=None, help='JPEG/PNG to upload in chat')
    ap.add_argument('--fonts', default=None, help='dir with local TTFs to use instead of Google Fonts')
    ap.add_argument('--phase', default='all', choices=['all', 'persist'])
    a = ap.parse_args()
    u1, p1 = os.environ['OLS_E2E_USER1'], os.environ['OLS_E2E_PASS1']
    u2, p2 = os.environ['OLS_E2E_USER2'], os.environ['OLS_E2E_PASS2']
    os.makedirs(a.shots, exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch()
        author_ctx = await browser.new_context(viewport={'width': 1440, 'height': 900})
        guest_ctx = await browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                                             is_mobile=True, has_touch=True)
        if a.fonts:
            css = ''.join(
                f"@font-face{{font-family:'{fam}';src:url(/__fonts/{f});font-style:{st};font-weight:100 900}}"
                for fam, f, st in [('Cormorant Garamond', 'cg.ttf', 'normal'), ('Cormorant Garamond', 'cgi.ttf', 'italic'),
                                   ('Patrick Hand', 'ph.ttf', 'normal'), ('Dancing Script', 'ds.ttf', 'normal'),
                                   ('Inter', 'inter.ttf', 'normal'), ('Caveat', 'cav.ttf', 'normal')])
            for ctx in (author_ctx, guest_ctx):
                await ctx.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(body=css, content_type='text/css'))
                await ctx.route('**/__fonts/*', lambda r: r.fulfill(path=os.path.join(a.fonts, r.request.url.rsplit('/', 1)[1])))
                await ctx.route('https://www.youtube.com/**', lambda r: r.abort())
        author = await author_ctx.new_page()
        guest = await guest_ctx.new_page()

        async def shot(page, name):
            await page.wait_for_timeout(900)
            await page.screenshot(path=os.path.join(a.shots, name + '.png'))

        if a.phase == 'persist':
            await login(author, a.base, u1, p1)
            await author.goto(a.base + '/story/8')
            log = author.locator('[role=log]')
            await expect(log).to_contain_text('E2E hello from user2', timeout=10000)
            check('messages persist after backend restart', True)
            await expect(log.locator('img').first).to_be_visible()
            check('image message persists after restart', True)
            await shot(author, '20-after-restart-desktop')
            await browser.close()
            return

        # --- auth ---
        await guest.goto(a.base + '/story/3')
        await guest.wait_for_url('**/login')
        check('unauthenticated user is redirected to /login', '/login' in guest.url)
        await guest.fill('input[name=username]', u2)
        await guest.fill('input[name=password]', 'definitely-wrong-password')
        await guest.click('button[type=submit]')
        await expect(guest.get_by_role('alert')).to_be_visible()
        check('wrong password shows an error', True)
        await shot(guest, '00-login-mobile')
        await login(guest, a.base, u2, p2)
        check('user2 can log in', guest.url.endswith('/story/1'))
        await login(author, a.base, u1, p1)
        check('user1 can log in', author.url.endswith('/story/1'))

        # --- cover + chapters (mobile) ---
        await shot(guest, '01-cover-closed-mobile')
        await guest.get_by_role('button', name='OPEN OUR STORY').click()
        await guest.wait_for_timeout(1700)
        await shot(guest, '02-cover-open-mobile')
        check('cover opens (button replaced by the swipe hint)', await guest.get_by_role('button', name='OPEN OUR STORY').count() == 0)
        names = ['03-ch02-match', '04-ch03-curious', '05-ch04-making-of', '06-ch05-letter', '07-ch06-unwritten', '08-ch07-invitation', '09-ch08-chat']
        for n in names:
            await guest.get_by_role('button', name='Next chapter').click()
            await guest.wait_for_timeout(800)
            await shot(guest, n + '-mobile')
        check('can page through all 8 chapters', guest.url.endswith('/story/8'))

        # swipe back (touch): pointer events right-to-left = next, left-to-right = previous
        await guest.goto(a.base + '/story/2')
        await guest.wait_for_timeout(600)
        box = await guest.locator('main').bounding_box()
        y = box['y'] + box['height'] * 0.6
        await guest.mouse.move(box['x'] + 320, y)
        await guest.mouse.down()
        await guest.mouse.move(box['x'] + 60, y, steps=8)
        await guest.mouse.up()
        await guest.wait_for_timeout(500)
        check('swipe left goes to the next chapter', guest.url.endswith('/story/3'), guest.url)

        # lightbox
        await guest.locator('button[aria-label]').filter(has=guest.locator('img')).first.click()
        await expect(guest.get_by_role('dialog', name='Photo viewer')).to_be_visible()
        await shot(guest, '10-lightbox-mobile')
        await guest.get_by_role('button', name='Next photo').click()
        await guest.get_by_role('button', name='Close photo viewer').click()
        check('photo viewer opens and closes', await guest.get_by_role('dialog').count() == 0)

        # letter: hold the wax seal, then take the letter out
        await guest.goto(a.base + '/story/5')
        seal = guest.locator('button[data-nonav]').first
        sb = await seal.bounding_box()
        await guest.mouse.move(sb['x'] + sb['width'] / 2, sb['y'] + sb['height'] / 2)
        await guest.mouse.down()
        await guest.wait_for_timeout(1700)
        await guest.mouse.up()
        await guest.wait_for_timeout(800)
        await guest.get_by_role('button', name='hoặc chạm vào đây').click()
        await guest.wait_for_timeout(1200)
        letter = guest.locator('article.unfold')
        check('wax seal breaks and the letter comes out', await letter.count() == 1)
        await shot(guest, '11-letter-open-mobile')

        # --- invitation workflow ---
        await guest.goto(a.base + '/story/7')
        await guest.get_by_role('button', name='MÌNH GẶP NHAU NHÉ!').click()
        await guest.wait_for_timeout(1800)
        check('invitee accepts → ticket shown', await guest.get_by_role('group', name='Vé: Our First Meet').count() == 1)
        await guest.locator('button[aria-pressed]').first.click()          # an activity
        days = guest.locator('[data-nonav] button[aria-pressed]')
        await days.nth(2).click()                                         # a day
        await guest.get_by_role('button', name='Buổi tối').click()        # a time slot
        await guest.locator('input[type=time]').fill('19:00')
        await guest.locator('input[maxlength="200"]').fill('E2E test place')
        await guest.locator('button.btn', has_text='Gửi gợi ý').click()
        await expect(guest.get_by_text('Đã ghi lại rồi nhé!')).to_be_visible()
        check('invitee sends a proposal', True)
        await shot(guest, '12-invitation-proposal-mobile')

        await author.goto(a.base + '/story/7')
        await expect(author.get_by_role('button', name='Mình đồng ý với gợi ý này')).to_be_visible(timeout=10000)
        check('ticket not confirmed before both agree', await author.get_by_text('Waiting to be written').count() == 1)
        await author.get_by_role('button', name='Mình đồng ý với gợi ý này').click()
        await expect(author.get_by_text('Written by both of us ✓')).to_be_visible()
        check('plan confirmed only after both agreed to the same proposal', True)
        await shot(author, '13-invitation-confirmed-desktop')

        # --- chat ---
        await author.goto(a.base + '/story/8')
        await guest.goto(a.base + '/story/8')
        await expect(author.get_by_text('đang online')).to_be_visible(timeout=15000)
        check('presence: user1 sees user2 online', True)
        box = guest.get_by_role('textbox', name='Tin nhắn')
        await box.fill('E')
        await box.type('2E typing', delay=40)
        await expect(author.get_by_text('đang viết')).to_be_visible(timeout=5000)
        check('typing indicator reaches the other user', True)
        await box.fill('E2E hello from user2 ' + time.strftime('%H:%M:%S'))
        await box.press('Enter')
        await expect(author.locator('[role=log]')).to_contain_text('E2E hello from user2', timeout=8000)
        check('real-time message user2 → user1', True)
        hbox = author.get_by_role('textbox', name='Tin nhắn')
        await hbox.fill('E2E reply from user1 ✨')
        await author.get_by_role('button', name='Gửi', exact=True).click()
        await expect(guest.locator('[role=log]')).to_contain_text('E2E reply from user1 ✨', timeout=8000)
        check('real-time message user1 → user2', True)
        await expect(guest.locator('[role=log]')).to_contain_text('đã xem', timeout=8000)
        check('read receipt shown to the sender', True)

        if a.image:
            await guest.locator('input[type=file]').set_input_files(a.image)
            await expect(guest.get_by_text('Ảnh sẵn sàng để gửi')).to_be_visible(timeout=10000)
            await box.fill('E2E photo')
            await box.press('Enter')
            await expect(author.locator('[role=log] img')).to_have_count(1, timeout=10000)
            src = await author.locator('[role=log] img').first.get_attribute('src')
            check('image upload + delivery', bool(src and '/api/images/' in src), str(src))

        await guest.get_by_role('button', name='Leave a little note').click()
        await guest.locator('textarea').fill('E2E little note')
        await guest.get_by_role('button', name='Dán vào cuộc trò chuyện').click()
        await expect(author.locator('[role=log]')).to_contain_text('E2E little note', timeout=8000)
        check('note message delivered', True)
        await shot(guest, '14-chat-mobile')
        await shot(author, '15-chat-desktop')

        # desktop renders of a few chapters
        for n, name in [(1, '16-cover-desktop'), (3, '17-ch03-desktop'), (5, '18-letter-desktop')]:
            await author.goto(a.base + f'/story/{n}')
            await shot(author, name)

        # logout
        await author.get_by_role('button', name='All chapters').click()
        await author.get_by_role('button', name='ĐĂNG XUẤT').click()
        await author.wait_for_url('**/login')
        check('logout returns to the login page', True)
        await browser.close()

    print(f'\n{len(ok)} passed, {len(failed)} failed')
    if failed:
        print('Failed:', ', '.join(failed))
        sys.exit(1)


if __name__ == '__main__':
    asyncio.run(main())
