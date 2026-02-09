"use client"
import { useEffect, useState } from 'react'
export default function NewEstimateWizard({ open, onClose, onCreated, onSaved, mode = 'create', quoteId }){
  if (!open) return null
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [client, setClient] = useState({ name:'', address:'', cityTown:'', state:'', postCode:'', phone:'', mobile:'', email:'' })
  const [project, setProject] = useState({ name:'' })
  const [dates, setDates] = useState({ issueDate:'', expiryDate:'' })
  const [currency, setCurrency] = useState('AUD')
  const [notes, setNotes] = useState('')
  const randId = ()=> 'tmp-' + Math.random().toString(36).slice(2,10)
  const [items, setItems] = useState([{ id: randId(), category:'GENERAL', description:'', quantity:1, unit:'UNIT', unitPrice:0 }])
  const [buildingType, setBuildingType] = useState('')
  const [source, setSource] = useState('')
  const [location, setLocation] = useState({ address:'', cityTown:'', state:'', postCode:'' })
  const [taxRate, setTaxRate] = useState(0.1)
  const [categories, setCategories] = useState([])
  const [suggestIdx, setSuggestIdx] = useState(null)
  const [units, setUnits] = useState([])
  const [suggestUnitIdx, setSuggestUnitIdx] = useState(null)
  const addItem = ()=> setItems(prev=>[{ id: randId(), category:'GENERAL', description:'', quantity:1, unit:'UNIT', unitPrice:0 }, ...prev])
  const updateItem = (idx, patch)=> setItems(prev=> prev.map((it,i)=> i===idx ? { ...it, ...patch } : it))
  const removeItem = (idx)=> setItems(prev=> prev.filter((_,i)=> i!==idx))
  const computeTotal = (it)=> Number(it.quantity||0) * Number(it.unitPrice||0)
  const next = ()=> setStep(s=> Math.min(s+1,4))
  const prev = ()=> setStep(s=> Math.max(s-1,0))
  useEffect(()=>{
    if (!open || mode !== 'edit' || !quoteId) return
    setError(null)
    fetch(`/api/quotes/${quoteId}`)
      .then(r=> r.ok ? r.json() : Promise.reject(new Error('Failed to load quote')))
      .then(d=>{
        setClient({ name: d.client?.name || '', address: d.client?.address || '', cityTown: d.client?.cityTown || '', state: d.client?.state || '', postCode: d.client?.postCode || '', phone: d.client?.phone || '', mobile: d.client?.mobile || '', email: d.client?.email || '' })
        setProject({ name: d.project?.name || d.description || '' })
        setDates({ issueDate: d.issueDate || '', expiryDate: d.expiryDate || '' })
        setCurrency(d.currency || 'AUD')
        setNotes(d.notes || '')
        setLocation({ address: d.worksLocation?.address || '', cityTown: d.worksLocation?.cityTown || '', state: d.worksLocation?.state || '', postCode: d.worksLocation?.postCode || '' })
        const its = Array.isArray(d.items) ? d.items.map(it=> ({ id: it.id || randId(), category: it.category || 'GENERAL', description: it.description || '', quantity: Number(it.quantity||0), unit: it.unit || '', unitPrice: Number(it.unitPrice||0) })) : [{ id: randId(), category:'GENERAL', description:'', quantity:1, unit:'UNIT', unitPrice:0 }]
        setItems(its.length ? its : [{ id: randId(), category:'GENERAL', description:'', quantity:1, unit:'UNIT', unitPrice:0 }])
      })
      .catch(e=> setError(e.message||'Error'))
  }, [open, mode, quoteId])
  useEffect(()=>{
    if (!open) return
    fetch('/api/category')
      .then(r=> r.ok ? r.json() : [])
      .then(list=> setCategories(Array.isArray(list)? list.filter(c=> String(c.group||'')==='CORE_COST') : []))
      .catch(()=> setCategories([]))
    fetch('/api/units')
      .then(r=> r.ok ? r.json() : [])
      .then(list=> setUnits(Array.isArray(list)? list.filter(u=> String(u.phase||'')==='MVP') : []))
      .catch(()=> setUnits([]))
  }, [open])
  useEffect(()=>{
    if (!open || mode !== 'create') return
    const fmt = (d)=> d.toISOString().slice(0,10)
    const now = new Date()
    const exp = new Date(now)
    exp.setMonth(exp.getMonth() + 1)
    setDates(prev=> ({ issueDate: prev.issueDate || fmt(now), expiryDate: prev.expiryDate || fmt(exp) }))
  }, [open, mode])
  const save = async ()=>{
    setSaving(true); setError(null)
    try{
      const known = categories.map(c=> String(c.label||'').toLowerCase())
      const newCats = Array.from(new Set(items.map(it=> String(it.category||'').trim()).filter(label=> label && !known.includes(label.toLowerCase()))))
      for (const label of newCats) {
        await fetch('/api/category', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({
            code: label.toUpperCase().replace(/\s+/g,'_'),
            label: label[0].toUpperCase() + label.slice(1),
            phase: 'MVP',
            group: 'CORE_COST'
          })
        }).catch(()=>{})
      }
      const payload = {
        client,
        description: project.name,
        issueDate: dates.issueDate,
        expiryDate: dates.expiryDate,
        currency,
        notes,
        project,
        buildingType,
        source,
        worksLocation: { address: location.address, cityTown: location.cityTown, state: location.state, postCode: location.postCode },
        taxRate,
        items: items.map(it=> ({ id: it.id || randId(), category: it.category || 'GENERAL', description: it.description, quantity: it.quantity, unit: it.unit, unitPrice: it.unitPrice, total: computeTotal(it) })),
        status: mode === 'edit' ? undefined : 'draft'
      }
      const url = mode === 'edit' && quoteId ? `/api/quotes/${quoteId}` : '/api/quotes'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error(mode==='edit' ? 'Failed to save estimate' : 'Failed to create estimate')
      const result = await r.json()
      if (mode === 'edit') { onSaved && onSaved(result) } else { onCreated && onCreated(result) }
      onClose && onClose()
    }catch(e){ setError(e.message||'Error') }
    finally{ setSaving(false) }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`relative bg-white w-[96vw] max-w-4xl ${step===3?'h-[90vh]':'max-h-[90vh]'} overflow-y-auto rounded-2xl shadow-xl`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold">{mode==='edit' ? 'Edit Estimate' : 'New Estimate'}</div>
          <button className="px-3 py-1 rounded-lg bg-gray-700 text-white" onClick={onClose}>Close</button>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            {['Client','Project','Work Location','Items','Review'].map((t,i)=> (
              <div key={i} className={`px-3 py-1 rounded ${step===i? 'bg-[var(--color-secondary)] text-white':'bg-[var(--color-surface-alt)]'}`}>{t}</div>
            ))}
          </div>
          {step===0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Client Name</label>
                <input className="w-full border rounded p-2" value={client.name} onChange={e=>setClient({ ...client, name:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Address</label>
                <input className="w-full border rounded p-2" value={client.address} onChange={e=>setClient({ ...client, address:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">City/Town</label>
                <input className="w-full border rounded p-2" value={client.cityTown} onChange={e=>setClient({ ...client, cityTown:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">State</label>
                <input className="w-full border rounded p-2" value={client.state} onChange={e=>setClient({ ...client, state:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Post Code</label>
                <input className="w-full border rounded p-2" value={client.postCode} onChange={e=>setClient({ ...client, postCode:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Phone</label>
                <input className="w-full border rounded p-2" value={client.phone} onChange={e=>setClient({ ...client, phone:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Mobile</label>
                <input className="w-full border rounded p-2" value={client.mobile} onChange={e=>setClient({ ...client, mobile:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input type="email" className="w-full border rounded p-2" value={client.email} onChange={e=>setClient({ ...client, email:e.target.value })} />
              </div>
            </div>
          )}
          {step===1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Project Name</label>
                <input className="w-full border rounded p-2" value={project.name} onChange={e=>setProject({ ...project, name:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Currency</label>
                <select className="w-full border rounded p-2" value={currency} onChange={e=>setCurrency(e.target.value)}>
                  <option value="AUD">AUD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Building Type</label>
                <input className="w-full border rounded p-2" value={buildingType} onChange={e=>setBuildingType(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm">Source</label>
                <input className="w-full border rounded p-2" value={source} onChange={e=>setSource(e.target.value)} />
              </div>
            </div>
          )}
          {step===2 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm">Address</label>
                <input className="w-full border rounded p-2" value={location.address} onChange={e=>setLocation({ ...location, address:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">City/Town</label>
                <input className="w-full border rounded p-2" value={location.cityTown} onChange={e=>setLocation({ ...location, cityTown:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">State</label>
                <input className="w-full border rounded p-2" value={location.state} onChange={e=>setLocation({ ...location, state:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm">Post Code</label>
                <input className="w-full border rounded p-2" value={location.postCode} onChange={e=>setLocation({ ...location, postCode:e.target.value })} />
              </div>
            </div>
          )}
          {step===3 && (
            <div>
              <div className="flex justify-between mb-2">
                <div className="font-semibold">Items</div>
                <button className="px-3 py-1 rounded bg-[var(--color-primary)] text-white" onClick={addItem}>Add Item</button>
              </div>
              <div className="overflow-x-auto bg-white shadow-xl rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="oz-table bg-[var(--color-primary)] text-white text-sm">
                    <tr>
                      <th className="p-1 w-32">Category</th>
                      <th className="p-1">Description</th>
                      <th className="p-1 w-16">Qty</th>
                      <th className="p-1 w-16">Unit</th>
                      <th className="p-1 w-24">Unit Price</th>
                      <th className="p-1">Total</th>
                      <th className="p-1 w-12 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it,idx)=> (
                      <tr key={idx} className="border-b">
                        <td className="p-2 w-32">
                          <div className="relative w-32">
                            <input className="w-32 border rounded p-2" value={it.category} onChange={e=>{ updateItem(idx,{ category:e.target.value }); setSuggestIdx(idx) }} onFocus={()=> setSuggestIdx(idx)} onBlur={()=> setTimeout(()=> setSuggestIdx(null), 150)} placeholder="Category" />
                            {suggestIdx===idx && (
                              <div className="absolute z-10 mt-1 w-32 bg-white border rounded shadow max-h-40 overflow-auto">
                                {(categories.filter(c=> String(c.group||'')==='CORE_COST' && String(c.label||'').toLowerCase().includes(String(it.category||'').toLowerCase())).slice(0,8)).map((c,i)=> (
                                  <div key={i} className="px-2 py-1 hover:bg-[var(--color-surface-alt)] cursor-pointer" onMouseDown={()=>{ updateItem(idx,{ category:c.label }); setSuggestIdx(null) }}>
                                    {c.label}
                                  </div>
                                ))}
                                {categories.length===0 && <div className="px-2 py-1 text-gray-500">No categories</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2"><textarea className="w-full border rounded p-2" rows={2} value={it.description} onChange={e=>updateItem(idx,{ description:e.target.value })} /></td>
                        <td className="p-2 w-16"><input type="number" min="0" className="border rounded p-2 text-center w-16" value={it.quantity} onChange={e=>updateItem(idx,{ quantity:Number(e.target.value) })} /></td>
                        <td className="p-2 w-16">
                          <div className="relative w-16">
                            <input className="border rounded p-2 text-center w-16" value={it.unit} onChange={e=>{ updateItem(idx,{ unit:e.target.value }); setSuggestUnitIdx(idx) }} onFocus={()=> setSuggestUnitIdx(idx)} onBlur={()=> setTimeout(()=> setSuggestUnitIdx(null), 150)} placeholder="Unit" />
                            {suggestUnitIdx===idx && (
                              <div className="absolute z-10 mt-1 w-40 bg-white border rounded shadow max-h-40 overflow-auto right-0">
                                {units.filter(u=> String(u.label||'').toLowerCase().includes(String(it.unit||'').toLowerCase())).slice(0,8).map((u,i)=> (
                                  <div key={i} className="px-2 py-1 hover:bg-[var(--color-surface-alt)] cursor-pointer" onMouseDown={()=>{ updateItem(idx,{ unit:u.code }); setSuggestUnitIdx(null) }}>
                                    {u.label} ({u.code})
                                  </div>
                                ))}
                                {units.length===0 && <div className="px-2 py-1 text-gray-500">No units</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2 w-24"><input type="number" step="0.01" min="0" className="border rounded p-2 text-right w-24" value={it.unitPrice} onChange={e=>updateItem(idx,{ unitPrice:Number(e.target.value) })} /></td>
                        <td className="p-2">{(Number(it.quantity||0)*Number(it.unitPrice||0)).toFixed(2)}</td>
                        <td className="p-2 w-12 text-center">
                          <button className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-600 text-white" onClick={()=>removeItem(idx)} aria-label="Remove">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18"/><path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 w-full md:w-64">
                <label className="block text_sm">Tax Rate</label>
                <input type="number" step="0.01" min="0" max="1" className="w-full border rounded p-2" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value))} />
              </div>
            </div>
          )}
          {step===4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Issue Date</label>
                  <input type="date" className="w-full border rounded p-2" value={dates.issueDate} onChange={e=>setDates({ ...dates, issueDate:e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm">Expiry Date</label>
                  <input type="date" className="w-full border rounded p-2" value={dates.expiryDate} onChange={e=>setDates({ ...dates, expiryDate:e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm">Notes</label>
                <textarea className="w-full border rounded p-2" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <button disabled={saving} className="px-4 py-2 rounded bg-[var(--color-secondary)] text-white" onClick={save}>{saving ? 'Saving...' : (mode==='edit' ? 'Save' : 'Create Estimate')}</button>
              </div>
              {error && <div className="text-red-600">{error}</div>}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button className="px-4 py-2 rounded bg-gray-300" onClick={prev} disabled={step===0}>Back</button>
            <button className="px-4 py-2 rounded bg-[var(--color-primary)] text-white" onClick={next} disabled={step===4}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
