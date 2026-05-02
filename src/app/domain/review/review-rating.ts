import type { ReviewNote } from '../models';

/** Average of the four note dimensions (0–5). */
export function averageNote(note: ReviewNote): number {
  const n = (note.service + note.food + note.value + note.atmosphere) / 4;
  return Math.round(n * 10) / 10;
}
