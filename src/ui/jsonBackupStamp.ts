const PREFIX = "storybook-ai.last-json-backup.";

export function lastJsonBackupKey(bookId: string): string {
  return `${PREFIX}${bookId}`;
}

export function readLastJsonBackup(bookId: string): string | null {
  try {
    const value = localStorage.getItem(lastJsonBackupKey(bookId));
    return value ? value : null;
  } catch {
    return null;
  }
}

export function recordLastJsonBackup(bookId: string, at: string): void {
  try {
    localStorage.setItem(lastJsonBackupKey(bookId), at);
  } catch {
    /* private mode */
  }
}

export function forgetLastJsonBackup(bookId: string): void {
  try {
    localStorage.removeItem(lastJsonBackupKey(bookId));
  } catch {
    /* private mode */
  }
}
