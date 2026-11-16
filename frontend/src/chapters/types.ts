/** Wax-seal letter (chapter 05); shared by both layouts. */
export type LetterSeal = 'sealed' | 'cracking' | 'peek' | 'out'

export type ChapterProps = {
  /** 'turn-next' | 'turn-prev': page-turn animation class from the design. */
  turn: string
  next: () => void
  go: (index: number) => void
  openPhoto: (index: number) => void
  /** Cover state lives in the layout so it survives chapter changes. */
  coverOpen: boolean
  openCover: () => void
  /** Desktop cover has an open / close toggle. */
  closeCover: () => void
  /** Letter state lives in the layout so resizing between mobile and desktop keeps it. */
  letter: LetterSeal
  setLetter: (s: LetterSeal) => void
  /** Chapter 06 envelope (opened once, shared by both layouts). */
  unwrittenOpen: boolean
  openUnwritten: () => void
}
