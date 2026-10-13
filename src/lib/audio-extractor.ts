/**
 * Audio Extractor utility
 * Extracts audio tracks from video files (MP4, WebM, MOV, YouTube video files) directly in the browser
 * and parses YouTube metadata.
 */

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  author: string
  thumbnailUrl: string
  url: string
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  const trimmed = url.trim()

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Fetches YouTube video metadata using oEmbed (free, CORS-enabled, official YouTube API)
 */
export async function fetchYouTubeInfo(url: string): Promise<YouTubeVideoInfo | null> {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`

  try {
    const res = await fetch(oembedUrl)
    if (!res.ok) {
      // Fallback to noembed
      const noembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(canonicalUrl)}`)
      if (noembedRes.ok) {
        const data = await noembedRes.json()
        return {
          videoId,
          title: data.title || `YouTube Video (${videoId})`,
          author: data.author_name || 'YouTube',
          thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          url: canonicalUrl,
        }
      }
      return {
        videoId,
        title: `YouTube Video (${videoId})`,
        author: 'YouTube',
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url: canonicalUrl,
      }
    }

    const data = await res.json()
    return {
      videoId,
      title: data.title || `YouTube Video (${videoId})`,
      author: data.author_name || 'YouTube',
      thumbnailUrl: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      url: canonicalUrl,
    }
  } catch (err) {
    console.warn('Failed to fetch YouTube oEmbed info:', err)
    return {
      videoId,
      title: `YouTube Video (${videoId})`,
      author: 'YouTube',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      url: canonicalUrl,
    }
  }
}

/**
 * Converts an AudioBuffer into a valid 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  // Interleave channels if stereo, or use single channel if mono
  let interleaved: Float32Array
  if (numChannels === 2) {
    const left = buffer.getChannelData(0)
    const right = buffer.getChannelData(1)
    interleaved = new Float32Array(left.length + right.length)
    for (let i = 0; i < left.length; i++) {
      interleaved[i * 2] = left[i]
      interleaved[i * 2 + 1] = right[i]
    }
  } else {
    interleaved = buffer.getChannelData(0)
  }

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = interleaved.length * bytesPerSample
  const bufferSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')

  /* "fmt " sub-chunk */
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true) // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)

  /* "data" sub-chunk */
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  /* Write 16-bit PCM audio samples */
  let offset = 44
  for (let i = 0; i < interleaved.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, interleaved[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

/**
 * Extracts audio track from any video file (MP4, WebM, MOV, etc.) directly in the browser
 * using Web Audio API decoding.
 */
export async function extractAudioFromVideoFile(
  videoFile: File,
  onProgress?: (message: string) => void
): Promise<{ blob: Blob; duration: number }> {
  onProgress?.('Reading video file...')
  const arrayBuffer = await videoFile.arrayBuffer()

  onProgress?.('Decoding audio track from video...')
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const audioContext = new AudioCtx()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    onProgress?.('Encoding high-quality audio...')
    const wavBlob = audioBufferToWav(audioBuffer)
    return {
      blob: wavBlob,
      duration: audioBuffer.duration,
    }
  } finally {
    try {
      await audioContext.close()
    } catch {}
  }
}
