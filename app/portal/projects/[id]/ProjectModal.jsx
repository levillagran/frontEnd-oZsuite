"use client"
import { useEffect, useMemo, useState } from 'react'
import StatusChip from '@/components/StatusChip'

export default function ProjectModal({ open, onClose, projectId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [saving, setSaving] = useState(false)
  const [milestoneDraft, setMilestoneDraft] = useState({ name: '', status: 'PLANNED', weightPercentage: 0, plannedDate: '', dueDate: '', actualDate: '' })
  const [editingMilestoneId, setEditingMilestoneId] = useState(null)
  const [milestoneMenuOpenId, setMilestoneMenuOpenId] = useState(null)
  const [variationDraft, setVariationDraft] = useState({ description: '', amount: 0, approved: false, approvedDate: '' })
  const [editingVariationId, setEditingVariationId] = useState(null)
  const [documentDraft, setDocumentDraft] = useState({ type: '', fileName: '', uploadedAt: '' })
  const [editingDocumentId, setEditingDocumentId] = useState(null)
  const newId = () => {
    try { return crypto.randomUUID() } catch { return `id-${Date.now()}-${Math.random().toString(16).slice(2)}` }
  }
  const asDateInput = (d) => {
    if (!d) return ''
    const s = String(d)
    return s.length >= 10 ? s.slice(0, 10) : s
  }
  const toNullableDate = (s) => {
    const v = String(s || '').trim()
    return v ? v : null
  }
  const savePatch = async (patch) => {
    if (!projectId) return
    setSaving(true); setError(null)
    try {
      const r = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      })
      if (!r.ok) throw new Error('Failed to save')
      const d = await r.json()
      setData(d)
    } catch (e) {
      setError(e.message || 'Error')
    } finally {
      setSaving(false)
    }
  }
  useEffect(()=>{
    if (!open || !projectId) return
    setLoading(true); setError(null); setData(null)
    fetch(`/api/projects/${projectId}`)
      .then(r=> r.ok ? r.json() : Promise.reject(new Error('Failed to load project')))
      .then(d=> setData(d))
      .catch(e=> setError(e.message||'Error'))
      .finally(()=> setLoading(false))
  }, [open, projectId])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  const healthDot = (h, st)=>{
    const H = String(h||'').toUpperCase()
    const S = String(st||'').toUpperCase()
    const isGreen = H==='ON_TRACK'
    const isRed = H==='OVER_BUDGET' || H==='CRITICAL' || S.includes('DELAYED')
    const color = isGreen ? '#27AE60' : (isRed ? '#E74C3C' : '#F1C40F')
    const label = isGreen ? 'Healthy' : (isRed ? 'Over budget / delayed' : 'At risk')
    return <span title={label} aria-label={label} className="inline-block w-2.5 h-2.5 rounded-full align-middle" style={{ backgroundColor: color }} />
  }
  const fmtMoney = n=> new Intl.NumberFormat('en-AU', { style:'currency', currency:'AUD' }).format(Number(n||0))
  const marginPercent = (d)=>{
    const est = Number(d?.budget||0), act = Number(d?.budgetActual||0)
    if (est<=0) return 0
    return Math.max(0, ((est - act) / est) * 100)
  }
  const milestones = useMemo(() => {
    const src = Array.isArray(data?.milestones) ? data.milestones : []
    return src.map((m, idx) => ({ ...m, id: m?.id ?? `milestone-${idx}` }))
  }, [data])
  const variations = useMemo(() => {
    const src = Array.isArray(data?.variations) ? data.variations : []
    return src.map((v, idx) => ({ ...v, id: v?.id ?? `variation-${idx}` }))
  }, [data])
  const documents = useMemo(() => {
    const src = Array.isArray(data?.documents) ? data.documents : []
    return src.map((d, idx) => ({ ...d, id: d?.id ?? `document-${idx}` }))
  }, [data])
  const variationSum = variations.reduce((a, v) => a + Number(v.amount || 0), 0)
  const milestonesProgress = useMemo(() => {
    const list = milestones
    const total = list.reduce((acc, m) => acc + Number(m.weightPercentage || 0), 0)
    const done = list.reduce((acc, m) => {
      const w = Number(m.weightPercentage || 0)
      const s = String(m.status || '').toUpperCase()
      if (s === 'COMPLETED' || s === 'PAID') return acc + w
      if (s === 'IN_PROGRESS') return acc + (w * 0.5)
      return acc
    }, 0)
    const pct = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : Math.max(0, Math.min(100, done))
    return { percent: pct, totalWeight: total, earnedWeight: done }
  }, [milestones])
  if (!open) return null
  const milestoneStatusFlow = ['PLANNED', 'IN_PROGRESS', 'PAID', 'COMPLETED']
  const isDoneMilestone = (status) => {
    const s = String(status || '').toUpperCase()
    return s === 'COMPLETED' || s === 'PAID'
  }
  const setMilestoneStatus = async (id, status) => {
    const next = milestones.map(m => (String(m.id) === String(id) ? { ...m, status: String(status || '').toUpperCase() } : m))
    await savePatch({ milestones: next })
    setMilestoneMenuOpenId(null)
  }
  const advanceMilestoneStatus = async (id) => {
    const current = milestones.find(m => String(m.id) === String(id))
    const s = String(current?.status || 'PLANNED').toUpperCase()
    const idx = milestoneStatusFlow.indexOf(s)
    const nextStatus = milestoneStatusFlow[Math.max(0, Math.min(milestoneStatusFlow.length - 1, idx + 1))]
    await setMilestoneStatus(id, nextStatus)
  }
  const startEditMilestone = (m) => {
    setEditingMilestoneId(m.id)
    setMilestoneDraft({
      name: m.name || '',
      status: String(m.status || 'PLANNED').toUpperCase(),
      weightPercentage: Number(m.weightPercentage || 0),
      plannedDate: asDateInput(m.plannedDate),
      dueDate: asDateInput(m.dueDate),
      actualDate: asDateInput(m.actualDate)
    })
  }
  const cancelEditMilestone = () => {
    setEditingMilestoneId(null)
    setMilestoneDraft({ name: '', status: 'PLANNED', weightPercentage: 0, plannedDate: '', dueDate: '', actualDate: '' })
  }
  const addMilestone = async () => {
    const name = String(milestoneDraft.name || '').trim()
    if (!name) { setError('Milestone name is required'); return }
    const w = Number(milestoneDraft.weightPercentage || 0)
    const next = [
      ...milestones,
      {
        id: newId(),
        name,
        status: String(milestoneDraft.status || 'PLANNED').toUpperCase(),
        weightPercentage: isFinite(w) ? w : 0,
        plannedDate: toNullableDate(milestoneDraft.plannedDate),
        dueDate: toNullableDate(milestoneDraft.dueDate),
        actualDate: toNullableDate(milestoneDraft.actualDate)
      }
    ]
    await savePatch({ milestones: next })
    cancelEditMilestone()
  }
  const saveMilestone = async (id) => {
    const name = String(milestoneDraft.name || '').trim()
    if (!name) { setError('Milestone name is required'); return }
    const w = Number(milestoneDraft.weightPercentage || 0)
    const next = milestones.map(m => {
      if (m.id !== id) return m
      return {
        ...m,
        name,
        status: String(milestoneDraft.status || m.status || 'PLANNED').toUpperCase(),
        weightPercentage: isFinite(w) ? w : Number(m.weightPercentage || 0),
        plannedDate: toNullableDate(milestoneDraft.plannedDate),
        dueDate: toNullableDate(milestoneDraft.dueDate),
        actualDate: toNullableDate(milestoneDraft.actualDate)
      }
    })
    await savePatch({ milestones: next })
    cancelEditMilestone()
  }
  const deleteMilestone = async (id) => {
    if (!confirm('Delete milestone?')) return
    const next = milestones.filter(m => m.id !== id)
    await savePatch({ milestones: next })
    if (editingMilestoneId === id) cancelEditMilestone()
  }
  const startEditVariation = (v) => {
    setEditingVariationId(v.id || null)
    setVariationDraft({
      description: v.description || '',
      amount: Number(v.amount || 0),
      approved: !!v.approved,
      approvedDate: asDateInput(v.approvedDate)
    })
  }
  const cancelEditVariation = () => {
    setEditingVariationId(null)
    setVariationDraft({ description: '', amount: 0, approved: false, approvedDate: '' })
  }
  const addVariation = async () => {
    const desc = String(variationDraft.description || '').trim()
    if (!desc) { setError('Variation description is required'); return }
    const amt = Number(variationDraft.amount || 0)
    const next = [
      ...variations,
      {
        id: newId(),
        description: desc,
        approved: !!variationDraft.approved,
        amount: isFinite(amt) ? amt : 0,
        approvedDate: toNullableDate(variationDraft.approvedDate)
      }
    ]
    await savePatch({ variations: next })
    cancelEditVariation()
  }
  const saveVariation = async (id) => {
    const desc = String(variationDraft.description || '').trim()
    if (!desc) { setError('Variation description is required'); return }
    const amt = Number(variationDraft.amount || 0)
    const next = variations.map(v => {
      if (String(v.id) !== String(id)) return v
      return {
        ...v,
        description: desc,
        approved: !!variationDraft.approved,
        amount: isFinite(amt) ? amt : Number(v.amount || 0),
        approvedDate: toNullableDate(variationDraft.approvedDate)
      }
    })
    await savePatch({ variations: next })
    cancelEditVariation()
  }
  const deleteVariation = async (id) => {
    if (!confirm('Delete variation?')) return
    const next = variations.filter(v => String(v.id) !== String(id))
    await savePatch({ variations: next })
    if (String(editingVariationId) === String(id)) cancelEditVariation()
  }
  const startEditDocument = (d) => {
    setEditingDocumentId(d.id || null)
    setDocumentDraft({
      type: d.type || '',
      fileName: d.fileName || '',
      uploadedAt: asDateInput(d.uploadedAt)
    })
  }
  const cancelEditDocument = () => {
    setEditingDocumentId(null)
    setDocumentDraft({ type: '', fileName: '', uploadedAt: '' })
  }
  const addDocument = async () => {
    const type = String(documentDraft.type || '').trim()
    const fileName = String(documentDraft.fileName || '').trim()
    if (!type || !fileName) { setError('Document type and file name are required'); return }
    const next = [
      ...documents,
      {
        id: newId(),
        type,
        fileName,
        uploadedAt: toNullableDate(documentDraft.uploadedAt) || new Date().toISOString()
      }
    ]
    await savePatch({ documents: next })
    cancelEditDocument()
  }
  const saveDocument = async (id) => {
    const type = String(documentDraft.type || '').trim()
    const fileName = String(documentDraft.fileName || '').trim()
    if (!type || !fileName) { setError('Document type and file name are required'); return }
    const next = documents.map(d => {
      if (String(d.id) !== String(id)) return d
      return { ...d, type, fileName, uploadedAt: toNullableDate(documentDraft.uploadedAt) }
    })
    await savePatch({ documents: next })
    cancelEditDocument()
  }
  const deleteDocument = async (id) => {
    if (!confirm('Delete document?')) return
    const next = documents.filter(d => String(d.id) !== String(id))
    await savePatch({ documents: next })
    if (String(editingDocumentId) === String(id)) cancelEditDocument()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-xl font-semibold text-[#0B2A3C]">Project: {data?.name || ''}</div>
            <div className="text-sm text-gray-600">Client: {data?.customerName || '-'} • Code: {data?.number || '-'}</div>
          </div>
          <div className="flex items-center gap-3">
            <StatusChip status={data?.status || 'active'} />
            {healthDot(data?.health, data?.status)}
            <button onClick={onClose} className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text)]">Close</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4">
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-xs text-gray-500">Budget</div>
            <div className="text-lg font-semibold">{fmtMoney(data?.budget)}</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-xs text-gray-500">Actual Cost</div>
            <div className="text-lg font-semibold">{fmtMoney(data?.budgetActual)}</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-xs text-gray-500">Margin</div>
            <div className="text-lg font-semibold text-orange-600">{Math.round(marginPercent(data))}%</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="text-lg font-semibold">{Math.round(Number(data?.progress?.percentage||0))}%</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-xs text-gray-500">Variations</div>
            <div className="text-lg font-semibold">{variations.length} ({fmtMoney(variationSum)})</div>
          </div>
        </div>
        <div className="px-4">
          <div className="flex gap-4 border-b">
            {['overview','milestones','costs','variations','documents'].map(k=>(
              <button key={k} onClick={()=>setTab(k)} className={`px-3 py-2 text-sm ${tab===k ? 'border-b-2 border-orange-500 text-[#0B2A3C]' : 'text-gray-600'}`}>{k[0].toUpperCase()+k.slice(1)}</button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {loading && (<div>Loading...</div>)}
          {error && (<div className="text-red-600">{error}</div>)}
          {!loading && !error && tab==='overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <div className="text-base font-semibold text-[#0B2A3C] mb-2">Project Information</div>
                <div className="text-sm">
                  <div><span className="font-semibold">Start Date:</span> {data?.startDate ? new Date(data.startDate).toLocaleDateString('en-AU') : '-'}</div>
                  <div><span className="font-semibold">End Date:</span> {data?.expectedEndDate ? new Date(data.expectedEndDate).toLocaleDateString('en-AU') : '-'}</div>
                  <div><span className="font-semibold">Code:</span> {data?.number || '-'}</div>
                  <div><span className="font-semibold">Client:</span> {data?.customerName || '-'}</div>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] p-4">
                <div className="text-base font-semibold text-[#0B2A3C] mb-2">Milestone Summary</div>
                <div className="text-sm">
                  <div>✓ Completed: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>isDoneMilestone(m.status)).length : 0}</div>
                  <div>⌛ In Progress: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>String(m.status||'').toUpperCase()==='IN_PROGRESS').length : 0}</div>
                  <div>△ Overdue: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>{ const done = isDoneMilestone(m.status); const d = m.dueDate ? new Date(m.dueDate) : null; return !done && d && d < new Date() }).length : 0}</div>
                </div>
              </div>
            </div>
          )}
          {!loading && !error && tab==='milestones' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-[#0B2A3C]">Milestones</div>
                <div className="text-sm text-gray-600">Add / edit / delete</div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="text-[#0B2A3C] font-semibold">Progress</div>
                  <div className="text-gray-700">{Math.round(milestonesProgress.percent)}%</div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[var(--color-secondary)]" style={{ width: `${milestonesProgress.percent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                <input className="border rounded px-2 py-1 md:col-span-2" placeholder="Name" value={milestoneDraft.name} onChange={(e)=>setMilestoneDraft({ ...milestoneDraft, name: e.target.value })} />
                <select className="border rounded px-2 py-1" value={milestoneDraft.status} onChange={(e)=>setMilestoneDraft({ ...milestoneDraft, status: e.target.value })}>
                  {milestoneStatusFlow.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="number" min="0" max="100" step="1" className="border rounded px-2 py-1" value={Number(milestoneDraft.weightPercentage || 0)} onChange={(e)=>setMilestoneDraft({ ...milestoneDraft, weightPercentage: Number(e.target.value) })} />
                <input type="date" className="border rounded px-2 py-1" value={milestoneDraft.dueDate} onChange={(e)=>setMilestoneDraft({ ...milestoneDraft, dueDate: e.target.value })} />
                <div className="flex gap-2">
                  {editingMilestoneId ? (
                    <>
                      <button disabled={saving} onClick={cancelEditMilestone} className="px-3 py-1 rounded border border-[var(--color-border)] text-sm disabled:opacity-50">Cancel</button>
                      <button disabled={saving} onClick={()=>saveMilestone(editingMilestoneId)} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                    </>
                  ) : (
                    <button disabled={saving} onClick={addMilestone} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : '+ Add'}</button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Weight</th>
                      <th className="p-2">Planned</th>
                      <th className="p-2">Due</th>
                      <th className="p-2">Actual</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.length === 0 ? (
                      <tr className="border-t"><td className="p-2 text-gray-600" colSpan={8}>No milestones</td></tr>
                    ) : milestones.map(m=>(
                      <tr key={m.id} className="border-t">
                        <td className="p-2">
                          <div className="flex gap-2">
                            {String(m.status||'').toUpperCase()==='PLANNED' && (
                              <>
                                <button disabled={saving} onClick={()=>startEditMilestone(m)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-[var(--color-secondary)] text-white disabled:opacity-50" aria-label="Edit milestone" title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>
                                </button>
                                <button disabled={saving} onClick={()=>deleteMilestone(m.id)} className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-600 text-white disabled:opacity-50" aria-label="Delete milestone" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-2">{m.name}</td>
                        <td className="p-2">{String(m.status || '').toUpperCase()}</td>
                        <td className="p-2">{Number(m.weightPercentage || 0)}%</td>
                        <td className="p-2">{m.plannedDate ? new Date(m.plannedDate).toLocaleDateString('en-AU') : '-'}</td>
                        <td className="p-2">{m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-AU') : '-'}</td>
                        <td className="p-2">{m.actualDate ? new Date(m.actualDate).toLocaleDateString('en-AU') : '-'}</td>
                        <td className="p-2">
                          {(() => {
                            const cur = String(m.status||'').toUpperCase()
                            const idx = milestoneStatusFlow.indexOf(cur)
                            const next = idx>=0 && idx < milestoneStatusFlow.length-1 ? milestoneStatusFlow[idx+1] : null
                            if (!next) return null
                            return (
                              <div className="flex justify-end">
                                <button disabled={saving} className="px-2 py-1 rounded bg-[var(--color-secondary)] text-white text-xs disabled:opacity-50" onClick={()=> setMilestoneStatus(m.id, next)}>{next}</button>
                              </div>
                            )
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab==='variations' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-[#0B2A3C]">Variations</div>
                <div className="text-sm text-gray-600">Add / edit / delete</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
                <input className="border rounded px-2 py-1 md:col-span-3" placeholder="Description" value={variationDraft.description} onChange={(e)=>setVariationDraft({ ...variationDraft, description: e.target.value })} />
                <input type="number" step="0.01" className="border rounded px-2 py-1" value={Number(variationDraft.amount || 0)} onChange={(e)=>setVariationDraft({ ...variationDraft, amount: Number(e.target.value) })} />
                <label className="flex items-center gap-2 border rounded px-2 py-1">
                  <input type="checkbox" checked={!!variationDraft.approved} onChange={(e)=>setVariationDraft({ ...variationDraft, approved: e.target.checked })} />
                  Approved
                </label>
                <div className="flex gap-2">
                  {editingVariationId ? (
                    <>
                      <button disabled={saving} onClick={cancelEditVariation} className="px-3 py-1 rounded border border-[var(--color-border)] text-sm disabled:opacity-50">Cancel</button>
                      <button disabled={saving} onClick={()=>saveVariation(editingVariationId)} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                    </>
                  ) : (
                    <button disabled={saving} onClick={addVariation} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : '+ Add'}</button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr><th className="p-2">Description</th><th className="p-2">Amount</th><th className="p-2">Approved</th><th className="p-2">Approved Date</th><th className="p-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {variations.length === 0 ? (
                      <tr className="border-t"><td className="p-2 text-gray-600" colSpan={5}>No variations</td></tr>
                    ) : variations.map((v,i)=>(
                      <tr key={v.id||i} className="border-t">
                        <td className="p-2">{v.description || '-'}</td>
                        <td className="p-2">{fmtMoney(v.amount||0)}</td>
                        <td className="p-2">{String(!!v.approved)}</td>
                        <td className="p-2">{v.approvedDate ? new Date(v.approvedDate).toLocaleDateString('en-AU') : '-'}</td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <button disabled={saving} onClick={()=>startEditVariation(v)} className="px-2 py-1 rounded bg-[var(--color-secondary)] text-white text-xs disabled:opacity-50">Edit</button>
                            <button disabled={saving} onClick={()=>deleteVariation(v.id)} className="px-2 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-50">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab==='documents' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-semibold text-[#0B2A3C]">Documents</div>
                <div className="text-sm text-gray-600">Add / edit / delete</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
                <input className="border rounded px-2 py-1" placeholder="Type" value={documentDraft.type} onChange={(e)=>setDocumentDraft({ ...documentDraft, type: e.target.value })} />
                <input className="border rounded px-2 py-1 md:col-span-2" placeholder="File name" value={documentDraft.fileName} onChange={(e)=>setDocumentDraft({ ...documentDraft, fileName: e.target.value })} />
                <input type="date" className="border rounded px-2 py-1" value={documentDraft.uploadedAt} onChange={(e)=>setDocumentDraft({ ...documentDraft, uploadedAt: e.target.value })} />
                <div className="flex gap-2">
                  {editingDocumentId ? (
                    <>
                      <button disabled={saving} onClick={cancelEditDocument} className="px-3 py-1 rounded border border-[var(--color-border)] text-sm disabled:opacity-50">Cancel</button>
                      <button disabled={saving} onClick={()=>saveDocument(editingDocumentId)} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                    </>
                  ) : (
                    <button disabled={saving} onClick={addDocument} className="px-3 py-1 rounded bg-[var(--color-primary)] text-white text-sm disabled:opacity-50">{saving ? 'Saving...' : '+ Add'}</button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr><th className="p-2">Type</th><th className="p-2">File</th><th className="p-2">Uploaded</th><th className="p-2 text-right">Actions</th></tr></thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr className="border-t"><td className="p-2 text-gray-600" colSpan={4}>No documents</td></tr>
                    ) : documents.map((d,i)=>(
                      <tr key={d.id||i} className="border-t">
                        <td className="p-2">{d.type || '-'}</td>
                        <td className="p-2">{d.fileName || '-'}</td>
                        <td className="p-2">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-AU') : '-'}</td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <button disabled={saving} onClick={()=>startEditDocument(d)} className="px-2 py-1 rounded bg-[var(--color-secondary)] text-white text-xs disabled:opacity-50">Edit</button>
                            <button disabled={saving} onClick={()=>deleteDocument(d.id)} className="px-2 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-50">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab==='costs' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <div className="text-sm text-gray-600">Costs view placeholder</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
