const normalizeBase64 = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4

  return padding === 0 ? normalized : `${normalized}${'='.repeat(4 - padding)}`
}

export function toByteArray(value: string) {
  const binary = atob(normalizeBase64(value))
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

export function fromByteArray(value: Uint8Array) {
  const chunkSize = 0x8000
  const chunks: string[] = []

  for (let index = 0; index < value.length; index += chunkSize) {
    const chunk = value.subarray(index, index + chunkSize)
    chunks.push(String.fromCharCode(...chunk))
  }

  return btoa(chunks.join(''))
}

export function byteLength(value: string) {
  return toByteArray(value).byteLength
}

export default {
  byteLength,
  fromByteArray,
  toByteArray,
}
