const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
]

function detectMimeType(): string {
  for (const type of PREFERRED_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return ''
}

export function getAudioFormat(): string {
  const mime = detectMimeType()
  if (mime.includes('webm')) return 'audio/webm'
  if (mime.includes('mp4')) return 'audio/mp4'
  if (mime.includes('ogg')) return 'audio/ogg'
  return 'audio/webm'
}

export interface RecorderHandle {
  stop: () => Promise<Blob>
  stream: MediaStream
}

export async function startRecording(): Promise<RecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })

  const mimeType = detectMimeType()
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  // Collect data every second for reliability
  recorder.start(1000)

  return {
    stream,
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const format = getAudioFormat()
          resolve(new Blob(chunks, { type: format }))
        }
        recorder.stop()
        stream.getTracks().forEach((t) => t.stop())
      }),
  }
}
