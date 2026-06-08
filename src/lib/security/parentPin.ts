/** Casual child-safety PIN hashing — not cryptographic account security. */

const PIN_LENGTH = 4

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

function toBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function bytesToHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function generateParentPinSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return bytesToHex(bytes.buffer)
}

export async function hashParentPin(
  pin: string,
  salt: string,
): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error('PIN must be exactly 4 digits')
  }

  const digest = await crypto.subtle.digest(
    'SHA-256',
    toBytes(`${salt}:${pin}`),
  )
  return bytesToHex(digest)
}

export async function verifyParentPin(
  pin: string,
  salt: string | null,
  hash: string | null,
): Promise<boolean> {
  if (!salt || !hash || !isValidPin(pin)) {
    return false
  }

  const candidate = await hashParentPin(pin, salt)
  return candidate === hash
}

export { PIN_LENGTH }
