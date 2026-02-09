"use client"
export default function StatusChip({ status, className = "" }){
  const k = String(status || '').toLowerCase()
  const map = {
    pending: ['var(--status-pending-bg)', 'var(--status-pending-text)'],
    sent: ['var(--status-pending-bg)', 'var(--status-pending-text)'],
    approved: ['var(--status-approved-bg)', 'var(--status-approved-text)'],
    accepted: ['var(--status-approved-bg)', 'var(--status-approved-text)'],
    rejected: ['var(--status-rejected-bg)', 'var(--status-rejected-text)'],
    declined: ['var(--status-rejected-bg)', 'var(--status-rejected-text)'],
    converted: ['var(--status-converted-bg)', 'var(--status-converted-text)'],
    expired: ['var(--status-expired-bg)', 'var(--status-expired-text)'],
    planned: ['var(--status-pending-bg)', 'var(--status-pending-text)'],
    in_progress: ['var(--status-converted-bg)', 'var(--status-converted-text)'],
    active: ['var(--status-converted-bg)', 'var(--status-converted-text)'],
    completed: ['var(--status-approved-bg)', 'var(--status-approved-text)'],
    cancelled: ['var(--status-rejected-bg)', 'var(--status-rejected-text)'],
    delayed: ['var(--status-pending-bg)', 'var(--status-pending-text)'],
    archived: ['var(--status-archive-bg)', 'var(--status-archive-text)'],
    on_hold: ['var(--status-onhold-bg)', 'var(--status-onhold-text)']
  }
  const key = Object.keys(map).find(k2 => k.includes(k2)) || null
  const m = key ? map[key] : ['var(--color-neutral)', 'var(--color-text)']
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-semibold text-white ${className}`} style={{ backgroundColor: m[0], color: '#fff' }}>
      {status || 'DRAFT'}
    </span>
  )
}
