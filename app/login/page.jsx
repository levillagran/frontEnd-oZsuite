"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    const ok = email.trim().toLowerCase() === "tester@ozsuite.com" && password === "tester"
    if (!ok) {
      setError("Invalid credentials")
      return
    }
    localStorage.setItem("oz_auth", "true")
    localStorage.setItem("oz_user_email", email.trim().toLowerCase())
    document.cookie = `oz_auth=true; path=/; max-age=${60 * 60 * 24 * 7}`
    document.cookie = `oz_user_email=${encodeURIComponent(email.trim().toLowerCase())}; path=/; max-age=${60 * 60 * 24 * 7}`
    router.push("/portal/dashboard")
  }

  return (
    <section className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-cover bg-center" style={{ backgroundImage: 'url("/assets/backgroundOzSuite.png")' }} />
      <div className="flex items-center justify-center bg-white">
        <form onSubmit={onSubmit} className="w-full max-w-md p-8">
          <h1 className="text-3xl font-extrabold text-[#0B2645] text-center">Sign in</h1>
          <p className="text-center text-[#2C3E50] mt-2">Access your OzSuite account</p>
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#2C3E50]">Email address</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="you@example.com" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#2C3E50]">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="********" />
          </div>
          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full mt-6 bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg font-semibold">Continue</button>
          <div className="mt-4 text-center">
            <a href="/signup" className="text-[#0B2645] hover:text-[var(--color-secondary)] font-medium">Create an account</a>
          </div>
        </form>
      </div>
    </section>
  )
}
