"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header(){
  const pathname = usePathname()
  const router = useRouter()
  const isLanding = pathname === '/'
  const [authed, setAuthed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('oz_user_email') || '' : ''
  useEffect(() => {
    const ok = typeof window !== 'undefined' && localStorage.getItem('oz_auth') === 'true'
    setAuthed(!!ok)
  }, [])
  const onLogout = () => {
    localStorage.removeItem('oz_auth')
    localStorage.removeItem('oz_user_email')
    document.cookie = 'oz_auth=; path=/; max-age=0'
    document.cookie = 'oz_user_email=; path=/; max-age=0'
    setConfirmOpen(false)
    setMenuOpen(false)
    setAuthed(false)
    router.push('/')
  }
  return (
    <header className="oz-header w-full h-12 sm:h-16">
      <div className="max-w-6xl mx-auto h-full flex justify-between items-center px-4 sm:px-6 py-1 sm:py-2">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Go to landing">
            <img src="/assets/logo.svg" alt="OZSuite Logo" className="h-10 sm:h-12" />
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-8 font-medium relative">
          {isLanding && <Link href="/#features" className="inline-flex items-center hover:text-[var(--color-secondary)]">Features</Link>}
          {isLanding && <Link href="/pricing" className="inline-flex items-center hover:text-[var(--color-secondary)]">Pricing</Link>}
          {isLanding && <Link href="/#contact" className="inline-flex items-center hover:text-[var(--color-secondary)]">Contact</Link>}
          {!authed && <Link href="/login" className="inline-flex items-center bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-semibold">Sign in</Link>}
          {authed && (
            <div className="relative">
              <button onClick={()=>setMenuOpen((v)=>!v)} className="inline-flex items-center gap-2 bg-white text-[#0B2645] px-3 py-2 rounded-lg font-semibold">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-secondary)] text-white">👤</span>
                <span className="hidden sm:inline">{userEmail}</span>
              </button>
          {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow p-2">
                  <Link href="/portal/profile" className="block px-3 py-2 rounded hover:bg-[#F7F8FA] text-black">Profile</Link>
                  <button onClick={()=>setConfirmOpen(true)} className="block w-full text-left px-3 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-semibold hover:opacity-90">Sign out</button>
                </div>
              )}
            </div>
          )}
          {confirmOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-md">
                <h4 className="text-xl font-bold text-[#0B2645]">Confirmation</h4>
                <p className="mt-2 text-[#2C3E50]">Do you want to sign out?</p>
                <div className="mt-6 flex gap-3 justify-end">
                  <button onClick={()=>setConfirmOpen(false)} className="px-4 py-2 rounded border border-[#0B2645] text-[#0B2645]">Cancel</button>
                  <button onClick={onLogout} className="px-4 py-2 rounded bg-[var(--color-secondary)] text-white">Sign out</button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
