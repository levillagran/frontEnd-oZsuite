"use client"
import { useState } from "react"

export default function Sidebar(){
  const [open, setOpen] = useState(true)
  return (
    <aside
        className={`hidden md:flex navbar-left overflow-y-auto flex-shrink-0 ${open ? "w-[200px]" : "w-16"} bg-[#0B2A3C] text-white transition-all duration-300 p-4 flex flex-col`}
      >
      <div className="flex items-center justify-between mb-2">
        <h1 className={`${open ? "block" : "hidden"} text-xl font-bold`}>MENU</h1>
        <button
          className="inline-flex items-center justify-center h-10 w-10 rounded-md text-white hover:bg-white/10"
          onClick={() => setOpen(!open)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          <a href="/portal/dashboard" className={`${open ? "justify-start" : "justify-center"} flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10`}>
            <span className="text-lg">🏠</span>
            <span className={`${open ? "block" : "hidden"}`}>Dashboard</span>
          </a>
          <a href="/portal/quotes" className={`${open ? "justify-start" : "justify-center"} flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10`}>
            <span className="text-lg">🧾</span>
            <span className={`${open ? "block" : "hidden"}`}>Estimates</span>
          </a>
          <a href="/portal/projects" className={`${open ? "justify-start" : "justify-center"} flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10`}>
            <span className="text-lg">📁</span>
            <span className={`${open ? "block" : "hidden"}`}>Projects</span>
          </a>
          <a href="/portal/purchase-orders" className={`${open ? "justify-start" : "justify-center"} flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10`}>
            <span className="text-lg">🛒</span>
            <span className={`${open ? "block" : "hidden"}`}>Purchase Orders</span>
          </a>
          <a href="/portal/costs" className={`${open ? "justify-start" : "justify-center"} flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10`}>
            <span className="text-lg">💸</span>
            <span className={`${open ? "block" : "hidden"}`}>Costs</span>
          </a>
        </nav>
      </aside>
  )
}
