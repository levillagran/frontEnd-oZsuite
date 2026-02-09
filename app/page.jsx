"use client"
import Header from '../components/Header'
import Footer from '../components/Footer'
import RotatingImage from '../components/RotatingImage'

export default function HomePage() {
  return (
    <>
      <Header />
      <section
        className="w-full min-h-[75vh] bg-fixed bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/assets/backgroundOzSuite.png")' }}
      >
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-0 items-stretch">
            <div className="bg-white/80 p-6 md:rounded-l-xl h-full">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                The all-in-one<br /><span className="text-[var(--color-secondary)]">Construction Suite</span>
              </h1>
              <p className="mt-6 text-lg text-[#2C3E50]">
                Estimates, takeoffs, project management, invoicing and more — all in one powerful and easy-to-use platform.
              </p>
              <div className="mt-8 flex gap-4">
                <a href="/portal/dashboard" className="bg-[var(--color-secondary)] text-white px-8 py-4 rounded-lg text-lg font-semibold">Get Started</a>
                <a href="/portal/dashboard" className="border border-[#0B2645] text-[#0B2645] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0B2645] hover:text-white">View Demo</a>
              </div>
            </div>
          <div className="bg-white/80 p-6 md:rounded-r-xl h-full flex items-center justify-center">
            <RotatingImage
              images={[
                "/assets/ozSuitView1.png",
                "/assets/ozSuitView2.png",
                "/assets/ozSuitView3.png",
              ]}
              alt="OzSuite view"
              className="w-[80%]"
              imgClassName="h-full object-contain"
              intervalMs={4000}
            />
            </div>
          </div>
        </section>
        <section id="features" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center mb-12">Everything you need in one suite</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
                <h3 className="text-xl font-bold mb-3">1. Smart Estimates</h3>
                <p className="text-[#2C3E50]">Create accurate estimates in minutes, not hours.</p>
              </div>
              <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
                <h3 className="text-xl font-bold mb-3">2. Digital Takeoffs</h3>
                <p className="text-[#2C3E50]">Upload your plans and measure instantly with AI-assisted tools.</p>
              </div>
              <div className="p-6 rounded-lg bg-[#F7F8FA] shadow">
                <h3 className="text-xl font-bold mb-3">3. Invoicing & Billing</h3>
                <p className="text-[#2C3E50]">Generate invoices, track payments and manage cashflow.</p>
              </div>
            </div>
          </div>
        </section>
        <section id="contact" className="py-12 bg-white/80">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0B2645] text-center">Contact Us</h2>
            <p className="mt-4 text-lg text-[#2C3E50] text-center">
              Have questions or need assistance? Reach out to us and we'll get back to you as soon as we can.
            </p>
            <div className="mt-6 grid md:grid-cols-2 gap-8 items-stretch">
              <div className="rounded-xl bg-[#0B2645]/80 text-white p-8 shadow">
                <h3 className="text-2xl font-extrabold">LENERVILL</h3>
                <p className="mt-2 text-white/80">
                  Contact the OzSuite team for support, inquiries, or to request a demo. We're here to help your construction business succeed.
                </p>
                <div className="mt-6 space-y-4 bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3"><span className="text-[var(--color-secondary)]">✉️</span><span>info@lenervill.com.au</span></div>
                  <div className="flex items-center gap-3"><span className="text-[var(--color-secondary)]">📞</span><span>+61 2 8500 123000</span></div>
                  <div className="flex items-center gap-3"><span className="text-[var(--color-secondary)]">📍</span><span>Collins Street, Sydney, NSW 2000</span></div>
                </div>
              </div>
              <div className="rounded-xl bg-white p-8 shadow">
                <h3 className="text-2xl font-extrabold text-[#0B2645]">Contact form</h3>
                <form className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50]">Full name</label>
                    <input type="text" className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50]">Email address</label>
                    <input type="email" className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="email@company.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50]">Company</label>
                    <input type="text" className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" placeholder="Company" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50]">Message</label>
                    <textarea className="mt-2 w-full border border-[#BDC3C7] rounded-lg px-4 py-3 bg-[#F7F8FA]" rows="4" placeholder="Message"></textarea>
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg font-semibold">Send message</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </section>
      <Footer />
    </>
  )
}
