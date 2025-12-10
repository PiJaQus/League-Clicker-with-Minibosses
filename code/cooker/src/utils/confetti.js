let styleInjected = false

function injectStyle() {
  if (styleInjected) return
  styleInjected = true
  const css = `
  @keyframes cookie-confetti-pop { 
    0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
    80% { opacity: 1; }
    100% { transform: translate(var(--tx, 0), var(--ty, -120px)) rotate(var(--rot, 180deg)); opacity: 0; }
  }`
  const s = document.createElement('style')
  s.id = 'cookie-confetti-style'
  s.textContent = css
  document.head.appendChild(s)
}

const COLORS = ['#ff7ac6', '#ffd166', '#8ec5ff', '#7cfc9a', '#fff176', '#fca5a5']

export function confettiAt(x, y, opts = {}) {
  if (typeof document === 'undefined') return
  injectStyle()
  const { count = 24, spread = 80, size = 8, duration = 900, imageUrl = null } = opts

  const wrap = document.createElement('div')
  wrap.style.position = 'fixed'
  wrap.style.left = `${x}px`
  wrap.style.top = `${y}px`
  wrap.style.pointerEvents = 'none'
  wrap.style.width = '0'
  wrap.style.height = '0'
  document.body.appendChild(wrap)

  for (let i = 0; i < count; i++) {
    const p = document.createElement(imageUrl ? 'img' : 'i')
    const angle = (Math.random() - 0.5) * (Math.PI * 2 * (spread / 360))
    const distance = 60 + Math.random() * 60
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * -distance
    const rot = (Math.random() * 360).toFixed(0) + 'deg'

    p.style.position = 'absolute'
    p.style.width = `${size}px`
    p.style.height = `${size}px`
    p.style.transform = 'translate(-50%, -50%)'
    p.style.setProperty('--tx', `${tx}px`)
    p.style.setProperty('--ty', `${ty}px`)
    p.style.setProperty('--rot', rot)
    p.style.animation = `cookie-confetti-pop ${duration}ms ease-out forwards`
    
    if (imageUrl) {
      p.src = imageUrl
      p.style.borderRadius = '8px'
      p.style.objectFit = 'cover'
    } else {
      p.style.background = COLORS[(Math.random() * COLORS.length) | 0]
      p.style.height = `${size * (0.6 + Math.random() * 0.8)}px`
      p.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%'
    }
    
    wrap.appendChild(p)
  }

  setTimeout(() => {
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap)
  }, duration + 50)
}

export function confettiCenter(opts = {}) {
  const x = window.innerWidth / 2
  const y = window.innerHeight / 2
  confettiAt(x, y, opts)
}
