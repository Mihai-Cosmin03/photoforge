import './UserAvatar.css'
import { API_URL } from '../config.js'

// ── 8 default SVG avatars ─────────────────────────────────────────────────────
// Each is a self-contained SVG illustration

const SVG_AVATARS = [
  // 0 — Bloom (flower petals)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#2d1525"/>
      {[0,60,120,180,240,300].map((angle, i) => (
        <ellipse key={i}
          cx={50 + Math.cos((angle-90)*Math.PI/180)*16}
          cy={50 + Math.sin((angle-90)*Math.PI/180)*16}
          rx="10" ry="16"
          fill={['#f472b6','#e879f9','#c084fc','#a78bfa','#818cf8','#fb7185'][i]}
          opacity="0.82"
          transform={`rotate(${angle},${50+Math.cos((angle-90)*Math.PI/180)*16},${50+Math.sin((angle-90)*Math.PI/180)*16})`}
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="#fdf4ff"/>
      <circle cx="50" cy="50" r="5"  fill="#e879f9"/>
    </svg>
  ),

  // 1 — Prism (overlapping triangles)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#0e1f2e"/>
      <polygon points="50,18 80,68 20,68" fill="#38bdf8" opacity="0.8"/>
      <polygon points="50,82 20,32 80,32" fill="#0ea5e9" opacity="0.5"/>
      <polygon points="30,25 70,25 85,65 50,85 15,65" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="50" cy="50" r="7" fill="#e0f2fe" opacity="0.9"/>
    </svg>
  ),

  // 2 — Luna (moon & stars)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#0f0a1e"/>
      <path d="M58 20 A24 24 0 1 0 58 80 A18 18 0 1 1 58 20Z" fill="#fbbf24" opacity="0.9"/>
      {[[22,28],[72,22],[78,60],[30,72],[65,75]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={[2,1.5,2,1,1.5][i]} fill="#fef3c7" opacity={[0.9,0.7,0.85,0.6,0.75][i]}/>
      ))}
      <path d="M72,35 L74,30 L76,35 L81,37 L76,39 L74,44 L72,39 L67,37Z" fill="#fde68a" opacity="0.8"/>
    </svg>
  ),

  // 3 — Forest (leaf)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#0a1f0e"/>
      <path d="M50 15 C70 25 85 45 80 65 C75 80 60 85 50 82 C40 85 25 80 20 65 C15 45 30 25 50 15Z" fill="#22c55e" opacity="0.8"/>
      <path d="M50 15 C50 15 50 82 50 82" stroke="#16a34a" strokeWidth="2" opacity="0.6"/>
      <path d="M35 40 C42 45 50 48 58 45" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M30 55 C38 58 50 60 62 56" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M35 68 C42 70 50 71 60 69" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  ),

  // 4 — Wave (ocean)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#082040"/>
      <path d="M10 40 C25 32,35 48,50 40 C65 32,75 48,90 40" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M10 53 C25 45,35 61,50 53 C65 45,75 61,90 53" stroke="#7dd3fc" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      <path d="M10 66 C25 58,35 74,50 66 C65 58,75 74,90 66" stroke="#bae6fd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <circle cx="50" cy="28" r="10" fill="#f0f9ff" opacity="0.15"/>
      <circle cx="50" cy="28" r="6"  fill="#e0f2fe" opacity="0.3"/>
    </svg>
  ),

  // 5 — Crystal (gem)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#120824"/>
      <polygon points="50,15 75,38 65,80 35,80 25,38" fill="#a78bfa" opacity="0.7"/>
      <polygon points="50,15 75,38 50,42"  fill="#c4b5fd" opacity="0.8"/>
      <polygon points="50,15 25,38 50,42"  fill="#7c3aed" opacity="0.8"/>
      <polygon points="25,38 50,42 35,80"  fill="#6d28d9" opacity="0.7"/>
      <polygon points="75,38 50,42 65,80"  fill="#8b5cf6" opacity="0.7"/>
      <polygon points="35,80 50,42 65,80"  fill="#4c1d95" opacity="0.8"/>
      <line x1="50" y1="15" x2="50" y2="42" stroke="#e9d5ff" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  ),

  // 6 — Sun (rays burst)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#1c0f00"/>
      {Array.from({length:12},(_,i)=>{
        const a = (i/12)*Math.PI*2
        const x1=50+Math.cos(a)*22, y1=50+Math.sin(a)*22
        const x2=50+Math.cos(a)*38, y2=50+Math.sin(a)*38
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth={i%3===0?2.5:1.5} strokeLinecap="round" opacity="0.85"/>
      })}
      <circle cx="50" cy="50" r="18" fill="#fef08a" opacity="0.2"/>
      <circle cx="50" cy="50" r="14" fill="#fde047" opacity="0.7"/>
      <circle cx="50" cy="50" r="9"  fill="#fef9c3" opacity="0.95"/>
    </svg>
  ),

  // 7 — Nebula (abstract cosmos)
  ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="50" fill="#04061a"/>
      <ellipse cx="40" cy="45" rx="22" ry="16" fill="#7c3aed" opacity="0.5" transform="rotate(-20,40,45)"/>
      <ellipse cx="60" cy="55" rx="20" ry="14" fill="#2563eb" opacity="0.45" transform="rotate(15,60,55)"/>
      <ellipse cx="50" cy="48" rx="14" ry="10" fill="#a78bfa" opacity="0.6"/>
      {[[20,25],[75,30],[80,70],[18,72],[50,20],[50,80],[30,50],[70,48]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={[1.5,1,2,1.2,1,1.5,0.8,1][i]} fill="white" opacity={[0.9,0.7,0.85,0.6,0.8,0.75,0.5,0.7][i]}/>
      ))}
      <circle cx="50" cy="48" r="5" fill="#e9d5ff" opacity="0.9"/>
    </svg>
  ),
]

export const AVATAR_COUNT = SVG_AVATARS.length

// Assign a default avatar index based on user id/name
export function getDefaultAvatarIndex(user) {
  const str = user?.id || user?.name || ''
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash % AVATAR_COUNT
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UserAvatar({ user, size = 80, avatarIndex, className = '' }) {
  const src = user?.avatar

  // Resolve avatar: uploaded photo > chosen preset > auto-assigned
  const idx = avatarIndex ?? getDefaultAvatarIndex(user)
  const SvgAvatar = SVG_AVATARS[idx % SVG_AVATARS.length]

  if (src) {
    const url = src.startsWith('http') ? src : `${API_URL}${src}`
    return (
      <img
        src={url}
        alt={user?.name || 'User'}
        className={`user-avatar user-avatar--photo ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`user-avatar user-avatar--svg ${className}`}
      style={{ width: size, height: size }}
      aria-label={`Avatar for ${user?.name || 'user'}`}
    >
      <SvgAvatar size={size} />
    </div>
  )
}

// ── Picker grid ───────────────────────────────────────────────────────────────
export function AvatarPicker({ current, onSelect }) {
  return (
    <div className="avatar-picker">
      {SVG_AVATARS.map((Svg, i) => (
        <button
          key={i}
          className={`avatar-picker__item ${current === i ? 'selected' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={`Avatar option ${i + 1}`}
        >
          <Svg size={64} />
        </button>
      ))}
    </div>
  )
}
