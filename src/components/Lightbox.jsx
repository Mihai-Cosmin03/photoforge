import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Lightbox.css'

const overlayVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.25 } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
}

const imageVariants = {
  enter: (dir) => ({
    opacity: 0,
    scale: 0.88,
    rotateY: dir > 0 ? 14 : -14,
    x: dir > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 28 },
  },
  exit: (dir) => ({
    opacity: 0,
    scale: 0.88,
    rotateY: dir > 0 ? -14 : 14,
    x: dir > 0 ? -60 : 60,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  }),
}

export default function Lightbox({ images, index, onClose, onNext, onPrev, direction = 1 }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'Escape')     onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onNext, onPrev, onClose])

  return createPortal(
    <motion.div
      className="lightbox-overlay"
      variants={overlayVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
    >
      <motion.button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close"
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        ✕
      </motion.button>

      <motion.button
        className="lightbox-prev"
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        aria-label="Previous image"
        whileHover={{ scale: 1.12, x: -3 }}
        whileTap={{ scale: 0.95 }}
      >
        ‹
      </motion.button>

      {/* Image with 3D spring transition */}
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        style={{ perspective: '1200px' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.img
            key={index}
            src={images[index]}
            alt={`Image ${index + 1}`}
            className="lightbox-image"
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) onNext()
              else if (info.offset.x > 80) onPrev()
            }}
            style={{ cursor: 'grab' }}
            whileDrag={{ cursor: 'grabbing', scale: 0.97 }}
          />
        </AnimatePresence>
      </div>

      <motion.button
        className="lightbox-next"
        onClick={(e) => { e.stopPropagation(); onNext() }}
        aria-label="Next image"
        whileHover={{ scale: 1.12, x: 3 }}
        whileTap={{ scale: 0.95 }}
      >
        ›
      </motion.button>

      <motion.div
        className="lightbox-counter"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
      >
        {index + 1} / {images.length}
      </motion.div>
    </motion.div>,
    document.body
  )
}
