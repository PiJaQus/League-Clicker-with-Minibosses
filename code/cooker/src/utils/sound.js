//AudioContext (linia 2-12)
// Tworzy kontekst audio przeglądarki — to jest "urządzenie" które generuje dźwięki.
// Inicjalizuje się przy pierwszym kliknięciu.
let ctx
function ac() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('[sound] AudioContext not available:', e)
      return null
    }
  }
  return ctx
}

function resumeContext() {
  const audio = ac()
  if (audio && audio.state === 'suspended') {
    audio.resume().catch(e => console.warn('[sound] resume failed:', e))
  }
}
//Oscillator (linia 26)
// Generuje falę dźwiękową o określonej częstotliwości (Hz).
// Rodzaje fal:
// 'sine' — gładki, miękki dźwięk (jak fala sinusoidalna)
// 'square' — ostry, metaliczny dźwięk
// 'sawtooth' — szorstki, brzęczący dźwięk
// 'triangle' — pośrodku między sine i square
function beep({ freq = 440, duration = 90, type = 'sine', gain = 0.03 } = {}) {
  const audio = ac()
  if (!audio) return
  resumeContext()
  const now = audio.currentTime
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(gain * 1.5, now + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration / 1000)
  osc.connect(g).connect(audio.destination)
  osc.start()
  osc.stop(now + duration / 1000 + 0.05)
}

export function playClickSound() {
  try {
    beep({ freq: 250, duration: 40, type: 'sine', gain: 0.08 })
  } catch (e) {
    console.warn('[sound] click failed:', e)
  }
}

export function playBuySound() {
  try {
    beep({ freq: 320, duration: 110, type: 'sawtooth', gain: 0.08 })
  } catch (e) {
    console.warn('[sound] buy failed:', e)
  }
}
