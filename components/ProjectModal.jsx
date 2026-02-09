import { useEffect, useState } from 'react'
import StatusChip from './StatusChip'

export default function ProjectModal({ open, onClose, projectId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  useEffect(()=>{
    if (!open || !projectId) return
    setLoading(true); setError(null); setData(null)
    fetch(`/api/projects/${projectId}`)
      .then(r=> r.ok ? r.json() : Promise.reject(new Error('Failed to load project')))
      .then(d=> setData(d))
      .catch(e=> setError(e.message||'Error'))
      .finally(()=> setLoading(false))
  }, [open, projectId])
  if (!open) return null
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
  const variations = Array.isArray(data?.variations) ? data.variations : []
  const variationSum = variations.reduce((a,v)=> a + Number(v.amount||0), 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl">
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
                  <div>✓ Completed: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>String(m.status||'').toUpperCase()==='COMPLETED').length : 0}</div>
                  <div>⌛ In Progress: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>String(m.status||'').toUpperCase()==='IN_PROGRESS').length : 0}</div>
                  <div>△ Overdue: {Array.isArray(data?.milestones) ? data.milestones.filter(m=>{ const s = String(m.status||'').toUpperCase(); const d = m.dueDate ? new Date(m.dueDate) : null; return s!=='COMPLETED' && d && d < new Date() }).length : 0}</div>
                </div>
              </div>
            </div>
          )}
          {!loading && !error && tab==='milestones' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr><th className="p-2">Name</th><th className="p-2">Status</th><th className="p-2">Weight</th><th className="p-2">Planned</th><th className="p-2">Due</th><th className="p-2">Actual</th></tr>
                </thead>
                <tbody>
                  {(Array.isArray(data?.milestones)?data.milestones:[]).map(m=>(
                    <tr key={m.id} className="border-t">
                      <td className="p-2">{m.name}</td>
                      <td className="p-2">{m.status}</td>
                      <td className="p-2">{m.weightPercentage || 0}%</td>
                      <td className="p-2">{m.plannedDate ? new Date(m.plannedDate).toLocaleDateString('en-AU') : '-'}</td>
                      <td className="p-2">{m.dueDate ? new Date(m.dueDate).toLocaleDateString('en-AU') : '-'}</td>
                      <td className="p-2">{m.actualDate ? new Date(m.actualDate).toLocaleDateString('en-AU') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && tab==='variations' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <table className="w-full text-left text-sm">
                <thead><tr><th className="p-2">Description</th><th className="p-2">Amount</th><th className="p-2">Approved</th><th className="p-2">Approved Date</th></tr></thead>
                <tbody>
                  {(Array.isArray(data?.variations)?data.variations:[]).map((v,i)=>(
                    <tr key={v.id||i} className="border-t">
                      <td className="p-2">{v.description || '-'}</td>
                      <td className="p-2">{fmtMoney(v.amount||0)}</td>
                      <td className="p-2">{String(v.approved||false)}</td>
                      <td className="p-2">{v.approvedDate ? new Date(v.approvedDate).toLocaleDateString('en-AU') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !error && tab==='documents' && (
            <div className="rounded-xl border border-[var(--color-border)] p-4">
              <table className="w-full text-left text-sm">
                <thead><tr><th className="p-2">Type</th><th className="p-2">File</th><th className="p-2">Uploaded</th></tr></thead>
                <tbody>
                  {(Array.isArray(data?.documents)?data.documents:[]).map((d,i)=>(
                    <tr key={d.id||i} className="border-t">
                      <td className="p-2">{d.type || '-'}</td>
                      <td className="p-2">{d.fileName || '-'}</td>
                      <td className="p-2">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-AU') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
