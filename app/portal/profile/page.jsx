"use client"
import { useEffect, useRef, useState } from "react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    legalName: "",
    tradingName: "",
    abn: "",
    licenseNumber: "",
    email: "",
    phone: "",
    website: "",
    primaryColor: "",
    secondaryColor: "",
    currency: "AUD",
    gstRate: "10%",
    paymentTerms: "14 days",
    logoUrl: ""
  })
  const fileRef = useRef(null)
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("oz_user_email") || "" : ""

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("oz_profile") : null
    if (saved) {
      try { setProfile(JSON.parse(saved)) } catch {}
    }
  }, [])

  const save = () => {
    localStorage.setItem("oz_profile", JSON.stringify(profile))
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setProfile({ ...profile, logoUrl: url })
  }

  return (
    <section className="p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B2645]">Builder Profile</h1>
          <p className="text-[#2C3E50]">Manage your company information and defaults</p>
        </div>
        <button onClick={save} className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-semibold">Save changes</button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
          <h4 className="text-lg font-bold text-[#0B2645]">Company Information</h4>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3E50]">Legal Company Name</label>
              <input value={profile.legalName} onChange={(e)=>setProfile({...profile, legalName: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3E50]">Trading Name</label>
              <input value={profile.tradingName} onChange={(e)=>setProfile({...profile, tradingName: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">ABN</label>
              <input value={profile.abn} onChange={(e)=>setProfile({...profile, abn: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">License Number</label>
              <input value={profile.licenseNumber} onChange={(e)=>setProfile({...profile, licenseNumber: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
          <h4 className="text-lg font-bold text-[#0B2645]">Contact Details</h4>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">Email</label>
              <input value={profile.email || userEmail} onChange={(e)=>setProfile({...profile, email: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">Phone</label>
              <input value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3E50]">Website</label>
              <input value={profile.website} onChange={(e)=>setProfile({...profile, website: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" placeholder="https://example.com" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
          <h4 className="text-lg font-bold text-[#0B2645]">Branding</h4>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center border border-[#BDC3C7] rounded-lg h-32 bg-white">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="h-24 object-contain" />
              ) : (
                <span className="text-[#2C3E50]">LOGO</span>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
              <button onClick={()=>fileRef.current?.click()} className="mt-2 bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-semibold">Upload logo</button>
            </div>
            <div className="space-y-4 h-32">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50]">Primary Color</label>
                <input value={profile.primaryColor} onChange={(e)=>setProfile({...profile, primaryColor: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" placeholder="#0B2645" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50]">Secondary Color</label>
                <input value={profile.secondaryColor} onChange={(e)=>setProfile({...profile, secondaryColor: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" placeholder="#F39C12" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
          <h4 className="text-lg font-bold text-[#0B2645]">Financial Settings</h4>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">Currency</label>
              <select value={profile.currency} onChange={(e)=>setProfile({...profile, currency: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white">
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2C3E50]">GST Rate</label>
              <select value={profile.gstRate} onChange={(e)=>setProfile({...profile, gstRate: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white">
                <option>0%</option>
                <option>5%</option>
                <option>10%</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3E50]">Payment Terms</label>
              <input value={profile.paymentTerms} onChange={(e)=>setProfile({...profile, paymentTerms: e.target.value})} className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-3 py-1 bg-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} className="bg-[var(--color-secondary)] text-white px-4 py-2 rounded-lg font-semibold">Save changes</button>
      </div>
    </section>
  )
}
