import { useState, useRef, useEffect } from 'react'
import './BlurImage.css'

/**
 * BlurImage — loads images with a shimmer placeholder and fades in sharply on load.
 *
 * Props:
 *   src, alt, className — standard img props
 *   wrapperClassName    — class on the wrapper div
 *   aspectRatio         — e.g. "4/3" or "3/2"; leave undefined for natural ratio
 *   objectFit           — "cover" (default) | "contain"
 */
export default function BlurImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  aspectRatio,
  objectFit = 'cover',
  style,
  onClick,
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(false)
  const imgRef              = useRef(null)

  // Handle case where image is already cached
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true)
  }, [src])

  return (
    <div
      className={`blur-img-wrap ${loaded ? 'blur-img-wrap--loaded' : ''} ${wrapperClassName}`}
      style={{ aspectRatio, ...style }}
      onClick={onClick}
    >
      {/* Shimmer skeleton shown before load */}
      {!loaded && !error && <div className="blur-img-shimmer" aria-hidden="true" />}

      {error ? (
        <div className="blur-img-error" aria-label="Image failed to load" />
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`blur-img ${loaded ? 'blur-img--visible' : ''} ${className}`}
          style={{ objectFit }}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true) }}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}
