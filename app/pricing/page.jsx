import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function PricingPage() {
  return (
    <>
      <Header />
      <section
        className="w-full min-h-[75vh] bg-fixed bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/assets/backgroundOzSuite.png")' }}
      >
        <section className="py-10 bg-white/80">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2645]">Pricing</h1>
            <p className="mt-4 text-lg text-[#2C3E50]">Choose the plan that fits your team.</p>
          </div>
        </section>
        <section className="py-10 bg-white/80">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#F7F8FA] shadow text-center">
              <h3 className="text-xl font-bold mb-2">Free Trial</h3>
              <h4 className="text-[#2C3E50] text-base font-medium mb-2">Try OzSuite risk-free</h4>
              <p className="text-3xl font-extrabold text-[#0B2645]">$0</p>
              <p className="mt-2 text-[#2C3E50]">No credit card required</p>
              <p className="mt-2 text-[#2C3E50]">Explore how OzSuite works before committing.</p>
              <ul className="mt-4 text-[#2C3E50] list-disc list-inside mx-auto w-fit text-left">
                <li>Up to 1 active project</li>
                <li>Create and manage quotes</li>
                <li>Convert quote to project</li>
                <li>Basic cost tracking</li>
                <li>Limited documents storage</li>
                <li>Trial access for 14 days</li>
              </ul>
              <a href="/portal/dashboard" className="mt-6 inline-block bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg font-semibold">Start free trial</a>
            </div>
            <div className="p-6 rounded-lg bg-[#F7F8FA] shadow text-center">
              <h3 className="text-xl font-bold mb-2">Professional – Monthly</h3>
              <h4 className="text-[#2C3E50] text-base font-medium mb-2">For growing construction businesses</h4>
              <p className="text-3xl font-extrabold text-[#0B2645]">$90/mo</p>
              <p className="mt-2 text-[#2C3E50]">Billed monthly</p>
              <p className="mt-2 text-[#2C3E50]">Full control of your projects with flexible monthly billing.</p>
              <ul className="mt-4 text-[#2C3E50] list-disc list-inside mx-auto w-fit text-left">
                <li>Unlimited projects</li>
                <li>Quotes → Projects workflow</li>
                <li>Cost tracking & budget control</li>
                <li>Variations management</li>
                <li>Milestones & progress tracking</li>
                <li>Project health indicators</li>
                <li>Document management</li>
                <li>Email support</li>
              </ul>
              <a href="/portal/dashboard" className="mt-6 inline-block border border-[#0B2645] text-[#0B2645] px-6 py-3 rounded-lg font-semibold hover:bg-[#0B2645] hover:text-white">Choose monthly plan</a>
            </div>
            <div className="p-6 rounded-lg bg-[#F7F8FA] shadow text-center">
              <h3 className="text-xl font-bold mb-2">Professional – Annual</h3>
              <h4 className="text-[#2C3E50] text-base font-medium mb-2">Best value for established builders</h4>
              <p className="text-3xl font-extrabold text-[#0B2645]">$972/yr</p>
              <div className="mt-2 flex items-center justify-center">
                <span className="inline-flex items-center rounded-full bg-[var(--color-secondary)] text-white px-3 py-1 text-xs font-semibold">
                  Best value
                </span>
              </div>
              <p className="mt-2 text-[#2C3E50]">Save up to 10%</p>
              <p className="mt-2 text-[#2C3E50]">Everything in Monthly, with the best price and priority support.</p>
              <ul className="mt-4 text-[#2C3E50] list-disc list-inside mx-auto w-fit text-left">
                <li>Unlimited projects</li>
                <li>Quotes → Projects workflow</li>
                <li>Cost & variation tracking</li>
                <li>Milestones & progress</li>
                <li>Project health dashboard</li>
                <li>Advanced reports</li>
                <li>Priority support</li>
                <li>Early access to new features</li>
              </ul>
              <a href="/portal/dashboard" className="mt-6 inline-block border border-[#0B2645] text-[#0B2645] px-6 py-3 rounded-lg font-semibold hover:bg-[#0B2645] hover:text-white">Choose annual plan</a>
            </div>
          </div>
        <div className="max-w-6xl mx-auto px-6 mt-6 text-center">
          <p className="text-sm text-[#2C3E50]/90">
            All prices are in AUD. GST may apply. <br /> Cancel anytime. No lock-in contracts.
          </p>
        </div>
        </section>
      </section>
      <Footer />
    </>
  )
}
