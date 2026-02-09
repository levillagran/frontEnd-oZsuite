"use client"
import { useEffect, useRef, useState } from "react"

export default function RotatingImage({ images = [], alt = "", className = "", imgClassName = "h-auto object-contain", intervalMs = 4000 }) {
  const [index, setIndex] = useState(0)
  const wrapRef = useRef(null)
  const [w, setW] = useState(0)
  const [ratio, setRatio] = useState(0)
  const [h, setH] = useState(0)

  useEffect(() => {
    if (!images?.length) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images, intervalMs])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const r = () => setW(el.offsetWidth || 0)
    r()
    const ro = new ResizeObserver(r)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!images?.length) return
    const img = new Image()
    img.src = images[0]
    const onload = () => setRatio(img.naturalHeight && img.naturalWidth ? img.naturalHeight / img.naturalWidth : 0)
    img.onload = onload
    return () => { img.onload = null }
  }, [images])

  useEffect(() => {
    if (w && ratio) setH(Math.round(w * ratio))
  }, [w, ratio])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`} style={{ height: h || undefined }}>
      <div
        className="flex items-center"
        style={{
          width: `${images.length * w}px`,
          transform: `translateX(-${index * w}px)`,
          transition: 'transform 700ms ease-in-out'
        }}
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt={alt} className={imgClassName} style={{ width: w, minWidth: w, height: h || undefined }} />
        ))}
      </div>
    </div>
  )
}
