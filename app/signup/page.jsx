"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem("oz_tmp_user", JSON.stringify({ name, email }))
    router.push("/login")
  }

  return (
    <section className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block bg-cover bg-center" style={{ backgroundImage: 'url("/assets/backgroundOzSuite.png")' }} />
      <div className="flex items-center justify-center bg-white">
        <form onSubmit={onSubmit} className="w-full max-w-md p-8">
          <h1 className="text-3xl font-extrabold text-[#0B2645] text-center">Sign up</h1>
          <p className="text-center text-[#2C3E50] mt-2">Create your OzSuite account</p>
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#2C3E50]">Full name</label>
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="Your name" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#2C3E50]">Email address</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="you@example.com" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#2C3E50]">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="********" />
          </div>
          <button type="submit" className="w-full mt-6 bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg font-semibold">Create account</button>
          <div className="mt-4 text-center">
            <a href="/login" className="text-[#0B2645] hover:text-[var(--color-secondary)] font-medium">Already have an account?</a>
          </div>
        </form>
      </div>
    </section>
  )
}
