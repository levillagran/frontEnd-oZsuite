"use client"
import StatusChip from '@/components/StatusChip'
import { jsPDF } from 'jspdf'
export default function InvoiceModal({ open, onClose, data, loading, error }){
  if (!open) return null
  const currency = data?.currency || 'AUD'
  const nf = new Intl.NumberFormat('en-AU', { style:'currency', currency })
  const fmt = (n)=> nf.format(Number(n||0))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white w-[95vw] max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold">Quote {data?.number || data?.id}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded-lg bg-[var(--color-secondary)] text-white hover:opacity-90"
              onClick={()=>{
                if (!data) return
                const doc = new jsPDF({ unit:'pt', format:'a4' })
                let y = 40
                const left = 40
                const right = 555
                doc.setFontSize(11)
                doc.text('Brenick Build & Construct', right, y, { align:'right' }); y+=14
                const contact = [`Ph: ${data.client?.phone||''}`, `Email: ${data.client?.email||''}`].filter(Boolean)
                if (contact.length){ doc.text(contact.join('   '), right, y, { align:'right' }); y+=14 }
                doc.setDrawColor(150); doc.line(left, y, right, y); y+=22
                doc.setFontSize(13)
                doc.setTextColor(0)
                doc.setFillColor(235,235,235)
                const title = `${data.number || data.id || ''} - ${data.project?.name || data.description || ''}`
                doc.rect(left, y-16, right-left, 24, 'F')
                doc.text(title, (left+right)/2, y, { align:'center' }); y+=30
                doc.setFontSize(11)
                const addrL = [data.client?.name, data.client?.address, data.client?.cityTown, data.client?.state, data.client?.postCode].filter(Boolean)
                let yL = y
                addrL.forEach(line=>{ doc.text(String(line), left, yL); yL+=14 })
                const metaR = [
                  `Quote Number: ${data.number || data.id || '-'}`,
                  `Quote Valid: 30 days`,
                  `Building Type: ${data.buildingType || '-'}`,
                  `Quote Date: ${data.issueDate || '-'}`
                ]
                let yR = y
                metaR.forEach(line=>{ doc.text(String(line), right, yR, { align:'right' }); yR+=14 }
                )
                y = Math.max(yL, yR) + 18
                doc.setDrawColor(150); doc.line(left, y, right, y); y+=22
                doc.setFontSize(11)
                const para = [
                  `Dear ${data.client?.name || 'Client'},`,
                  ``,
                  `Thank you for the opportunity to provide a quotation for your new home.`,
                  ``,
                  `Please feel free to call if you have any questions or matters you would like to discuss as you review the quote.`,
                  ``,
                  `This quote is based on the plans and documents provided and represents a ballpark figure only.`,
                  ``,
                  `If you would like to proceed with this quote, we will forward you a final quote including a detailed specifications list, and an 'Authority to proceed' form, which you will need to sign and return to us so we can proceed.`,
                ]
                para.forEach(t=>{ doc.text(t, left, y); y+=16 })
                y+=10
                doc.setFontSize(12)
                doc.setFillColor(235,235,235)
                doc.rect(left, y, right-left, 24, 'F')
                doc.text('Quoted Items', (left+right)/2, y+16, { align:'center' }); y+=34
                const headers = ['No.','Category','Description','Qty','Unit','Unit Price','Total']
                const widths = [30,90,210,45,45,70,25]
                const colX = [left]
                for (let i=0;i<widths.length;i++){ colX[i] = (i===0?left:colX[i-1]+widths[i-1]) }
                const tableWidth = widths.reduce((a,b)=>a+b,0)
                const drawHeader = ()=>{
                  doc.setFillColor(240,240,240)
                  doc.rect(left, y, tableWidth, 22, 'F')
                  doc.setDrawColor(180); doc.rect(left, y, tableWidth, 22, 'S')
                  doc.setFont(undefined,'bold')
                  headers.forEach((h,i)=>{
                    const x = colX[i] + 8
                    const alignRight = (h==='Qty' || h==='Unit Price' || h==='Total')
                    doc.text(h, alignRight ? colX[i]+widths[i]-8 : x, y+14, { align: alignRight ? 'right' : 'left' })
                  })
                  for (let i=1;i<headers.length;i++){ doc.line(colX[i], y, colX[i], y+22) }
                  doc.setFont(undefined,'normal')
                  y+=24
                }
                drawHeader()
                const items = Array.isArray(data.items) ? data.items : []
                items.forEach((it, idx)=>{
                  const rowH = 20
                  if (y+rowH>770){
                    doc.addPage(); y=60; drawHeader()
                  }
                  if (idx%2===1){ doc.setFillColor(248,248,248); doc.rect(left, y, tableWidth, rowH, 'F') }
                  doc.setDrawColor(220); doc.rect(left, y, tableWidth, rowH, 'S')
                  for (let i=1;i<headers.length;i++){ doc.line(colX[i], y, colX[i], y+rowH) }
                  const cells = [
                    String(idx+1),
                    String(it.category||''),
                    String(it.description||''),
                    String(Number(it.quantity||0).toFixed(3)),
                    String(it.unit||''),
                    fmt(it.unitPrice),
                    fmt(it.total)
                  ]
                  cells.forEach((c,i)=>{
                    const alignRight = (i>=3 && i!==4)
                    const x = alignRight ? colX[i]+widths[i]-8 : colX[i]+8
                    doc.text(c, x, y+14, { align: alignRight ? 'right' : 'left' })
                  })
                  y+=rowH
                })
                y+=20
                doc.setFillColor(235,235,235)
                doc.rect(left, y, right-left, 24, 'F')
                doc.text('Terms and Conditions', (left+right)/2, y+16, { align:'center' }); y+=30
                const terms = `This quotation is valid for 30 days from the date of delivery. Pricing is subject to site conditions and required approvals.`
                doc.setFontSize(11)
                doc.text(terms, left+12, y, { maxWidth: (right-left)-180 })
                const boxX = right-220
                const boxY = y-6
                doc.setDrawColor(150)
                doc.rect(boxX, boxY, 200, 90, 'S')
                const subtotal = fmt(data.subtotal)
                const tax = `${fmt(data.taxAmount)} (${Math.round(Number(data.taxRate||0)*100)}%)`
                const total = fmt(data.totalAmount)
                doc.text('Quote Total:', boxX+14, boxY+24)
                doc.text(subtotal, boxX+186, boxY+24, { align:'right' })
                doc.text('Tax (GST):', boxX+14, boxY+46)
                doc.text(tax, boxX+186, boxY+46, { align:'right' })
                doc.setFont(undefined,'bold')
                doc.text('Total:', boxX+14, boxY+70)
                doc.text(total, boxX+186, boxY+70, { align:'right' })
                doc.setFont(undefined,'normal')
                y = boxY + 110
                y+=30
                doc.text('Kind Regards', left, y); y+=18
                doc.text('Brenick Build & Construct', left, y)
                const fname = `quote-${(data.number||data.id||'invoice').toString().replace(/\s+/g,'-')}.pdf`
                doc.save(fname)
              }}
            >Download</button>
            <button className="px-3 py-1 rounded-lg bg-gray-700 text-white" onClick={onClose}>Close</button>
          </div>
        </div>
        {loading && <div className="p-4">Loading...</div>}
        {!loading && error && <div className="p-4 text-red-600">{error}</div>}
        {!loading && !error && data && (
          <div className="p-4 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 bg-[var(--color-surface)] p-4 rounded-xl">
                <div className="text-sm">Client</div>
                <div className="font-semibold">{data.client?.name || '-'}</div>
              <div className="text-sm">{[data.client?.address, data.client?.cityTown, data.client?.state, data.client?.postCode].filter(Boolean).join(', ')}</div>
              <div className="text-sm">{[data.client?.phone, data.client?.mobile, data.client?.email].filter(Boolean).join(' • ')}</div>
              </div>
              <div className="flex-1 bg-[var(--color-surface)] p-4 rounded-xl">
              <div className="text-sm">Details</div>
              <div>Project: {data.project?.name || data.description || '-'}</div>
              <div>Issue: {data.issueDate || '-'}</div>
              <div>Expiry: {data.expiryDate || '-'}</div>
              <div>Building: {data.buildingType || '-'}</div>
              <div>Source: {data.source || '-'}</div>
              <div className="mt-1"><StatusChip status={data.status} /></div>
            </div>
          </div>
          <div className="bg-[var(--color-surface)] p-4 rounded-xl">
            <div className="font-semibold mb-2">Works Location</div>
            <div className="text-sm">{[data.worksLocation?.address, data.worksLocation?.cityTown, data.worksLocation?.state, data.worksLocation?.postCode].filter(Boolean).join(', ') || '-'}</div>
          </div>
            <div className="bg-[var(--color-surface)] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="oz-table text-white">
                  <tr>
                    <th className="p-3">No.</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(data.items) ? data.items : []).map((it,i)=> (
                    <tr key={i} className="border-b">
                      <td className="p-3">{i+1}</td>
                      <td className="p-3">{it.category || '-'}</td>
                      <td className="p-3">{it.description}</td>
                      <td className="p-3">{it.quantity}</td>
                      <td className="p-3">{it.unit}</td>
                      <td className="p-3">{fmt(it.unitPrice)}</td>
                      <td className="p-3">{fmt(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-stretch">
              <div className="flex-1 bg-[var(--color-surface)] p-4 rounded-xl">
                <div className="text-sm font-semibold mb-1">Notes</div>
                <div className="text-sm whitespace-pre-wrap">{data.notes || '-'}</div>
              </div>
              <div className="w-full md:w-64 bg-[var(--color-surface)] p-4 rounded-xl">
                <div className="flex justify-between py-1"><span>Subtotal</span><span>{fmt(data.subtotal)}</span></div>
                <div className="flex justify-between py-1"><span>Tax</span><span>{fmt(data.taxAmount)} ({Number(data.taxRate||0)*100}%)</span></div>
                <div className="flex justify-between py-1 font-semibold"><span>Total</span><span>{fmt(data.totalAmount)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
