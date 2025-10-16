import React, { useMemo } from 'react'
import './DecorativeBackground.css'

const DecorativeBackground = () => {
  const dots = useMemo(() => {
    const arr = []
    const colors = ['rgba(255,255,255,0.12)', 'rgba(235,229,255,0.12)', 'rgba(240,240,255,0.08)']
    for (let i = 0; i < 45; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 92, // avoid bottom 8% where footer/cards could be
        size: 6 + Math.random() * 18,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    return arr
  }, [])

  const leaves = useMemo(() => {
    const arr = []
    for (let i = 0; i < 12; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 10,
        scale: 0.6 + Math.random() * 0.8
      })
    }
    return arr
  }, [])

  return (
    <div className="decorative-bg" aria-hidden>
      <div className="decorative-dots">
        {dots.map(d => (
          <span
            key={d.id}
            className="decor-dot"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              background: d.color,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`
            }}
          />
        ))}
      </div>

      <div className="decorative-leaves">
        {leaves.map(l => (
          <svg
            key={l.id}
            className="decor-leaf"
            style={{ left: `${l.left}%`, animationDelay: `${l.delay}s`, animationDuration: `${l.duration}s`, transform: `scale(${l.scale})` }}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2c2 2 4 4 4 7s-2 5-4 7-4 3-4 0 0-7 4-14z" fill="#efe6ff" />
          </svg>
        ))}
      </div>
    </div>
  )
}

export default DecorativeBackground
