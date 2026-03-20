import { useEffect, useRef, useState } from 'react'

// Wrap each page in this for fade+slide transitions
export default function PageTransition({ children, pageKey }) {
  const [visible, setVisible] = useState(false)
  const [style, setStyle] = useState({ opacity: 0, transform: 'translateY(12px)' })
  const prev = useRef(pageKey)

  useEffect(() => {
    // When pageKey changes: fade out then fade in
    if (prev.current !== pageKey) {
      setStyle({ opacity: 0, transform: 'translateY(12px)' })
      prev.current = pageKey
      const t = setTimeout(() => {
        setStyle({ opacity: 1, transform: 'translateY(0)' })
      }, 80)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setStyle({ opacity: 1, transform: 'translateY(0)' })
      }, 30)
      return () => clearTimeout(t)
    }
  }, [pageKey])

  return (
    <div
      style={{
        ...style,
        transition: 'opacity 220ms ease, transform 220ms ease',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}
