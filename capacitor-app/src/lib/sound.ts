// iOS-style tri-tone notification sound using Web Audio API
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Create master gain
    const masterGain = ctx.createGain()
    masterGain.gain.value = 0.3
    masterGain.connect(ctx.destination)

    // iOS tri-tone frequencies
    const frequencies = [1046.5, 1318.5, 1568] // C6, E6, G6

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = freq

      // Envelope
      const startTime = now + index * 0.1
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15)

      oscillator.connect(gainNode)
      gainNode.connect(masterGain)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.2)
    })
  } catch (error) {
    console.log('[GhostPeek] Audio not available:', error)
  }
}

// Preload audio context on user interaction
export function initAudio() {
  document.addEventListener('touchstart', () => {
    if (!audioContext) {
      getAudioContext()
    }
  }, { once: true })
}
