const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * Generates `length` random uppercase letters, avoiding immediate repeats
 * so the game never asks the player to press the same key twice in a row.
 */
export function generateSequence(length = 20): string[] {
  const sequence: string[] = [];
  for (let i = 0; i < length; i++) {
    let next: string;
    do {
      next = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    } while (sequence[i - 1] === next);
    sequence.push(next);
  }
  return sequence;
}
