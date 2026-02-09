"use client"
import { useEffect, useState, useRef } from 'react'
import StatusChip from '@/components/StatusChip'
import ProjectModal from './[id]/ProjectModal'
import EditProjectModal from './EditProjectModal'

export default function Projects() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const tableRef = useRef(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewId, setViewId] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const canEdit = (st) => {
    const s = String(st||'').toUpperCase()
    return s === 'DRAFT' || s === 'ACTIVE'
  }
  const canArchive = (st) => {
    const s = String(st||'').toUpperCase()
    return s === 'COMPLETED'
  }
  const setStatus = async (id, status) => {
    const r = await fetch(`/api/projects/${id}`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ status: String(status||'').toUpperCase() }) })
    if (r.ok) reload()
  }
  const openEdit = async (id) => {
    if (!id) return
    setEditLoading(true)
    setEditOpen(true)
    setEditProject(null)
    try {
      const r = await fetch(`/api/projects/${id}`)
      if (!r.ok) throw new Error('Failed to load project')
      const d = await r.json()
      setEditProject(d)
    } catch (e) {
      setEditProject({ id, name: '', startDate: null, expectedEndDate: null, actualEndDate: null, budget: 0, notes: '' })
    } finally {
      setEditLoading(false)
    }
  }
  const reload = () => {
    setLoading(true)
    fetch('/api/projects/list')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load projects')))
      .then(data => {
        const arr = Array.isArray(data) ? data.slice() : []
        const num = s => Number(String(s||'').replace(/\D+/g,'')||0)
        arr.sort((a,b)=> (num(b.number)-num(a.number)))
        setItems(arr); setError(null)
      })
      .catch(err => { setError(err.message || 'Error'); setItems([]) })
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    reload()
  }, [])
  const [query, setQuery] = useState('')
  useEffect(()=>{
    const url = query ? `/api/projects/list?q=${encodeURIComponent(query)}` : '/api/projects/list'
    setLoading(true)
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load projects')))
      .then(data => {
        const arr = Array.isArray(data) ? data.slice() : []
        const num = s => Number(String(s||'').replace(/\D+/g,'')||0)
        arr.sort((a,b)=> (num(b.number)-num(a.number)))
        setItems(arr); setError(null)
      })
      .catch(err => { setError(err.message || 'Error'); setItems([]) })
      .finally(() => setLoading(false))
  }, [query])
  useEffect(()=>{
    const compute = ()=>{
      const el = tableRef.current
      const vh = window.innerHeight || 800
      const top = el ? el.getBoundingClientRect().top : 0
      const paginationH = 48
      const headerH = 40
      const avail = Math.max(100, vh - top - paginationH)
      const rowH = 40
      const rows = Math.max(5, Math.floor((avail - headerH) / rowH))
      setPageSize(rows)
    }
    compute()
    window.addEventListener('resize', compute)
    return ()=> window.removeEventListener('resize', compute)
  }, [])
  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold text-[#0B2A3C] mb-3">Projects Management</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 sm:gap-2">
          <div className="relative w-full sm:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><line x1="20" y1="20" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search projects by id, name, client, status" aria-label="Search projects" className="w-full rounded pl-10 pr-3 py-1 text-primary bg-white/90 placeholder-gray-500 border border-[var(--color-border)]" />
          </div>
          <button className="w-full sm:w-auto px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:brightness-90 transition" onClick={async ()=>{
            if (creating) return
            setCreating(true)
            try{
              const name = prompt('Project name')
              if (!name) return
              const customerName = prompt('Client / Customer name') || ''
              const budgetStr = prompt('Budget (optional)') || '0'
              const budget = Number(budgetStr||0)
              const r = await fetch('/api/projects', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name, customerName, budget }) })
              if (r.ok) reload()
            } finally {
              setCreating(false)
            }
          }}>+ New Project</button>
        </div>
        <div className="bg-white shadow rounded-xl p-1 mb-3">
          <div className="flex flex-nowrap gap-2 items-center justify-center sm:justify-start overflow-x-auto whitespace-nowrap">
            <div className="text-xs font-semibold text-[#0B2A3C]">Status:</div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px]">DRAFT</span><span className="text-[10px] text-[#0B2A3C]">Converted</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--status-converted-bg)] text-white text-[10px]">ACTIVE</span><span className="text-[10px] text-[#0B2A3C]">Running</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--status-onhold-bg)] text-white text-[10px]">ON_HOLD</span><span className="text-[10px] text-[#0B2A3C]">Paused</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--status-approved-bg)] text-white text-[10px]">COMPLETED</span><span className="text-[10px] text-[#0B2A3C]">Finished</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--status-rejected-bg)] text-white text-[10px]">CANCELLED</span><span className="text-[10px] text-[#0B2A3C]">Stopped</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-[var(--status-archive-bg)] text-white text-[10px]">ARCHIVED</span><span className="text-[10px] text-[#0B2A3C]">Archived</span></div>
          </div>
        </div>
        <div ref={tableRef} className="overflow-x-auto bg-white shadow-xl rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="oz-table bg-[var(--color-primary)] text-white text-sm">
              <tr><th className="p-1"></th><th className="p-1 w-10"></th><th className="p-1">Project #</th><th className="p-1">Project</th><th className="p-1">Client</th><th className="p-1">Status</th><th className="p-1">Progress</th><th className="p-1">Budget</th><th className="p-1">Dates</th><th className="p-1">Health</th><th className="p-1 text-center">Actions</th></tr>
            </thead>
            <tbody>
              {loading && (<tr><td className="p-2" colSpan={6}>Loading...</td></tr>)}
              {!loading && error && (<tr><td className="p-2 text-red-600" colSpan={6}>{error}</td></tr>)}
              {!loading && !error && items.length === 0 && (<tr><td className="p-2" colSpan={6}>No projects found</td></tr>)}
              {!loading && !error && items.slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-1"></td>
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <button className="px-2 py-1 rounded-lg bg-[var(--status-approved-bg)] text-white hover:brightness-90 text-sm" aria-label="Manage" title="Manage" onClick={()=>{ setViewId(p.id); setViewOpen(true) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </button>
                      {canEdit(p.status) && (
                        <button className="px-2 py-1 rounded-lg bg-[var(--status-converted-bg)] text-white hover:bg-[var(--status-converted-bg)] text-sm" aria-label="Edit" title="Edit" onClick={()=> openEdit(p.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{p.number}</td>
                  <td className="p-2"><span className="block max-w-[220px] truncate">{p.name || '-'}</span></td>
                  <td className="p-2"><span className="block max-w-[160px] truncate">{p.clientName || '-'}</span></td>
                  <td className="p-2">{new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Number(p.budgetEstimated || 0))} / {new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Number(p.budgetActual || 0))}</td>
                  <td className="p-2">{(p.startDate ? new Date(p.startDate).toLocaleDateString('en-AU') : '-')} → {(p.expectedEndDate ? new Date(p.expectedEndDate).toLocaleDateString('en-AU') : '-')}</td>
                  <td className="p-2"><StatusChip status={String(p.status || 'DRAFT').toUpperCase()} /></td>
                  <td className="p-2">{typeof p.progress === 'number' ? `${p.progress}%` : '-'}</td>
                  <td className="p-2">
                    {(()=>{
                      const h = String(p.health||'').toUpperCase()
                      const st = String(p.status||'').toUpperCase()
                      const isOnTrack = h==='ON_TRACK'
                      const isRed = h==='OVER_BUDGET' || h==='CRITICAL' || st.includes('DELAYED')
                      const color = isOnTrack ? '#27AE60' : (isRed ? '#E74C3C' : '#F1C40F')
                      const label = isOnTrack ? 'On track' : (isRed ? 'Over budget / delayed' : 'At risk')
                      return <span title={label} aria-label={label} className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    })()}
                  </td>
                  <td className="p-2">
                    {(() => {
                      const st = String(p.status || '').toUpperCase()
                      const hasActions = st==='DRAFT' || st==='ACTIVE' || st==='ON_HOLD' || st==='COMPLETED'
                      if (!hasActions) return null
                      return (
                        <div className="relative flex justify-center">
                          <button className="px-2 py-1 rounded-lg bg-[var(--color-secondary)] text-white hover:brightness-90 text-sm" onClick={()=> setMenuOpenId(menuOpenId===p.id ? null : p.id)} aria-label="Actions" title="Actions">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                          </button>
                          {menuOpenId===p.id && (
                            <div className="absolute top-full mt-1 right-0 z-20 bg-white border border-[var(--color-border)] rounded-lg shadow-lg p-2 min-w-[160px]">
                              {st==='DRAFT' && (
                                <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'ACTIVE'); setMenuOpenId(null) }}>Activate</button>
                              )}
                              {st==='ACTIVE' && (
                                <>
                                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'ON_HOLD'); setMenuOpenId(null) }}>On Hold</button>
                                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'COMPLETED'); setMenuOpenId(null) }}>Complete</button>
                                </>
                              )}
                              {st==='ON_HOLD' && (
                                <>
                                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'ACTIVE'); setMenuOpenId(null) }}>Resume</button>
                                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'CANCELLED'); setMenuOpenId(null) }}>Cancel</button>
                                </>
                              )}
                              {st==='COMPLETED' && (
                                <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ await setStatus(p.id, 'ARCHIVED'); setMenuOpenId(null) }}>Archive</button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center items-center gap-2 py-2">
          <button className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm disabled:opacity-50" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
          {Array.from({ length: Math.max(1, Math.ceil(items.length / pageSize)) }, (_, i) => i + 1).map(n => (
            <button key={n} className={`px-3 py-1 rounded-lg text-sm ${n===page ? 'bg-[var(--color-secondary)] text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-text)]'}`} onClick={()=> setPage(n)}>{n}</button>
          ))}
          <button className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm disabled:opacity-50" onClick={()=> setPage(p => Math.min(Math.max(1, Math.ceil(items.length / pageSize)), p+1))} disabled={page>=Math.max(1, Math.ceil(items.length / pageSize))}>Next</button>
        </div>
      </div>
      <ProjectModal open={viewOpen} onClose={()=>{ setViewOpen(false); setViewId(null); reload() }} projectId={viewId} />
      {editOpen && (
        <>
          {editLoading && <div className="fixed inset-0 z-40 bg-black/20" />}
          <EditProjectModal
            open={editOpen && !editLoading}
            onClose={() => { setEditOpen(false); setEditProject(null) }}
            project={editProject}
            onSaved={() => reload()}
          />
        </>
      )}
    </section>
  )
}
