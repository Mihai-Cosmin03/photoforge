import { useRef, useEffect, useCallback, useMemo } from 'react'

export function useShutterSound(enabled = true) {
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!enabled) return null
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }, [enabled])

  useEffect(() => () => { ctxRef.current?.close(); ctxRef.current = null }, [])

  const shutter = useCallback((vol = 0.3) => {
    const ctx = getCtx(); if (!ctx) return
    const t = ctx.currentTime
    // Two percussive clicks
    for (let i = 0; i < 2; i++) {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let j = 0; j < d.length; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / d.length, 8)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(vol, t + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.06 + 0.04)
      src.connect(gain).connect(ctx.destination)
      src.start(t + i * 0.06)
    }
  }, [getCtx])

  const flash = useCallback((vol = 0.2) => {
    const ctx = getCtx(); if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.25)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.3)
  }, [getCtx])

  const film = useCallback((vol = 0.25) => {
    const ctx = getCtx(); if (!ctx) return
    const t = ctx.currentTime
    const len = ctx.sampleRate * 0.3
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(vol, t + 0.05)
    gain.gain.linearRampToValueAtTime(vol, t + 0.2)
    gain.gain.linearRampToValueAtTime(0, t + 0.3)
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start(t)
  }, [getCtx])

  const beep = useCallback((vol = 0.2) => {
    const ctx = getCtx(); if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.linearRampToValueAtTime(1200, t + 0.1)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.12)
  }, [getCtx])

  const tick = useCallback((vol = 0.15) => {
    const ctx = getCtx(); if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 1000
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t); osc.stop(t + 0.03)
  }, [getCtx])

  // useMemo so the returned object has a stable reference across renders.
  // Without this, any useEffect that has `sfx` in its deps would re-fire every
  // time the consuming component re-renders, resetting timers / intervals.
  return useMemo(() => ({ shutter, flash, film, beep, tick }), [shutter, flash, film, beep, tick])
}

export default useShutterSound
