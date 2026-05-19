import { useRef, useCallback } from 'react'

/**
 * Returns { ref, onMouseMove, onMouseLeave } to attach to any card element.
 * Applies a CSS 3D tilt + glare effect that tracks the mouse.
 *
 * @param {number} strength  max rotation in degrees (default 10)
 * @param {number} glare     0–1 glare opacity max (default 0.18)
 */
export function use3DTilt(strength = 10, glare = 0.18) {
  const ref = useRef(null)

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)   // -1 … +1
      const dy = (e.clientY - cy) / (rect.height / 2)  // -1 … +1

      const rotX = -dy * strength
      const rotY = dx * strength

      // Glare angle: follow the light source
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`
      el.style.transition = 'transform 0.08s linear'

      // Glare layer via CSS custom properties
      el.style.setProperty('--glare-angle', `${angle}deg`)
      el.style.setProperty('--glare-opacity', `${glare}`)
    },
    [strength, glare],
  )

  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    el.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    el.style.setProperty('--glare-opacity', '0')
  }, [])

  return { ref, onMouseMove, onMouseLeave }
}
