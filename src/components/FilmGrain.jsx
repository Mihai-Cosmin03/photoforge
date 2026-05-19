import { useEffect, useRef } from 'react'
import './FilmGrain.css'

export default function FilmGrain({ opacity = 0.032, speed = 3 }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const frameRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      // Use a small internal resolution for performance; CSS scales it up
      canvas.width  = Math.ceil(window.innerWidth  / 2)
      canvas.height = Math.ceil(window.innerHeight / 2)
    }
    resize()

    const draw = () => {
      frameRef.current++
      // Only redraw every `speed` frames to reduce CPU usage
      if (frameRef.current % speed !== 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const { width, height } = canvas
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i]     = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [speed])

  return (
    <canvas
      ref={canvasRef}
      className="film-grain"
      style={{ opacity }}
      aria-hidden="true"
    />
  )
}
