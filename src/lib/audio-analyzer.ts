export interface AudioAnalyzer {
  getLevel: () => number
  destroy: () => void
}

export function createAudioAnalyzer(stream: MediaStream): AudioAnalyzer {
  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.5
  source.connect(analyser)

  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  return {
    getLevel: () => {
      analyser.getByteTimeDomainData(dataArray)
      // RMS level from time-domain data (much more responsive than frequency)
      let sumSquares = 0
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128
        sumSquares += normalized * normalized
      }
      const rms = Math.sqrt(sumSquares / dataArray.length)
      // Boost and clamp to 0-1 (voice typically sits around 0.05-0.3 RMS)
      return Math.min(1, rms * 4)
    },
    destroy: () => {
      source.disconnect()
      ctx.close()
    },
  }
}
