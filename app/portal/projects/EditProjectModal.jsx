"use client"
import { useEffect, useMemo, useState } from "react"

export default function EditProjectModal({ open, onClose, project, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const initial = useMemo(() => {
    const p = project || {}
    const toDateInput = (v) => (v ? String(v).slice(0, 10) : "")
    return {
      name: p.name || "",
      startDate: toDateInput(p.startDate),
      expectedEndDate: toDateInput(p.expectedEndDate),
      actualEndDate: toDateInput(p.actualEndDate),
      budget: String(p.budget ?? 0),
      notes: p.notes || ""
    }
  }, [project])

  const [form, setForm] = useState(initial)

  useEffect(() => {
    if (!open) return
    setForm(initial)
    setError(null)
  }, [open, initial])

  if (!open) return null

  const save = async () => {
    if (!project?.id) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: String(form.name || "").trim(),
        startDate: form.startDate || null,
        expectedEndDate: form.expectedEndDate || null,
        actualEndDate: form.actualEndDate || null,
        budget: Number(form.budget || 0),
        notes: form.notes || ""
      }
      if (!payload.name) {
        setError("Name is required")
        setSaving(false)
        return
      }
      const r = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (!r.ok) throw new Error("Failed to save project")
      const d = await r.json()
      onSaved && onSaved(d)
      onClose && onClose()
    } catch (e) {
      setError(e.message || "Error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 bg-white w-[95vw] max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold text-[#0B2A3C]">Edit Project</div>
          <button className="px-3 py-1 rounded-lg bg-gray-700 text-white" onClick={onClose}>Close</button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Start Date</label>
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Expected End Date</label>
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.expectedEndDate} onChange={(e) => setForm({ ...form, expectedEndDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Actual End Date</label>
            <input type="date" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.actualEndDate} onChange={(e) => setForm({ ...form, actualEndDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Budget</label>
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700">Notes</label>
            <textarea rows={4} className="mt-1 w-full border rounded-lg px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          {error && <div className="md:col-span-2 text-red-600">{error}</div>}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button disabled={saving} className="px-4 py-2 rounded-lg border border-[var(--color-border)] disabled:opacity-50" onClick={onClose}>Cancel</button>
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white disabled:opacity-50" onClick={save}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  )
}
