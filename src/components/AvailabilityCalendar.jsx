import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../context/ToastContext'
import './AvailabilityCalendar.css'

import { API_URL } from '../config.js'

const API = API_URL
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

// What weekday does the 1st fall on (0=Mon…6=Sun)
function firstDayOffset(year, month) {
  const d = new Date(year, month - 1, 1).getDay()
  return d === 0 ? 6 : d - 1
}

function toDateStr(year, month, day) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

export default function AvailabilityCalendar({ photographerSlug, token, isOwner }) {
  const toast = useToast()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [avMap, setAvMap] = useState({}) // date string → boolean
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState(null) // date being toggled

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/availability?year=${year}&month=${month}`)
      if (res.ok) {
        const data = await res.json()
        const map = {}
        data.forEach(entry => { map[entry.date] = entry.available })
        setAvMap(map)
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [photographerSlug, year, month])

  useEffect(() => { load() }, [load])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleDayClick = async (dateStr) => {
    if (!isOwner || !token) return
    const current = avMap[dateStr]
    const newVal = current === undefined ? false : !current
    setToggling(dateStr)
    try {
      const res = await fetch(`${API}/photographers/${photographerSlug}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: dateStr, available: newVal }),
      })
      if (!res.ok) throw new Error()
      setAvMap(prev => ({ ...prev, [dateStr]: newVal }))
    } catch {
      toast.error('Failed to update availability.')
    } finally {
      setToggling(null)
    }
  }

  const total = daysInMonth(year, month)
  const offset = firstDayOffset(year, month)
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate())

  return (
    <div className="av-cal">
      {/* Navigation */}
      <div className="av-cal__nav">
        <button className="av-cal__nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
        <span className="av-cal__month-label">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button className="av-cal__nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      {/* Legend */}
      <div className="av-cal__legend">
        <span className="av-cal__legend-item av-cal__legend-item--avail">Available</span>
        <span className="av-cal__legend-item av-cal__legend-item--busy">Busy</span>
        {isOwner && <span className="av-cal__legend-hint">Click a day to toggle</span>}
      </div>

      {/* Day headers */}
      <div className="av-cal__grid">
        {DAY_NAMES.map(d => (
          <div key={d} className="av-cal__day-name">{d}</div>
        ))}

        {/* Empty cells before 1st */}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`empty-${i}`} className="av-cal__cell av-cal__cell--empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: total }, (_, i) => {
          const day = i + 1
          const dateStr = toDateStr(year, month, day)
          const isPast = dateStr < todayStr
          const isToday = dateStr === todayStr
          const av = avMap[dateStr]
          const isToggling = toggling === dateStr

          let stateClass = ''
          if (av === true) stateClass = 'av-cal__cell--avail'
          else if (av === false) stateClass = 'av-cal__cell--busy'

          return (
            <button
              key={day}
              className={[
                'av-cal__cell',
                stateClass,
                isPast ? 'av-cal__cell--past' : '',
                isToday ? 'av-cal__cell--today' : '',
                isOwner && !isPast ? 'av-cal__cell--clickable' : '',
                isToggling ? 'av-cal__cell--toggling' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !isPast && handleDayClick(dateStr)}
              disabled={isPast || isToggling || loading}
              aria-label={`${dateStr}${av !== undefined ? ': ' + (av ? 'available' : 'busy') : ''}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
