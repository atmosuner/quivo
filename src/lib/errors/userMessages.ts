/** Map engine/service errors to child-friendly copy for UI surfaces. */
export function toUserErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  const msg = raw.toLowerCase()

  if (msg.includes('insufficient coins')) {
    return 'Not enough coins for this reward.'
  }
  if (msg.includes('pages must be positive') || msg.includes('invalid page log')) {
    return 'Enter a valid number of pages to log.'
  }
  if (msg.includes('book already complete')) {
    return 'This book is already finished.'
  }
  if (msg.includes('pin must be exactly 4 digits')) {
    return 'PIN must be exactly 4 digits.'
  }
  if (msg.includes('not found')) {
    return 'We could not find that item. It may have been removed.'
  }
  if (msg.includes('unsupported schema')) {
    return 'Saved data uses an older format and was reset to the demo family.'
  }
  if (msg.includes('corrupt') || msg.includes('invalid')) {
    return 'Local data was damaged and has been restored from the demo family.'
  }

  return raw
}
