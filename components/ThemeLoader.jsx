"use client"
import { useEffect } from 'react'

export default function ThemeLoader(){
  useEffect(()=>{
    fetch('/assets/colors.json')
      .then(r=>r.ok?r.json():null)
      .then(cfg=>{
        if(!cfg) return
        const root = document.documentElement
        Object.entries(cfg.variables||{}).forEach(([k,v])=>root.style.setProperty(k,v))
      }).catch(()=>{})
  },[])
  return null
}
