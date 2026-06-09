import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SlideImage {
  src: string
  alt?: string
}

interface BackgroundSliderProps {
  images: SlideImage[]
  interval?: number
  overlayOpacity?: number
}

const DEFAULT_INTERVAL = 6000
const CROSSFADE_DURATION = 1.5

export default function BackgroundSlider({
  images,
  interval = DEFAULT_INTERVAL,
  overlayOpacity = 0.5,
}: BackgroundSliderProps) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState<boolean[]>(() => images.map(() => false))

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [images.length, interval, next])

  useEffect(() => {
    images.forEach((img, i) => {
      const image = new Image()
      image.src = img.src
      image.onload = () => {
        setLoaded((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }
      // If already cached, onload might not fire — mark loaded immediately too
      if (image.complete) {
        setLoaded((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }
    })
  }, [images])

  if (images.length === 0) return null
  const currentSlide = images[current]

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-az-black">
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: CROSSFADE_DURATION, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Blurred backdrop fills the screen so no black bars */}
          <img
            src={currentSlide.src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
            style={{ opacity: 0.6 }}
          />
          {/* Main image — contained to show the complete picture */}
          <img
            src={currentSlide.src}
            alt={currentSlide.alt || ''}
            className="absolute inset-0 w-full h-full object-contain object-center"
            style={{
              opacity: loaded[current] ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay for text readability */}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/80"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}
