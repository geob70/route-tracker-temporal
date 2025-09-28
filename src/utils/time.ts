export function convertSecondsToMinutesText(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function convertSecondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}
