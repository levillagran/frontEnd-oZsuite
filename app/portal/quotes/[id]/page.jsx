"use client"
import { useEffect, useState } from 'react'
export default function QuoteDetail({ params }){
  const { id } = params || {}
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(()=>{
    setLoading(true)
    fetch(`/api/quotes/${id}`)
      .then(r=>r.ok?r.json():Promise.reject(new Error('Failed to load quote')))
      .then(q=>{ setData(q); setError(null) })
      .catch(e=>{ setError(e.message||'Error') })
      .finally(()=>setLoading(false))
  },[id])
  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!data) return <div className="p-4">Not found</div>
  const currency = data.currency || 'AUD'
  const fmt = (n)=> new Intl.NumberFormat('en-AU', { style:'currency', currency }).format(Number(n||0))
  return (
    <section className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quote {data.number || data.id}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="font-semibold mb-2">Client</div>
          <div>{data.client?.name || '-'}</div>
          <div>{data.client?.address || ''} {data.client?.cityTown || ''} {data.client?.state || ''} {data.client?.postCode || ''}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="font-semibold mb-2">Dates</div>
          <div>Issue: {data.issueDate || '-'}</div>
          <div>Expiry: {data.expiryDate || '-'}</div>
          <div>Building: {data.buildingType || '-'}</div>
          <div>Source: {data.source || '-'}</div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="font-semibold mb-2">Works Location</div>
        <div>{[data.worksLocation?.address, data.worksLocation?.cityTown, data.worksLocation?.state, data.worksLocation?.postCode].filter(Boolean).join(', ') || '-'}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="font-semibold mb-2">Items</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="oz-table text-white">
              <tr>
                <th className="p-2">Category</th>
                <th className="p-2">Description</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Unit</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {(data.items||[]).map((it,i)=>(
                <tr key={i} className="border-b">
                  <td className="p-2">{it.category || '-'}</td>
                  <td className="p-2">{it.description}</td>
                  <td className="p-2">{it.quantity}</td>
                  <td className="p-2">{it.unit}</td>
                  <td className="p-2">{fmt(it.unitPrice)}</td>
                  <td className="p-2">{fmt(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <div className="font-semibold mb-2">Totals</div>
        <div>Subtotal: {fmt(data.subtotal)}</div>
        <div>Tax: {fmt(data.taxAmount)} ({Number(data.taxRate||0)*100}%)</div>
        <div>Total: {fmt(data.totalAmount)}</div>
      </div>
    </section>
  )
}
