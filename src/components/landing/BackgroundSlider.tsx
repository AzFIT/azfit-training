import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SlideImage {
  src: string
  filter?: string
}

interface BackgroundSliderProps {
  images: SlideImage[]
  interval?: number
  overlayOpacity?: number
}

const DEFAULT_INTERVAL = 5000
const CROSSFADE_DURATION = 1.2

export default function BackgroundSlider({
  images,
  interval = DEFAULT_INTERVAL,
  overlayOpacity = 0.6,
}: BackgroundSliderProps) {
  const [current, setCurrent] = useState(0)
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [images.length, interval, next])

  useEffect(() => {
    images.forEach((img) => {
      const image = new Image()
      image.src = img.src
    })
  }, [images])

  const slide = images[current]
  if (!slide) return null

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-az-black">
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_DURATION, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className={`absolute inset-0 bg-cover bg-center animate-ken-burns ${slide.filter ?? ''}`}
            style={{ backgroundImage: `url(${slide.src})` }}
          />
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}
