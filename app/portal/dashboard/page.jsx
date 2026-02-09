"use client"
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [prjRes, qtRes] = await Promise.all([
          fetch('/api/projects?view=list'),
          fetch('/api/quotes?view=list')
        ])
        if (!prjRes.ok || !qtRes.ok) throw new Error('error')
        const prj = await prjRes.json()
        const qt = await qtRes.json()
        if (!alive) return
        setProjects(Array.isArray(prj) ? prj : [])
        setQuotes(Array.isArray(qt) ? qt : [])
      } catch (e) {
        setError('No se pudo cargar la información')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])
  const activeProjects = projects.filter(p => {
    const s = String(p.status || '').toUpperCase()
    return s === 'ACTIVE' || s === 'PLANNED'
  }).length
  const pendingEstimates = quotes.filter(q => String(q.status || '').toUpperCase() === 'DRAFT').length
  const completedJobs = projects.filter(p => String(p.status || '').toUpperCase() === 'COMPLETED').length
  const recentActivities = [...quotes, ...projects].slice(-5).map(it => {
    const isQuote = it && typeof it === 'object' && 'client' in it
    return isQuote
      ? { kind: 'quote', text: `Quote ${it.number} for ${it.client?.name || ''}`, status: String(it.status || '') }
      : { kind: 'project', text: `Project ${it.number} ${it.name || ''}`, status: String(it.status || '') }
  })

  return (
    <section>
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-bold text-primary mb-8">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Active Projects</div>
            <div className="text-3xl font-bold text-primary mt-2">{activeProjects}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Pending Estimates</div>
            <div className="text-3xl font-bold text-primary mt-2">{pendingEstimates}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Completed Jobs</div>
            <div className="text-3xl font-bold text-primary mt-2">{completedJobs}</div>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-xl">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-primary text-xl font-semibold">Recent Activity</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="p-4">Cargando...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : (
              <ul className="space-y-4">
                {recentActivities.map((it, idx) => (
                  <li key={idx} className="p-4 bg-white rounded-xl shadow flex justify-between">
                    <span>{it.text}</span>
                    <span className="font-bold">{String(it.status || '').toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </section>
  )
}
