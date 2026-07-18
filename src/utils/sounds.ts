// Sound generation using Web Audio API
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Create oscillator for click sound
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // Short, quick beep
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}

export function playCorrectSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Two ascending tones for "correct" feedback
    const frequencies = [523.25, 659.25] // C5, E5
    const duration = 0.15

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      const startTime = now + index * duration
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      osc.start(startTime)
      osc.stop(startTime + duration)
    })
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}

export function playIncorrectSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Descending buzz for "incorrect" feedback
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    osc.start(now)
    osc.stop(now + 0.3)
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}

export function playGameOverSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Victory fanfare (ascending tones)
    const frequencies = [392, 440, 494, 523.25, 587.33] // G4, A4, B4, C5, D5
    const duration = 0.2

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      const startTime = now + index * duration
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      osc.start(startTime)
      osc.stop(startTime + duration)
    })
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}

export function playNextQuestionSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Quick ascending beep
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(587.33, now + 0.1)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

    osc.start(now)
    osc.stop(now + 0.1)
  } catch (e) {
    // Silently fail if audio context unavailable
  }
}
