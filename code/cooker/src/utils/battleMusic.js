// Battle Music Generator using Web Audio API
let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      console.warn('[battleMusic] AudioContext not available:', e)
      return null
    }
  }
  return audioContext
}

// Helper to check if sound is enabled
function isSoundEnabled() {
  try {
    // Try to get the store if available
    const store = localStorage.getItem('lol_cooker_v1')
    if (store) {
      const parsed = JSON.parse(store)
      return parsed.settings?.sound !== false // default to true if not set
    }
    return true // default to enabled
  } catch (e) {
    return true // default to enabled if error
  }
}

function resumeContext() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(e => console.warn('[battleMusic] resume failed:', e))
  }
}

// Play a single note
function playNote(frequency, duration, type = 'sine', gain = 0.1) {
  const ctx = getAudioContext()
  if (!ctx) return

  resumeContext()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()

  osc.type = type
  osc.frequency.value = frequency

  // Envelope: attack, sustain, release
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(gain, now + 0.01)
  g.gain.setValueAtTime(gain, now + duration - 0.1)
  g.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(g).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration)
}

// Battle theme - epic boss fight music
export function playBattleMusic() {
  try {
    if (!isSoundEnabled()) return
    resumeContext()
    const ctx = getAudioContext()
    if (!ctx) return

    // Simple battle theme pattern - QUIET
    const now = ctx.currentTime
    const tempo = 0.3 // seconds per beat

    // Bass line (low, powerful) - VERY QUIET
    const bassNotes = [82.41, 82.41, 110, 110, 82.41, 82.41, 110, 110] // E2, E2, A2, A2
    bassNotes.forEach((freq, i) => {
      playNote(freq, tempo * 0.9, 'sine', 0.03)
      setTimeout(() => {}, (i + 1) * tempo * 1000)
    })

    // Melody line (higher, heroic) - VERY QUIET
    setTimeout(() => {
      const melodyNotes = [330, 330, 392, 392, 330, 330, 392, 392] // E4, E4, G4, G4
      melodyNotes.forEach((freq, i) => {
        playNote(freq, tempo * 0.8, 'square', 0.02)
        setTimeout(() => {}, (i + 1) * tempo * 1000)
      })
    }, 100)

    // Harmony line (middle, supporting) - VERY QUIET
    setTimeout(() => {
      const harmonyNotes = [196, 196, 220, 220, 196, 196, 220, 220] // G3, G3, A3, A3
      harmonyNotes.forEach((freq, i) => {
        playNote(freq, tempo * 0.85, 'triangle', 0.01)
        setTimeout(() => {}, (i + 1) * tempo * 1000)
      })
    }, 50)
  } catch (e) {
    console.warn('[battleMusic] playBattleMusic failed:', e)
  }
}

// Victory fanfare - triumphant sound
export function playVictoryFanfare() {
  try {
    if (!isSoundEnabled()) return
    resumeContext()
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const beatDuration = 0.2

    // Triumphant ascending notes
    const victoryNotes = [
      { freq: 330, duration: beatDuration },      // E4
      { freq: 392, duration: beatDuration },      // G4
      { freq: 494, duration: beatDuration },      // B4
      { freq: 587.33, duration: beatDuration * 2 } // D5 - held longer
    ]

    victoryNotes.forEach((note, i) => {
      const delay = victoryNotes.slice(0, i).reduce((sum, n) => sum + n.duration, 0)
      setTimeout(() => {
        playNote(note.freq, note.duration, 'sine', 0.12)
      }, delay * 1000)
    })
  } catch (e) {
    console.warn('[battleMusic] playVictoryFanfare failed:', e)
  }
}

// Defeat sound - sad, descending
export function playDefeatSound() {
  try {
    if (!isSoundEnabled()) return
    resumeContext()
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const beatDuration = 0.3

    // Sad descending notes
    const defeatNotes = [
      { freq: 392, duration: beatDuration },      // G4
      { freq: 349.23, duration: beatDuration },   // F4
      { freq: 293.66, duration: beatDuration },   // D4
      { freq: 246.94, duration: beatDuration * 2 } // B3 - held longer
    ]

    defeatNotes.forEach((note, i) => {
      const delay = defeatNotes.slice(0, i).reduce((sum, n) => sum + n.duration, 0)
      setTimeout(() => {
        playNote(note.freq, note.duration, 'sine', 0.1)
      }, delay * 1000)
    })
  } catch (e) {
    console.warn('[battleMusic] playDefeatSound failed:', e)
  }
}

// Boss attack warning sound
export function playBossAttackWarning() {
  try {
    if (!isSoundEnabled()) return
    resumeContext()
    const ctx = getAudioContext()
    if (!ctx) return

    // Quick, intense warning beep
    playNote(587.33, 0.1, 'square', 0.12) // D5
    setTimeout(() => playNote(587.33, 0.1, 'square', 0.12), 150)
    setTimeout(() => playNote(659.25, 0.15, 'square', 0.14), 300) // E5
  } catch (e) {
    console.warn('[battleMusic] playBossAttackWarning failed:', e)
  }
}

// Player hit sound
export function playPlayerHitSound() {
  try {
    if (!isSoundEnabled()) return
    resumeContext()
    const ctx = getAudioContext()
    if (!ctx) return

    // Painful, descending sound
    playNote(440, 0.05, 'sawtooth', 0.1) // A4
    setTimeout(() => playNote(392, 0.1, 'sawtooth', 0.08), 50) // G4
  } catch (e) {
    console.warn('[battleMusic] playPlayerHitSound failed:', e)
  }
}
