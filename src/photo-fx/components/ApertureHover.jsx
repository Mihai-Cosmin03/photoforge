import './ApertureHover.css'

const N = 8

export default function ApertureHover({ preview, children }) {
  return (
    <div className="pf-ap">
      <div className="pf-ap__preview">{preview}</div>
      <div className="pf-ap__full">{children}</div>
      <div className="pf-ap__iris" aria-hidden="true">
        {Array.from({ length: N }, (_, i) => (
          <span key={i} style={{ '--ap-rot': `${i * (360 / N)}deg` }} />
        ))}
      </div>
    </div>
  )
}
