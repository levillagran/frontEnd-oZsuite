"use client"
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StatusChip from '@/components/StatusChip'
import InvoiceModal from './InvoiceModal'
import NewEstimateWizard from './NewEstimateWizard'

export default function Quotes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState('create')
  const [wizardId, setWizardId] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const tableRef = useRef(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const router = useRouter()
  const reload = (q='') => {
    setLoading(true)
    setPage(1)
    const base = '/api/quotes?view=list'
    const url = q ? `${base}&q=${encodeURIComponent(q)}` : base
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Failed to load quotes')))
      .then(data => {
        const arr = Array.isArray(data) ? data.slice() : []
        const num = s => Number(String(s||'').replace(/\D+/g,'')||0)
        arr.sort((a,b)=> (num(b.number)-num(a.number)))
        setItems(arr); setError(null)
      })
      .catch(err => { setError(err.message || 'Error'); setItems([]) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { reload() }, [])
  useEffect(()=>{ reload(query) }, [query])
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
  const openView = async (id) => {
    setViewOpen(true); setViewLoading(true); setViewError(null); setViewData(null)
    try {
      const r = await fetch(`/api/quotes/${id}`)
      if (!r.ok) throw new Error('Failed to load quote')
      const d = await r.json()
      setViewData(d)
    } catch(e) { setViewError(e.message||'Error') } finally { setViewLoading(false) }
  }
  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold text-[#0B2A3C] mb-3">Estimates Management</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 sm:gap-2">
          <div className="relative w-full sm:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><line x1="20" y1="20" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search estimates by number, client, status" aria-label="Search quotes" className="w-full rounded pl-10 pr-3 py-1 text-primary bg-white/90 placeholder-gray-500 border border-[var(--color-border)]" />
          </div>
          <button onClick={()=>setWizardOpen(true)} className="w-full sm:w-auto px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:brightness-90 transition">+ New Estimate</button>
        </div>
        <div className="bg-white shadow rounded-xl p-1 mb-3">
          <div className="flex flex-nowrap gap-2 items-center justify-center sm:justify-start overflow-x-auto whitespace-nowrap">
            <div className="text-xs font-semibold text-[#0B2A3C]">Status:</div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-gray-500 text-white text-[10px]">DRAFT</span><span className="text-[10px] text-[#0B2A3C]">Not sent</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px]">SENT</span><span className="text-[10px] text-[#0B2A3C]">Sent to client</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-yellow-500 text-white text-[10px]">PENDING</span><span className="text-[10px] text-[#0B2A3C]">Awaiting decision</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-green-600 text-white text-[10px]">APPROVED</span><span className="text-[10px] text-[#0B2A3C]">Accepted</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[10px]">REJECTED</span><span className="text-[10px] text-[#0B2A3C]">Declined</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px]">EXPIRED</span><span className="text-[10px] text-[#0B2A3C]">Past expiry</span></div>
            <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[10px]">CONVERTED</span><span className="text-[10px] text-[#0B2A3C]">Project created</span></div>
          </div>
        </div>
        <div ref={tableRef} className="overflow-x-auto bg-white shadow-xl rounded-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="oz-table bg-[var(--color-primary)] text-white text-sm">
              <tr><th className="p-1 w-10"></th><th className="p-1">Quote #</th><th className="p-1">Client</th><th className="p-1">Project</th><th className="p-1">Issue Date</th><th className="p-1">Expiry Date</th><th className="p-1">Total Amount</th><th className="p-1">Status</th><th className="p-1 text-center">Actions</th></tr>
            </thead>
            <tbody>
              {loading && (<tr><td className="p-2" colSpan={6}>Loading...</td></tr>)}
              {!loading && error && (<tr><td className="p-2 text-red-600" colSpan={6}>{error}</td></tr>)}
              {!loading && !error && items.length === 0 && (<tr><td className="p-2" colSpan={6}>No quotes found</td></tr>)}
              {!loading && !error && items.slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map(q => (
                <tr key={q.id} className="border-b">
                  <td className="p-1">
                    <div className="flex gap-1 justify-center">
                      <button onClick={()=>openView(q.id)} className="px-2 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm" aria-label="View" title="View">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      {['draft','sent','pending'].includes(String(q.status||'').toLowerCase()) && (
                        <button className="px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm" onClick={()=>{ setWizardOpen(true); setWizardMode('edit'); setWizardId(q.id) }} aria-label="Edit" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
                        </button>
                      )}
                      {String(q.status||'').toLowerCase()==='draft' && (
                        <button className="px-2 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm" onClick={async ()=>{
                          if (!confirm('Delete this draft quote?')) return
                          const r = await fetch(`/api/quotes/${q.id}`, { method: 'DELETE' })
                          if (r.ok) { reload() } else { try { const e = await r.json(); alert(e.error || 'Delete failed') } catch { alert('Delete failed') } }
                        }} aria-label="Delete" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{q.number || q.id}</td>
                  <td className="p-2"><span className="block max-w-[160px] truncate">{q.client?.name || '-'}</span></td>
                  <td className="p-2">{q.project?.name || '-'}</td>
                  <td className="p-2">{q.issueDate || '-'}</td>
                  <td className="p-2">{q.expiryDate || '-'}</td>
                  <td className="p-2">{new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Number(q.totalAmount || 0))}</td>
                  <td className="p-2"><StatusChip status={q.status} /></td>
                  <td className="p-2">
                    <div className="relative flex justify-center">
                      <button className="px-2 py-1 rounded-lg bg-[var(--color-secondary)] text-white hover:brightness-90 text-sm" onClick={()=> setMenuOpenId(menuOpenId===q.id ? null : q.id)} aria-label="Actions" title="Actions">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                      </button>
                      {menuOpenId===q.id && (
                        <div className="absolute top-full mt-1 right-0 z-20 bg-white border border-[var(--color-border)] rounded-lg shadow-lg p-2 min-w-[160px]">
                          {String(q.status||'').toLowerCase()==='draft' && (
                            <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ const r = await fetch(`/api/quotes/${q.id}/send`, { method: 'POST' }); if (r.ok) { setMenuOpenId(null); reload() } }}>Send</button>
                          )}
                          {['sent','pending'].includes(String(q.status||'').toLowerCase()) && (
                            <>
                              <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ const r = await fetch(`/api/quotes/${q.id}/approve`, { method: 'POST' }); if (r.ok) { setMenuOpenId(null); reload() } }}>Approve</button>
                              <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ const r = await fetch(`/api/quotes/${q.id}/reject`, { method: 'POST' }); if (r.ok) { setMenuOpenId(null); reload() } }}>Reject</button>
                            </>
                          )}
                          {String(q.status||'').toLowerCase()==='approved' && (
                            <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={()=>{ setMenuOpenId(null); setConfirmId(q.id); setConfirmOpen(true) }}>Convert</button>
                          )}
                          {['rejected','expired'].includes(String(q.status||'').toLowerCase()) && (
                            <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 text-sm" onClick={async ()=>{ const r = await fetch(`/api/quotes/${q.id}/duplicate`, { method: 'POST' }); if (r.ok) { setMenuOpenId(null); reload() } }}>Duplicate</button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center gap-2 py-2">
            <button className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm disabled:opacity-50" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page<=1}>Prev</button>
            {Array.from({ length: Math.max(1, Math.ceil(items.length / pageSize)) }, (_, i) => i + 1).map(n => (
              <button key={n} className={`px-3 py-1 rounded-lg text-sm ${n===page ? 'bg-[var(--color-secondary)] text-white' : 'bg-white border border-[var(--color-border)] text-[var(--color-text)]'}`} onClick={()=> setPage(n)}>{n}</button>
            ))}
            <button className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm disabled:opacity-50" onClick={()=> setPage(p => Math.min(Math.max(1, Math.ceil(items.length / pageSize)), p+1))} disabled={page>=Math.max(1, Math.ceil(items.length / pageSize))}>Next</button>
          </div>
        </div>
        {confirmOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
              <h2 className="text-lg font-semibold text-[#0B2A3C] mb-2">Confirm Conversion</h2>
              <p className="text-sm text-[var(--color-text)] mb-4">Convert this quote into a project?</p>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text)]" onClick={()=>{ if (confirmLoading) return; setConfirmOpen(false); setConfirmId(null) }} disabled={confirmLoading}>Cancel</button>
                <button className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50" onClick={async ()=>{
                  if (!confirmId || confirmLoading) return
                  setConfirmLoading(true)
                  try {
                    const r = await fetch(`/api/quotes/${confirmId}/convert`, { method: 'POST' })
                    if (r.ok) { setConfirmOpen(false); setConfirmId(null); router.push('/portal/projects') }
                  } finally { setConfirmLoading(false) }
                }} disabled={confirmLoading}>{confirmLoading ? 'Converting...' : 'Yes, convert'}</button>
              </div>
            </div>
          </div>
        )}
        <InvoiceModal open={viewOpen} onClose={()=>setViewOpen(false)} data={viewData} loading={viewLoading} error={viewError} />
        <NewEstimateWizard open={wizardOpen} onClose={()=>{ setWizardOpen(false); setWizardMode('create'); setWizardId(null) }} onCreated={()=>reload()} onSaved={()=>reload()} mode={wizardMode} quoteId={wizardId} />
      </div>
    </section>
  )
}
