import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { isDemoMode, storage } from './firebase'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Downscale in the browser before upload. Suppliers upload straight off their
 * phones, and a 6 MB photo costs them data and costs us storage for no visible
 * gain — 1600px wide is plenty for the gallery.
 */
async function shrink(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  if (bitmap.width <= maxWidth) return file
  const scale = maxWidth / bitmap.width
  const canvas = document.createElement('canvas')
  canvas.width = maxWidth
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), 'image/jpeg', quality)
  })
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(blob)
  })
}

export async function uploadListingImage(file: File, ownerId: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Please use a JPG, PNG or WebP image.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('That image is larger than 5 MB. Please use a smaller file.')
  }

  const blob = await shrink(file)

  // Demo mode has no Storage bucket, so the image is inlined as a data URL and
  // lives in localStorage with the rest of the demo data.
  if (isDemoMode) return toDataUrl(blob)

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = `listings/${ownerId}/${Date.now()}-${safeName}`
  const result = await uploadBytes(ref(storage(), path), blob, { contentType: 'image/jpeg' })
  return getDownloadURL(result.ref)
}
