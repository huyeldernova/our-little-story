# Story content (private)

All personal content — letters, captions, the chat transcript in chapter 02, names, photos and
the music choice — lives in **one private folder** that is never committed:

```
story-private/
├── story.json
└── assets/
    ├── profile-1.jpg  profile-2.jpg  writer.jpg
    ├── aodai.jpg  balcony.jpg  plants.jpg  matcha.jpg  sunglasses.jpg  bench.jpg  aquarium.jpg  croissant.jpg
    └── shot-cover-closed.jpg  shot-cover-open.jpg  shot-ch02.jpg  shot-ch03.jpg  shot-mobile-cover.jpg
```

Point the backend at it with `OLS_STORY_DIR=/absolute/path/to/story-private`. Without it (local
profile) the backend serves `story-example/`, which has the same keys with placeholder text and
placeholder images.

Only signed-in users can read it (`GET /api/story`, `GET /api/story/assets/{file}`).
File names must match `[A-Za-z0-9._-]` and end in jpg/jpeg/png/webp/gif/mp3/m4a/ogg.

## story.json

| Field | Meaning |
|-------|---------|
| `music.youtubeVideoId` | YouTube video id played by the embedded player (empty = no music button) |
| `chapterTitles` | 8 titles for the header and chapter list |
| `texts` | every text in the chapters, keyed `cNN.MMM` (chapter number, then order of appearance) |
| `lightbox` | the 8 photos of chapter 03's viewer: `{asset, label (alt text), caption, pos}` |
| `avatars` | `username → asset` used in the chat header |
| `letter` | dynamic lines of the letter chapter (`subSealed`, `subPeek`, `subOut`, `holdIdle`, `holdActive`) |
| `invite.activities` | the activity chips in the invitation form |

To change a sentence, search for it in `story.json` and edit the value; reload the page — no
rebuild needed. Keys that are missing render as `⟨key⟩` so they are easy to spot.
Photo files referenced by the chapters are fixed by name (see the list above); replace a file to
change a photo.
