import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StoryProvider } from '../story/StoryContext'
import LetterDesktop from './desktop/LetterDesktop'
import LetterChapter from './LetterChapter'
import type { ChapterProps, LetterSeal } from './types'

/**
 * The letter's seal state lives in StoryLayout and is passed to whichever layout is
 * shown, so switching between mobile and desktop must show the letter in the same state.
 * (Without a story loaded, t(key) renders ⟨key⟩, which is what we look for.)
 */
const props = (letter: LetterSeal): ChapterProps => ({
  turn: '',
  next: () => undefined,
  go: () => undefined,
  openPhoto: () => undefined,
  coverOpen: true,
  openCover: () => undefined,
  closeCover: () => undefined,
  letter,
  setLetter: () => undefined,
  unwrittenOpen: false,
  openUnwritten: () => undefined,
})
const render = (View: (p: ChapterProps) => React.JSX.Element, letter: LetterSeal) =>
  renderToStaticMarkup(createElement(StoryProvider, null, createElement(View, props(letter))))

describe('letter state shared by both layouts', () => {
  for (const [name, View] of [['mobile', LetterChapter], ['desktop', LetterDesktop]] as const) {
    it(`${name}: an opened letter stays open (no seal, letter + fold-back shown)`, () => {
      const html = render(View, 'out')
      expect(html).toContain('⟨c05.012⟩') // the letter article
      expect(html).toContain('⟨c05.039⟩') // fold it back
      expect(html).not.toContain('⟨c05.006⟩') // no wax seal button
    })
    it(`${name}: a sealed letter shows the wax seal`, () => {
      const html = render(View, 'sealed')
      expect(html).toContain('⟨c05.006⟩')
      expect(html).not.toContain('⟨c05.012⟩')
    })
    it(`${name}: a peeking letter can be pulled out`, () => {
      const html = render(View, 'peek')
      expect(html).toContain('⟨c05.010⟩')
      expect(html).toContain('⟨c05.011⟩')
    })
  }
})
