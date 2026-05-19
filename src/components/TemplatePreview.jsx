import './TemplatePreview.css'

// Helper: use user value if filled, else fallback placeholder
const v = (data, key, fb) => data?.[key]?.trim() || fb

/* ═══════════════════════════════════════════════════════════════════════
   BUSINESS CARDS
   ═══════════════════════════════════════════════════════════════════════ */
function BCNoir({ data = {} }) {
  return (
    <div className="tp-bc tp-bc--noir">
      <div className="tp-bc__logo-dot" />
      <div className="tp-bc__content">
        <div className="tp-bc__name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__divider" />
        <div className="tp-bc__contact">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__contact">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function BCClassic({ data = {} }) {
  return (
    <div className="tp-bc tp-bc--classic">
      <div className="tp-bc__classic-top">
        <div className="tp-bc__classic-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__classic-title">{v(data,'title','Photography Studio')}</div>
      </div>
      <div className="tp-bc__classic-line" />
      <div className="tp-bc__classic-contact">{v(data,'email','alex@studio.ro')} · {v(data,'phone','+40 721 000 000')}</div>
    </div>
  )
}

function BCGradient({ data = {} }) {
  const initials = v(data,'name','Alexandra M.').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="tp-bc tp-bc--gradient">
      <div className="tp-bc__grad-circle">{initials}</div>
      <div className="tp-bc__grad-content">
        <div className="tp-bc__grad-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__grad-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__grad-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCSplit({ data = {} }) {
  const photoStyle = data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
  return (
    <div className="tp-bc tp-bc--split">
      <div className="tp-bc__split-photo" style={photoStyle}>{!data.photo && <div className="tp-bc__split-photo-overlay">📷</div>}</div>
      <div className="tp-bc__split-info">
        <div className="tp-bc__split-name">{v(data,'name','Alex M.')}</div>
        <div className="tp-bc__split-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__split-email">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCGold({ data = {} }) {
  return (
    <div className="tp-bc tp-bc--gold">
      <div className="tp-bc__gold-corner tp-bc__gold-corner--tl" />
      <div className="tp-bc__gold-corner tp-bc__gold-corner--br" />
      <div className="tp-bc__gold-content">
        <div className="tp-bc__gold-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__gold-rule" />
        <div className="tp-bc__gold-title">{v(data,'title','Fine Art Photographer')}</div>
        <div className="tp-bc__gold-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCPastel({ data = {} }) {
  const initials = v(data,'name','Alexandra M.').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="tp-bc tp-bc--pastel">
      <div className="tp-bc__pastel-blob" />
      <div className="tp-bc__pastel-content">
        <div className="tp-bc__pastel-initials">{initials}</div>
        <div className="tp-bc__pastel-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__pastel-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__pastel-email">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCMono({ data = {} }) {
  return (
    <div className="tp-bc tp-bc--mono">
      <div className="tp-bc__mono-bar" />
      <div className="tp-bc__mono-content">
        <div className="tp-bc__mono-name">{v(data,'name','ALEXANDRA M.')}</div>
        <div className="tp-bc__mono-title">{v(data,'title','PHOTOGRAPHER')}</div>
        <div className="tp-bc__mono-rule" />
        <div className="tp-bc__mono-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCRetro({ data = {} }) {
  return (
    <div className="tp-bc tp-bc--retro">
      <div className="tp-bc__retro-frame">
        <div className="tp-bc__retro-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__retro-badge">{v(data,'title','Photography')}</div>
        <div className="tp-bc__retro-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   CV / RESUME
   ═══════════════════════════════════════════════════════════════════════ */
function CVExecutive({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--executive">
      <div className="tp-cv__exec-sidebar">
        <div className="tp-cv__exec-avatar" style={data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : {}} />
        <div className="tp-cv__exec-name-s">{v(data,'name','Alexandra').split(' ')[0]}</div>
        <div className="tp-cv__exec-skill" />
        <div className="tp-cv__exec-skill" style={{ width: '70%' }} />
        <div className="tp-cv__exec-skill" style={{ width: '85%' }} />
      </div>
      <div className="tp-cv__exec-body">
        <div className="tp-cv__exec-title">{v(data,'title','Senior Photographer')}</div>
        <div className="tp-cv__exec-line" />
        <div className="tp-cv__exec-block" /><div className="tp-cv__exec-block" style={{ width: '80%' }} />
        <div className="tp-cv__exec-block" style={{ width: '65%' }} />
        <div className="tp-cv__exec-line" style={{ marginTop: 8 }} />
        <div className="tp-cv__exec-block" /><div className="tp-cv__exec-block" style={{ width: '70%' }} />
      </div>
    </div>
  )
}

function CVMinimal({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--minimal">
      <div className="tp-cv__min-header">
        <div className="tp-cv__min-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-cv__min-title">{v(data,'title','Photographer & Visual Artist')}</div>
      </div>
      <div className="tp-cv__min-section" />
      <div className="tp-cv__min-block" /><div className="tp-cv__min-block" style={{ width: '75%' }} />
      <div className="tp-cv__min-block" style={{ width: '60%' }} />
      <div className="tp-cv__min-section" style={{ marginTop: 8 }} />
      <div className="tp-cv__min-block" /><div className="tp-cv__min-block" style={{ width: '80%' }} />
    </div>
  )
}

function CVCreative({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--creative">
      <div className="tp-cv__cre-sidebar">
        <div className="tp-cv__cre-name">{v(data,'name','AM').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
        <div className="tp-cv__cre-bar-label">{v(data,'skill1','Lightroom')}</div>
        <div className="tp-cv__cre-bar"><div style={{ width: '90%' }} className="tp-cv__cre-bar-fill" /></div>
        <div className="tp-cv__cre-bar-label">{v(data,'skill2','Photoshop')}</div>
        <div className="tp-cv__cre-bar"><div style={{ width: '75%' }} className="tp-cv__cre-bar-fill" /></div>
        <div className="tp-cv__cre-bar-label">{v(data,'skill3','Capture One')}</div>
        <div className="tp-cv__cre-bar"><div style={{ width: '60%' }} className="tp-cv__cre-bar-fill" /></div>
      </div>
      <div className="tp-cv__cre-body">
        <div className="tp-cv__cre-title">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__cre-sub">{v(data,'title','Visual Storyteller')}</div>
        <div className="tp-cv__cre-block" /><div className="tp-cv__cre-block" style={{ width: '80%' }} />
        <div className="tp-cv__cre-block" style={{ width: '65%' }} />
      </div>
    </div>
  )
}

function CVPhoto({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--photo">
      <div className="tp-cv__ph-header">
        <div className="tp-cv__ph-avatar" style={data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : {}} />
        <div className="tp-cv__ph-info">
          <div className="tp-cv__ph-name">{v(data,'name','Alexandra Moldovan')}</div>
          <div className="tp-cv__ph-title">{v(data,'title','Fashion & Portrait Photographer')}</div>
          <div className="tp-cv__ph-tags">
            <span className="tp-cv__ph-tag">{v(data,'skill1','Wedding')}</span>
            <span className="tp-cv__ph-tag">{v(data,'skill2','Portrait')}</span>
          </div>
        </div>
      </div>
      <div className="tp-cv__ph-body">
        <div className="tp-cv__ph-block" /><div className="tp-cv__ph-block" style={{ width: '80%' }} />
        <div className="tp-cv__ph-block" style={{ width: '65%' }} />
      </div>
    </div>
  )
}

function CVTimeline({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--timeline">
      <div className="tp-cv__tl-header">
        <div className="tp-cv__tl-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__tl-role">{v(data,'title','Photographer')}</div>
      </div>
      <div className="tp-cv__tl-body">
        <div className="tp-cv__tl-line" />
        <div className="tp-cv__tl-items">
          {[1,2,3].map(i => (
            <div key={i} className="tp-cv__tl-item">
              <div className="tp-cv__tl-dot" />
              <div className="tp-cv__tl-content">
                <div className="tp-cv__tl-year" /><div className="tp-cv__tl-text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CVAcademic({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--academic">
      <div className="tp-cv__ac-header">
        <div className="tp-cv__ac-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-cv__ac-rule" />
        <div className="tp-cv__ac-contact">{v(data,'email','alex@studio.ro')} · {v(data,'city','Cluj-Napoca')}</div>
      </div>
      <div className="tp-cv__ac-section">EXPERIENCE</div>
      <div className="tp-cv__ac-block" /><div className="tp-cv__ac-block" style={{ width: '75%' }} />
      <div className="tp-cv__ac-section" style={{ marginTop: 6 }}>EDUCATION</div>
      <div className="tp-cv__ac-block" /><div className="tp-cv__ac-block" style={{ width: '65%' }} />
    </div>
  )
}

function CVBoldHeader({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--boldheader">
      <div className="tp-cv__bh-header">
        <div className="tp-cv__bh-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-cv__bh-role">{v(data,'title','Senior Photographer')}</div>
      </div>
      <div className="tp-cv__bh-body">
        <div className="tp-cv__bh-col">
          <div className="tp-cv__bh-label" /><div className="tp-cv__bh-block" />
          <div className="tp-cv__bh-block" style={{ width: '80%' }} />
          <div className="tp-cv__bh-label" style={{ marginTop: 5 }} /><div className="tp-cv__bh-block" />
        </div>
        <div className="tp-cv__bh-col">
          <div className="tp-cv__bh-label" /><div className="tp-cv__bh-skill" />
          <div className="tp-cv__bh-skill" style={{ width: '70%' }} />
          <div className="tp-cv__bh-skill" style={{ width: '85%' }} />
        </div>
      </div>
    </div>
  )
}

function CVCompact({ data = {} }) {
  return (
    <div className="tp-cv tp-cv--compact">
      <div className="tp-cv__cp-topbar">
        <div className="tp-cv__cp-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__cp-meta">{v(data,'email','alex@studio.ro')} · {v(data,'city','Cluj')}</div>
      </div>
      <div className="tp-cv__cp-body">
        <div className="tp-cv__cp-col">
          <div className="tp-cv__cp-heading" /><div className="tp-cv__cp-line" />
          <div className="tp-cv__cp-line" style={{ width: '80%' }} /><div className="tp-cv__cp-line" style={{ width: '65%' }} />
          <div className="tp-cv__cp-heading" style={{ marginTop: 5 }} /><div className="tp-cv__cp-line" />
          <div className="tp-cv__cp-line" style={{ width: '75%' }} />
        </div>
        <div className="tp-cv__cp-col">
          <div className="tp-cv__cp-heading" /><div className="tp-cv__cp-bar" />
          <div className="tp-cv__cp-bar" style={{ '--bw': '75%' }} />
          <div className="tp-cv__cp-bar" style={{ '--bw': '60%' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   FLYERS
   ═══════════════════════════════════════════════════════════════════════ */
function FlyerEvent({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--event">
      <div className="tp-fly__ev-tag">EXHIBITION</div>
      <div className="tp-fly__ev-title">{v(data,'headline','Through the Lens')}</div>
      <div className="tp-fly__ev-sub">{v(data,'subtext','A Photography Collection')}</div>
      <div className="tp-fly__ev-divider" />
      <div className="tp-fly__ev-date">{v(data,'date','15 Mai 2025 · 19:00')}</div>
      <div className="tp-fly__ev-venue">{v(data,'venue','Galeria de Artă, Cluj')}</div>
    </div>
  )
}

function FlyerShowcase({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--showcase">
      <div className="tp-fly__sc-title">{v(data,'headline','Portfolio Showcase')}</div>
      <div className="tp-fly__sc-grid">
        <div className="tp-fly__sc-img" style={{ background: '#c4b5fd' }} />
        <div className="tp-fly__sc-img" style={{ background: '#a78bfa' }} />
        <div className="tp-fly__sc-img" style={{ background: '#7c3aed' }} />
        <div className="tp-fly__sc-img" style={{ background: '#ddd6fe' }} />
      </div>
      <div className="tp-fly__sc-name">{v(data,'name','Alexandra Moldovan Photography')}</div>
      <div className="tp-fly__sc-web">{v(data,'website','www.alexphoto.ro')}</div>
    </div>
  )
}

function FlyerPromo({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--promo">
      <div className="tp-fly__pr-badge">{v(data,'badge','50% OFF')}</div>
      <div className="tp-fly__pr-title">{v(data,'headline','Spring Sessions')}</div>
      <div className="tp-fly__pr-sub">{v(data,'subtext','Book your session in May')}</div>
      <div className="tp-fly__pr-btn">Book Now</div>
    </div>
  )
}

function FlyerMinimal({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--fly-minimal">
      <div className="tp-fly__fm-line" />
      <div className="tp-fly__fm-title">{v(data,'headline','Portfolio Night')}</div>
      <div className="tp-fly__fm-sub">{v(data,'subtext','An evening of photography')}</div>
      <div className="tp-fly__fm-line" />
      <div className="tp-fly__fm-date">{v(data,'date','20 Iunie 2025')}</div>
      <div className="tp-fly__fm-venue">{v(data,'venue','Galeria Fusion, Cluj')}</div>
    </div>
  )
}

function FlyerDarkPhoto({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--darkphoto">
      <div className="tp-fly__dp-tag">PHOTOGRAPHY</div>
      <div className="tp-fly__dp-title">{v(data,'headline','The Art of Light')}</div>
      <div className="tp-fly__dp-sub">{v(data,'name','Alexandra Moldovan')}</div>
      <div className="tp-fly__dp-btn">View Portfolio</div>
    </div>
  )
}

function FlyerCorporate({ data = {} }) {
  return (
    <div className="tp-fly tp-fly--corporate">
      <div className="tp-fly__co-header">
        <div className="tp-fly__co-logo">CORP</div>
        <div className="tp-fly__co-tagline">{v(data,'subtext','Professional Event Coverage')}</div>
      </div>
      <div className="tp-fly__co-body">
        <div className="tp-fly__co-title">{v(data,'headline','Annual Conference')}</div>
        <div className="tp-fly__co-detail">{v(data,'date','15 Sept 2025')} · {v(data,'venue','Hotel Radisson')}</div>
        <div className="tp-fly__co-divider" />
        <div className="tp-fly__co-cta">Register Now</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   INVITATIONS
   ═══════════════════════════════════════════════════════════════════════ */
function InvWedding({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--wedding">
      <div className="tp-inv__wed-ornament">✦ ✦ ✦</div>
      <div className="tp-inv__wed-pre">Together with their families</div>
      <div className="tp-inv__wed-names">{v(data,'names','Ana & Mihai')}</div>
      <div className="tp-inv__wed-request">request the honour of your presence</div>
      <div className="tp-inv__wed-date">{v(data,'date','21 Septembrie 2025')}</div>
      <div className="tp-inv__wed-venue">{v(data,'venue','Conacul Bran, Brașov')}</div>
      <div className="tp-inv__wed-ornament" style={{ marginTop: 8 }}>✦ ✦ ✦</div>
    </div>
  )
}

function InvCorporate({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--corporate">
      <div className="tp-inv__corp-logo">CORP<span>EVENT</span></div>
      <div className="tp-inv__corp-title">{v(data,'headline','Annual Gala 2025')}</div>
      <div className="tp-inv__corp-line" />
      <div className="tp-inv__corp-detail">{v(data,'date','Friday, 10 October 2025')}</div>
      <div className="tp-inv__corp-detail">{v(data,'venue','Hotel Radisson · Cluj-Napoca')}</div>
      <div className="tp-inv__corp-rsvp">{v(data,'tagline','RSVP by 1 October')}</div>
    </div>
  )
}

function InvGallery({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--gallery">
      <div className="tp-inv__gal-eyebrow">You are invited to</div>
      <div className="tp-inv__gal-title">{v(data,'headline','Gallery Opening')}</div>
      <div className="tp-inv__gal-author">{v(data,'names','Alexandra Moldovan')}</div>
      <div className="tp-inv__gal-block" />
      <div className="tp-inv__gal-date">{v(data,'date','3 Iunie')} · 18:30 · {v(data,'venue','Galeria Fusion')}</div>
    </div>
  )
}

function InvBirthday({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--birthday">
      <div className="tp-inv__bd-icon">🎉</div>
      <div className="tp-inv__bd-pre">You're invited to celebrate</div>
      <div className="tp-inv__bd-name">{v(data,'names',"Maria's 30th")}</div>
      <div className="tp-inv__bd-divider" />
      <div className="tp-inv__bd-date">{v(data,'date','5 Iulie 2025 · 20:00')}</div>
      <div className="tp-inv__bd-venue">{v(data,'venue','La Botanica, Cluj')}</div>
    </div>
  )
}

function InvBaptism({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--baptism">
      <div className="tp-inv__bap-cross">✝</div>
      <div className="tp-inv__bap-pre">Suntem bucuroși să vă invităm la</div>
      <div className="tp-inv__bap-name">{v(data,'names','Botezul lui Luca')}</div>
      <div className="tp-inv__bap-date">{v(data,'date','12 Octombrie 2025')}</div>
      <div className="tp-inv__bap-venue">{v(data,'venue','Biserica Sf. Nicolae, Cluj')}</div>
      <div className="tp-inv__bap-ornament">· · ·</div>
    </div>
  )
}

function InvGraduation({ data = {} }) {
  return (
    <div className="tp-inv tp-inv--graduation">
      <div className="tp-inv__gr-icon">🎓</div>
      <div className="tp-inv__gr-pre">You are cordially invited to</div>
      <div className="tp-inv__gr-title">{v(data,'headline','Graduation Ceremony')}</div>
      <div className="tp-inv__gr-name">{v(data,'names','Alexandra Moldovan')}</div>
      <div className="tp-inv__gr-line" />
      <div className="tp-inv__gr-date">{v(data,'date','15 Iulie 2025')} · {v(data,'venue','Aula Magna')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   POSTCARDS
   ═══════════════════════════════════════════════════════════════════════ */
function PCThankYou({ data = {} }) {
  return (
    <div className="tp-pc tp-pc--thankyou">
      <div className="tp-pc__ty-ornament">— ✦ —</div>
      <div className="tp-pc__ty-title">Thank You</div>
      <div className="tp-pc__ty-text">{v(data,'subtext','It was a pleasure capturing your story. I hope these memories last forever.')}</div>
      <div className="tp-pc__ty-sig">{v(data,'name','Alexandra M.')}</div>
    </div>
  )
}

function PCAnnouncement({ data = {} }) {
  return (
    <div className="tp-pc tp-pc--announcement">
      <div className="tp-pc__ann-badge">NEW</div>
      <div className="tp-pc__ann-title">{v(data,'headline','Studio Now Open')}</div>
      <div className="tp-pc__ann-sub">{v(data,'subtext','Book your session at our new location')}</div>
      <div className="tp-pc__ann-address">{v(data,'address','Str. Memorandumului 10, Cluj')}</div>
    </div>
  )
}

function PCHoliday({ data = {} }) {
  return (
    <div className="tp-pc tp-pc--holiday">
      <div className="tp-pc__hol-icon">❄</div>
      <div className="tp-pc__hol-title">Season's Greetings</div>
      <div className="tp-pc__hol-text">{v(data,'subtext','Wishing you joy, light and beautiful moments')}</div>
      <div className="tp-pc__hol-sig">{v(data,'name','Alexandra M.')} Photography</div>
    </div>
  )
}

function PCPortfolio({ data = {} }) {
  return (
    <div className="tp-pc tp-pc--portfolio">
      <div className="tp-pc__pf-photo" style={data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
      <div className="tp-pc__pf-info">
        <div className="tp-pc__pf-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-pc__pf-role">{v(data,'title','Photographer')}</div>
        <div className="tp-pc__pf-url">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function PCPromo({ data = {} }) {
  return (
    <div className="tp-pc tp-pc--promocard">
      <div className="tp-pc__pr-tag">LIMITED OFFER</div>
      <div className="tp-pc__pr-discount">{v(data,'badge','30% OFF')}</div>
      <div className="tp-pc__pr-text">{v(data,'subtext','All portrait sessions this month')}</div>
      <div className="tp-pc__pr-code">{v(data,'tagline','Use code: SPRING30')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   POSTERS
   ═══════════════════════════════════════════════════════════════════════ */
function PosterExhibition({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--exhibition">
      <div className="tp-pos__ex-eyebrow">EXHIBITION</div>
      <div className="tp-pos__ex-title">{v(data,'headline','Light & Shadow')}</div>
      <div className="tp-pos__ex-author">{v(data,'name','Alexandra Moldovan')}</div>
      <div className="tp-pos__ex-img" />
      <div className="tp-pos__ex-date">{v(data,'date','1 – 30 Mai 2025')}</div>
      <div className="tp-pos__ex-venue">{v(data,'venue','Galeria Națională de Artă, Cluj')}</div>
    </div>
  )
}

function PosterBold({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--bold">
      <div className="tp-pos__bold-block" />
      <div className="tp-pos__bold-title">{v(data,'headline','SEE THE WORLD THROUGH MY LENS')}</div>
      <div className="tp-pos__bold-block2" />
      <div className="tp-pos__bold-name">{v(data,'name','ALEXANDRA MOLDOVAN')}</div>
      <div className="tp-pos__bold-date">{v(data,'date','MAI 2025')}</div>
    </div>
  )
}

function PosterText({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--text">
      <div className="tp-pos__tx-top">PHOTOGRAPHY</div>
      <div className="tp-pos__tx-main">{v(data,'headline','IS THE\nART OF\nFROZEN\nTIME').split('\n').map((line,i) => <span key={i}>{line}<br/></span>)}</div>
      <div className="tp-pos__tx-rule" />
      <div className="tp-pos__tx-by">— {v(data,'name','Alexandra Moldovan')}</div>
    </div>
  )
}

function PosterPhotoBg({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--photobg" style={data.photo ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.72)), url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
      <div className="tp-pos__pb-overlay">
        <div className="tp-pos__pb-tag">{v(data,'subtext','PORTFOLIO 2025')}</div>
        <div className="tp-pos__pb-title">{v(data,'headline','Captured Moments')}</div>
        <div className="tp-pos__pb-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-pos__pb-url">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function PosterSplit({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--split">
      <div className="tp-pos__sp-photo" style={data.photo ? { backgroundImage: `url(${data.photo})`, backgroundSize: 'cover', backgroundPosition: 'center', clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)' } : {}} />
      <div className="tp-pos__sp-content">
        <div className="tp-pos__sp-tag">NEW EXHIBITION</div>
        <div className="tp-pos__sp-title">{v(data,'headline','Lumină & Umbră')}</div>
        <div className="tp-pos__sp-author">{v(data,'name','A. Moldovan')}</div>
        <div className="tp-pos__sp-date">{v(data,'date','Mai 2025')}</div>
      </div>
      <div className="tp-pos__sp-diagonal" />
    </div>
  )
}

function PosterRetro({ data = {} }) {
  return (
    <div className="tp-pos tp-pos--retro">
      <div className="tp-pos__re-border">
        <div className="tp-pos__re-top">★ PRESENTING ★</div>
        <div className="tp-pos__re-title">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-pos__re-sub">{v(data,'subtext','Photography Exhibition')}</div>
        <div className="tp-pos__re-rule" />
        <div className="tp-pos__re-date">{v(data,'date','JUNE · MMXXV')}</div>
      </div>
    </div>
  )
}

function PosterNeon({ data = {} }) {
  const first = v(data,'name','Alexandra Moldovan').split(' ')[0].toUpperCase()
  return (
    <div className="tp-pos tp-pos--neon">
      <div className="tp-pos__ne-glow">{first.slice(0,4)}</div>
      <div className="tp-pos__ne-title">{v(data,'subtext','PHOTOGRAPHY')}</div>
      <div className="tp-pos__ne-line" />
      <div className="tp-pos__ne-sub">{v(data,'tagline','STUDIO · 2025')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW BUSINESS CARDS — PHOTO VARIANTS
   ═══════════════════════════════════════════════════════════════════════ */
const pStyle = (photo, fb='linear-gradient(135deg,#a78bfa,#4f46e5)') =>
  photo ? { backgroundImage:`url(${photo})`, backgroundSize:'cover', backgroundPosition:'center top' } : { background: fb }

function BCPhotoCircle({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photocirc">
      <div className="tp-bc__pci-avatar" style={pStyle(data.photo)} />
      <div className="tp-bc__pci-name">{v(data,'name','Alexandra M.')}</div>
      <div className="tp-bc__pci-title">{v(data,'title','Photographer')}</div>
      <div className="tp-bc__pci-rule" />
      <div className="tp-bc__pci-contact">{v(data,'email','alex@studio.ro')}</div>
    </div>
  )
}

function BCPhotoLeft({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photoleft">
      <div className="tp-bc__phl-photo" style={pStyle(data.photo,'linear-gradient(160deg,#d4a882,#5c3528)')} />
      <div className="tp-bc__phl-info">
        <div className="tp-bc__phl-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__phl-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__phl-rule" />
        <div className="tp-bc__phl-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__phl-phone">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function BCPhotoBanner({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photobanner">
      <div className="tp-bc__phb-photo" style={pStyle(data.photo,'linear-gradient(135deg,#8b6050,#3d2010)')} />
      <div className="tp-bc__phb-info">
        <div className="tp-bc__phb-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__phb-title">{v(data,'title','Photography Studio')}</div>
        <div className="tp-bc__phb-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCPhotoFull({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photofull" style={data.photo ? { backgroundImage:`linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.75)),url(${data.photo})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
      <div className="tp-bc__pff-content">
        <div className="tp-bc__pff-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__pff-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__pff-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCPhotoOval({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photooval">
      <div className="tp-bc__pov-info">
        <div className="tp-bc__pov-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__pov-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__pov-rule" />
        <div className="tp-bc__pov-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
      <div className="tp-bc__pov-photo" style={pStyle(data.photo,'linear-gradient(160deg,#c8a882,#7c5040)')} />
    </div>
  )
}

function BCPhotoCorner({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photocorner">
      <div className="tp-bc__pcn-avatar" style={pStyle(data.photo)} />
      <div className="tp-bc__pcn-content">
        <div className="tp-bc__pcn-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__pcn-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__pcn-divider" />
        <div className="tp-bc__pcn-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__pcn-phone">{v(data,'phone','+40 721 000 000')}</div>
        <div className="tp-bc__pcn-web">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function BCPhotoDiagonal({ data={} }) {
  return (
    <div className="tp-bc tp-bc--photodiag">
      <div className="tp-bc__pdg-photo" style={pStyle(data.photo,'linear-gradient(160deg,#b89070,#4a2810)')} />
      <div className="tp-bc__pdg-diag" />
      <div className="tp-bc__pdg-info">
        <div className="tp-bc__pdg-name">{v(data,'name','Alex M.')}</div>
        <div className="tp-bc__pdg-title">{v(data,'title','Photo')}</div>
        <div className="tp-bc__pdg-email">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCPhotoDuo({ data={} }) {
  const ini = v(data,'name','AM').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="tp-bc tp-bc--photoduo">
      <div className="tp-bc__pdu-left">
        <div className="tp-bc__pdu-circle" style={pStyle(data.photo)}>{!data.photo && ini}</div>
        <div className="tp-bc__pdu-accent" />
      </div>
      <div className="tp-bc__pdu-right">
        <div className="tp-bc__pdu-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__pdu-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__pdu-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__pdu-phone">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

/* ── New Non-Photo Business Cards ─────────────────────────────────── */
function BCNeon({ data={} }) {
  return (
    <div className="tp-bc tp-bc--neon">
      <div className="tp-bc__neon-content">
        <div className="tp-bc__neon-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__neon-title">{v(data,'title','PHOTOGRAPHER')}</div>
        <div className="tp-bc__neon-line" />
        <div className="tp-bc__neon-contact">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__neon-contact">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function BCMinimalLine({ data={} }) {
  return (
    <div className="tp-bc tp-bc--minline">
      <div className="tp-bc__ml-bar" />
      <div className="tp-bc__ml-name">{v(data,'name','Alexandra M.')}</div>
      <div className="tp-bc__ml-title">{v(data,'title','Photographer')}</div>
      <div className="tp-bc__ml-spacer" />
      <div className="tp-bc__ml-email">{v(data,'email','alex@studio.ro')}</div>
      <div className="tp-bc__ml-phone">{v(data,'phone','+40 721 000 000')}</div>
      <div className="tp-bc__ml-web">{v(data,'website','alexphoto.ro')}</div>
    </div>
  )
}

function BCQr({ data={} }) {
  return (
    <div className="tp-bc tp-bc--qr">
      <div className="tp-bc__qr-left">
        <div className="tp-bc__qr-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__qr-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__qr-rule" />
        <div className="tp-bc__qr-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__qr-web">{v(data,'website','alexphoto.ro')}</div>
      </div>
      <div className="tp-bc__qr-code">
        <div className="tp-bc__qr-grid">
          {[...Array(9)].map((_,i) => <div key={i} className="tp-bc__qr-cell" style={{opacity: Math.random() > 0.4 ? 1 : 0.1}} />)}
        </div>
      </div>
    </div>
  )
}

function BCWatercolor({ data={} }) {
  const ini = v(data,'name','AM').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  return (
    <div className="tp-bc tp-bc--waterc">
      <div className="tp-bc__wc-blob1" />
      <div className="tp-bc__wc-blob2" />
      <div className="tp-bc__wc-content">
        <div className="tp-bc__wc-ini">{ini}</div>
        <div className="tp-bc__wc-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__wc-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__wc-email">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

function BCLuxuryWhite({ data={} }) {
  return (
    <div className="tp-bc tp-bc--luxwhite">
      <div className="tp-bc__lw-tl" /><div className="tp-bc__lw-br" />
      <div className="tp-bc__lw-content">
        <div className="tp-bc__lw-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__lw-ornament">— · —</div>
        <div className="tp-bc__lw-title">{v(data,'title','Fine Art Photographer')}</div>
        <div className="tp-bc__lw-spacer" />
        <div className="tp-bc__lw-contact">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__lw-contact">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function BCRoseGold({ data={} }) {
  return (
    <div className="tp-bc tp-bc--rosegold">
      <div className="tp-bc__rg-accent" />
      <div className="tp-bc__rg-content">
        <div className="tp-bc__rg-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__rg-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__rg-rule" />
        <div className="tp-bc__rg-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__rg-phone">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function BCSage({ data={} }) {
  return (
    <div className="tp-bc tp-bc--sage">
      <div className="tp-bc__sg-leaf">🌿</div>
      <div className="tp-bc__sg-content">
        <div className="tp-bc__sg-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__sg-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__sg-rule" />
        <div className="tp-bc__sg-email">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__sg-web">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function BCBlueprint({ data={} }) {
  return (
    <div className="tp-bc tp-bc--blueprint">
      <div className="tp-bc__bp-grid" />
      <div className="tp-bc__bp-content">
        <div className="tp-bc__bp-title">{v(data,'title','PHOTOGRAPHER')}</div>
        <div className="tp-bc__bp-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__bp-rule" />
        <div className="tp-bc__bp-detail">{v(data,'email','alex@studio.ro')}</div>
        <div className="tp-bc__bp-detail">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function BCGeometric({ data={} }) {
  return (
    <div className="tp-bc tp-bc--geobc">
      <div className="tp-bc__gb-tri1" />
      <div className="tp-bc__gb-tri2" />
      <div className="tp-bc__gb-content">
        <div className="tp-bc__gb-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-bc__gb-title">{v(data,'title','Photographer')}</div>
        <div className="tp-bc__gb-email">{v(data,'email','alex@studio.ro')}</div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW CVs
   ═══════════════════════════════════════════════════════════════════════ */
function CVInfographic({ data={} }) {
  return (
    <div className="tp-cv tp-cv--infog">
      <div className="tp-cv__ig-header">
        <div className="tp-cv__ig-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__ig-role">{v(data,'title','Photographer')}</div>
      </div>
      <div className="tp-cv__ig-body">
        <div className="tp-cv__ig-circles">
          {[90,75,60].map((w,i)=><div key={i} className="tp-cv__ig-ring" style={{'--p':w+'%'}} />)}
        </div>
        <div className="tp-cv__ig-bars">
          <div className="tp-cv__ig-bar" /><div className="tp-cv__ig-bar" style={{width:'80%'}} /><div className="tp-cv__ig-bar" style={{width:'65%'}} />
        </div>
      </div>
    </div>
  )
}

function CVColorful({ data={} }) {
  return (
    <div className="tp-cv tp-cv--colorful">
      <div className="tp-cv__cf-head">
        <div className="tp-cv__cf-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__cf-role">{v(data,'title','Photographer')}</div>
      </div>
      <div className="tp-cv__cf-body">
        <div className="tp-cv__cf-sec" style={{background:'#f59e0b'}}>EXPERIENCE</div>
        <div className="tp-cv__cf-block" /><div className="tp-cv__cf-block" style={{width:'75%'}} />
        <div className="tp-cv__cf-sec" style={{background:'#10b981'}}>SKILLS</div>
        <div className="tp-cv__cf-block" /><div className="tp-cv__cf-block" style={{width:'80%'}} />
        <div className="tp-cv__cf-sec" style={{background:'#3b82f6'}}>EDUCATION</div>
        <div className="tp-cv__cf-block" />
      </div>
    </div>
  )
}

function CVDarkMinimal({ data={} }) {
  return (
    <div className="tp-cv tp-cv--darkmin">
      <div className="tp-cv__dk-header">
        <div className="tp-cv__dk-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-cv__dk-role">{v(data,'title','Photographer')}</div>
        <div className="tp-cv__dk-contact">{v(data,'email','alex@studio.ro')}</div>
      </div>
      <div className="tp-cv__dk-body">
        <div className="tp-cv__dk-label" />
        <div className="tp-cv__dk-line" /><div className="tp-cv__dk-line" style={{width:'75%'}} /><div className="tp-cv__dk-line" style={{width:'60%'}} />
        <div className="tp-cv__dk-label" style={{marginTop:5}} />
        <div className="tp-cv__dk-line" /><div className="tp-cv__dk-line" style={{width:'80%'}} />
      </div>
    </div>
  )
}

function CVEuropean({ data={} }) {
  return (
    <div className="tp-cv tp-cv--european">
      <div className="tp-cv__ep-topbar">
        <div className="tp-cv__ep-avatar" style={pStyle(data.photo,'linear-gradient(135deg,#e8c9a8,#8b6250)')} />
        <div className="tp-cv__ep-info">
          <div className="tp-cv__ep-name">{v(data,'name','Alexandra Moldovan')}</div>
          <div className="tp-cv__ep-title">{v(data,'title','Photographer')}</div>
          <div className="tp-cv__ep-contact">{v(data,'email','alex@studio.ro')} · {v(data,'city','Cluj')}</div>
        </div>
      </div>
      <div className="tp-cv__ep-body">
        <div className="tp-cv__ep-sec">WORK EXPERIENCE</div>
        <div className="tp-cv__ep-row"><div className="tp-cv__ep-date" /><div className="tp-cv__ep-text" /></div>
        <div className="tp-cv__ep-row"><div className="tp-cv__ep-date" /><div className="tp-cv__ep-text" style={{width:'70%'}} /></div>
        <div className="tp-cv__ep-sec" style={{marginTop:4}}>EDUCATION</div>
        <div className="tp-cv__ep-row"><div className="tp-cv__ep-date" /><div className="tp-cv__ep-text" /></div>
      </div>
    </div>
  )
}

function CVGrid({ data={} }) {
  return (
    <div className="tp-cv tp-cv--grid">
      <div className="tp-cv__gd-sidebar">
        <div className="tp-cv__gd-avatar" style={pStyle(data.photo)} />
        <div className="tp-cv__gd-name">{v(data,'name','A. Moldovan')}</div>
        <div className="tp-cv__gd-tag">{v(data,'city','Cluj')}</div>
        {[1,2,3].map(i=><div key={i} className="tp-cv__gd-skill" style={{width:['90%','70%','55%'][i-1]}} />)}
      </div>
      <div className="tp-cv__gd-main">
        <div className="tp-cv__gd-title">{v(data,'title','Senior Photographer')}</div>
        <div className="tp-cv__gd-grid">
          {[1,2,3,4].map(i=><div key={i} className="tp-cv__gd-card" />)}
        </div>
        <div className="tp-cv__gd-block" /><div className="tp-cv__gd-block" style={{width:'75%'}} />
      </div>
    </div>
  )
}

function CVPortfolioCv({ data={} }) {
  return (
    <div className="tp-cv tp-cv--portfoliocv">
      <div className="tp-cv__pcv-header">
        <div className="tp-cv__pcv-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-cv__pcv-role">{v(data,'title','Photographer & Visual Artist')}</div>
      </div>
      <div className="tp-cv__pcv-grid">
        {['#c4b5fd','#a78bfa','#7c3aed','#5b21b6','#ddd6fe','#ede9fe'].map((c,i)=>(
          <div key={i} className="tp-cv__pcv-img" style={{background:c}} />
        ))}
      </div>
      <div className="tp-cv__pcv-footer">
        <div className="tp-cv__pcv-line" /><div className="tp-cv__pcv-line" style={{width:'60%'}} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW FLYERS
   ═══════════════════════════════════════════════════════════════════════ */
function FlyerWedding({ data={} }) {
  return (
    <div className="tp-fly tp-fly--flywed">
      <div className="tp-fly__fw-ornament">♥</div>
      <div className="tp-fly__fw-tag">WEDDING PHOTOGRAPHY</div>
      <div className="tp-fly__fw-title">{v(data,'headline','Timeless Moments')}</div>
      <div className="tp-fly__fw-sub">{v(data,'name','Alexandra Moldovan')}</div>
      <div className="tp-fly__fw-divider" />
      <div className="tp-fly__fw-detail">{v(data,'website','alexphoto.ro')}</div>
    </div>
  )
}

function FlyerNewborn({ data={} }) {
  return (
    <div className="tp-fly tp-fly--newborn">
      <div className="tp-fly__nb-icon">🌸</div>
      <div className="tp-fly__nb-tag">NEWBORN · FAMILY</div>
      <div className="tp-fly__nb-title">{v(data,'headline','Precious Moments')}</div>
      <div className="tp-fly__nb-sub">{v(data,'subtext','Photography sessions for your little one')}</div>
      <div className="tp-fly__nb-cta">Book Now</div>
    </div>
  )
}

function FlyerRealEstate({ data={} }) {
  return (
    <div className="tp-fly tp-fly--realestate">
      <div className="tp-fly__rs-header">
        <div className="tp-fly__rs-logo">RE PHOTO</div>
      </div>
      <div className="tp-fly__rs-body">
        <div className="tp-fly__rs-title">{v(data,'headline','Real Estate Photography')}</div>
        <div className="tp-fly__rs-sub">{v(data,'subtext','Professional property shots that sell')}</div>
        <div className="tp-fly__rs-grid">
          {['#cbd5e1','#94a3b8','#64748b'].map((c,i)=><div key={i} className="tp-fly__rs-img" style={{background:c}} />)}
        </div>
        <div className="tp-fly__rs-cta">{v(data,'phone','+40 721 000 000')}</div>
      </div>
    </div>
  )
}

function FlyerGeometric({ data={} }) {
  return (
    <div className="tp-fly tp-fly--flygeo">
      <div className="tp-fly__fg-tri1" /><div className="tp-fly__fg-tri2" />
      <div className="tp-fly__fg-content">
        <div className="tp-fly__fg-title">{v(data,'headline','Photography')}</div>
        <div className="tp-fly__fg-sub">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-fly__fg-date">{v(data,'date','2025')}</div>
      </div>
    </div>
  )
}

function FlyerVintage({ data={} }) {
  return (
    <div className="tp-fly tp-fly--flyvint">
      <div className="tp-fly__fv-frame">
        <div className="tp-fly__fv-tag">★ SINCE 2015 ★</div>
        <div className="tp-fly__fv-title">{v(data,'headline','Studio Fotografic')}</div>
        <div className="tp-fly__fv-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-fly__fv-rule" />
        <div className="tp-fly__fv-detail">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function FlyerNeonClub({ data={} }) {
  return (
    <div className="tp-fly tp-fly--neonclub">
      <div className="tp-fly__nc-date">{v(data,'date','SAT 21 JUNE')}</div>
      <div className="tp-fly__nc-title">{v(data,'headline','NIGHT SESSION')}</div>
      <div className="tp-fly__nc-sub">{v(data,'subtext','Photography & Art')}</div>
      <div className="tp-fly__nc-line" />
      <div className="tp-fly__nc-venue">{v(data,'venue','Club Fusion · Cluj')}</div>
      <div className="tp-fly__nc-cta">GET TICKETS</div>
    </div>
  )
}

function FlyerSpring({ data={} }) {
  return (
    <div className="tp-fly tp-fly--spring">
      <div className="tp-fly__sp-icon">🌷</div>
      <div className="tp-fly__sp-tag">SPRING SPECIAL</div>
      <div className="tp-fly__sp-title">{v(data,'headline','Spring Sessions')}</div>
      <div className="tp-fly__sp-sub">{v(data,'subtext','Limited spots available in May')}</div>
      <div className="tp-fly__sp-rule" />
      <div className="tp-fly__sp-cta">{v(data,'phone','+40 721 000 000')}</div>
    </div>
  )
}

function FlyerAutumn({ data={} }) {
  return (
    <div className="tp-fly tp-fly--autumn">
      <div className="tp-fly__at-icon">🍂</div>
      <div className="tp-fly__at-title">{v(data,'headline','Autumn Portraits')}</div>
      <div className="tp-fly__at-sub">{v(data,'subtext','Golden hour sessions in the park')}</div>
      <div className="tp-fly__at-divider" />
      <div className="tp-fly__at-name">{v(data,'name','Alexandra M.')}</div>
      <div className="tp-fly__at-web">{v(data,'website','alexphoto.ro')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW INVITATIONS
   ═══════════════════════════════════════════════════════════════════════ */
function InvEngagement({ data={} }) {
  return (
    <div className="tp-inv tp-inv--engagement">
      <div className="tp-inv__eg-icon">💍</div>
      <div className="tp-inv__eg-pre">We're getting married!</div>
      <div className="tp-inv__eg-names">{v(data,'names','Ana & Mihai')}</div>
      <div className="tp-inv__eg-sub">invite you to celebrate our engagement</div>
      <div className="tp-inv__eg-divider" />
      <div className="tp-inv__eg-date">{v(data,'date','15 Iulie 2025')}</div>
      <div className="tp-inv__eg-venue">{v(data,'venue','La Botanica, Cluj')}</div>
    </div>
  )
}

function InvAnniversary({ data={} }) {
  return (
    <div className="tp-inv tp-inv--anniversary">
      <div className="tp-inv__av-years">25</div>
      <div className="tp-inv__av-label">YEARS TOGETHER</div>
      <div className="tp-inv__av-names">{v(data,'names','Ana & Mihai')}</div>
      <div className="tp-inv__av-rule" />
      <div className="tp-inv__av-date">{v(data,'date','21 Sept 2025')}</div>
      <div className="tp-inv__av-venue">{v(data,'venue','Restaurant Elegant')}</div>
    </div>
  )
}

function InvBabyShower({ data={} }) {
  return (
    <div className="tp-inv tp-inv--babyshow">
      <div className="tp-inv__by-icon">🍼</div>
      <div className="tp-inv__by-pre">Join us to celebrate</div>
      <div className="tp-inv__by-name">{v(data,'names','Baby Maria')}</div>
      <div className="tp-inv__by-divider" />
      <div className="tp-inv__by-date">{v(data,'date','12 Oct 2025 · 15:00')}</div>
      <div className="tp-inv__by-venue">{v(data,'venue','Grădina Botanică, Cluj')}</div>
    </div>
  )
}

function InvChristmas({ data={} }) {
  return (
    <div className="tp-inv tp-inv--xmas">
      <div className="tp-inv__xm-icon">🎄</div>
      <div className="tp-inv__xm-title">{v(data,'headline','Christmas Party')}</div>
      <div className="tp-inv__xm-sub">{v(data,'names','Alexandra Photography')}</div>
      <div className="tp-inv__xm-rule" />
      <div className="tp-inv__xm-date">{v(data,'date','24 Decembrie 2025')}</div>
      <div className="tp-inv__xm-venue">{v(data,'venue','Studio Alex, Cluj')}</div>
    </div>
  )
}

function InvNewYear({ data={} }) {
  return (
    <div className="tp-inv tp-inv--newyear">
      <div className="tp-inv__nyr-year">2026</div>
      <div className="tp-inv__nyr-title">NEW YEAR'S PARTY</div>
      <div className="tp-inv__nyr-host">{v(data,'names','Alexandra M.')}</div>
      <div className="tp-inv__nyr-rule" />
      <div className="tp-inv__nyr-date">{v(data,'date','31 Dec · 22:00')}</div>
      <div className="tp-inv__nyr-venue">{v(data,'venue','Penthouse · Cluj')}</div>
    </div>
  )
}

function InvBirthdayKids({ data={} }) {
  return (
    <div className="tp-inv tp-inv--bkids">
      <div className="tp-inv__bk-balloons">🎈🎈🎈</div>
      <div className="tp-inv__bk-title">PARTY TIME!</div>
      <div className="tp-inv__bk-name">{v(data,'names',"Luca's 5th Birthday")}</div>
      <div className="tp-inv__bk-rule" />
      <div className="tp-inv__bk-date">{v(data,'date','5 Mai 2025 · 14:00')}</div>
      <div className="tp-inv__bk-venue">{v(data,'venue','Fun Park, Cluj')}</div>
    </div>
  )
}

function InvFarewell({ data={} }) {
  return (
    <div className="tp-inv tp-inv--farewell">
      <div className="tp-inv__fl-pre">Join us to say goodbye to</div>
      <div className="tp-inv__fl-name">{v(data,'names','Alexandra M.')}</div>
      <div className="tp-inv__fl-sub">who is moving on to new adventures</div>
      <div className="tp-inv__fl-rule" />
      <div className="tp-inv__fl-date">{v(data,'date','30 Iunie 2025')}</div>
      <div className="tp-inv__fl-venue">{v(data,'venue','Terasa Panoramic, Cluj')}</div>
    </div>
  )
}

function InvReunion({ data={} }) {
  return (
    <div className="tp-inv tp-inv--reunion">
      <div className="tp-inv__ru-badge">CLASS OF 2015</div>
      <div className="tp-inv__ru-title">REUNION</div>
      <div className="tp-inv__ru-sub">10 years · let's celebrate</div>
      <div className="tp-inv__ru-rule" />
      <div className="tp-inv__ru-date">{v(data,'date','15 Aug 2025')}</div>
      <div className="tp-inv__ru-venue">{v(data,'venue','Campus UBB, Cluj')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW POSTCARDS
   ═══════════════════════════════════════════════════════════════════════ */
function PCCongratulations({ data={} }) {
  return (
    <div className="tp-pc tp-pc--congrats">
      <div className="tp-pc__cg-icon">🎊</div>
      <div className="tp-pc__cg-title">Congratulations!</div>
      <div className="tp-pc__cg-text">{v(data,'subtext','Wishing you all the best in this new chapter.')}</div>
      <div className="tp-pc__cg-sig">{v(data,'name','Alexandra M.')}</div>
    </div>
  )
}

function PCBirthdayWish({ data={} }) {
  return (
    <div className="tp-pc tp-pc--bwish">
      <div className="tp-pc__bw-icon">🎂</div>
      <div className="tp-pc__bw-title">Happy Birthday!</div>
      <div className="tp-pc__bw-text">{v(data,'subtext','May this year bring you joy and beautiful moments.')}</div>
      <div className="tp-pc__bw-sig">{v(data,'name','Alexandra M.')}</div>
    </div>
  )
}

function PCWeddingThanks({ data={} }) {
  return (
    <div className="tp-pc tp-pc--wedthanks">
      <div className="tp-pc__wt-ornament">✦ ✦ ✦</div>
      <div className="tp-pc__wt-title">Thank You</div>
      <div className="tp-pc__wt-text">{v(data,'subtext','For being part of our special day. Your presence meant the world.')}</div>
      <div className="tp-pc__wt-names">{v(data,'names','Ana & Mihai')}</div>
    </div>
  )
}

function PCNewStudio({ data={} }) {
  return (
    <div className="tp-pc tp-pc--newstudio">
      <div className="tp-pc__ns-badge">OPEN</div>
      <div className="tp-pc__ns-title">{v(data,'headline','New Studio Location')}</div>
      <div className="tp-pc__ns-sub">{v(data,'subtext','Come visit us at our beautiful new space')}</div>
      <div className="tp-pc__ns-addr">{v(data,'address','Str. Memorandumului 10, Cluj')}</div>
      <div className="tp-pc__ns-web">{v(data,'website','alexphoto.ro')}</div>
    </div>
  )
}

function PCSeasonalSpring({ data={} }) {
  return (
    <div className="tp-pc tp-pc--seasspring">
      <div className="tp-pc__ss-icon">🌸</div>
      <div className="tp-pc__ss-title">Spring is Here!</div>
      <div className="tp-pc__ss-text">{v(data,'subtext','Book your spring portrait session now.')}</div>
      <div className="tp-pc__ss-cta">Limited spots · {v(data,'phone','+40 721 000 000')}</div>
    </div>
  )
}

function PCReferral({ data={} }) {
  return (
    <div className="tp-pc tp-pc--referral">
      <div className="tp-pc__rf-title">REFER A FRIEND</div>
      <div className="tp-pc__rf-discount">Get 20% OFF</div>
      <div className="tp-pc__rf-text">{v(data,'subtext','Share this card and both of you save')}</div>
      <div className="tp-pc__rf-code">{v(data,'tagline','Code: FRIEND20')}</div>
      <div className="tp-pc__rf-name">{v(data,'name','Alexandra M. Photography')}</div>
    </div>
  )
}

function PCLoyalty({ data={} }) {
  return (
    <div className="tp-pc tp-pc--loyalty">
      <div className="tp-pc__ly-top">LOYALTY CARD</div>
      <div className="tp-pc__ly-name">{v(data,'name','Alexandra M.')}</div>
      <div className="tp-pc__ly-dots">
        {[...Array(5)].map((_,i)=><div key={i} className={`tp-pc__ly-dot ${i<2?'filled':''}`} />)}
      </div>
      <div className="tp-pc__ly-text">5 sessions = 1 FREE</div>
      <div className="tp-pc__ly-web">{v(data,'website','alexphoto.ro')}</div>
    </div>
  )
}

function PCNewYear({ data={} }) {
  return (
    <div className="tp-pc tp-pc--newyear">
      <div className="tp-pc__ny-year">2026</div>
      <div className="tp-pc__ny-title">Happy New Year!</div>
      <div className="tp-pc__ny-text">{v(data,'subtext','Wishing you a year full of beautiful light and memories.')}</div>
      <div className="tp-pc__ny-sig">{v(data,'name','Alexandra M.')} 📷</div>
    </div>
  )
}

function PCMemorial({ data={} }) {
  return (
    <div className="tp-pc tp-pc--memorial">
      <div className="tp-pc__ml-ornament">— · —</div>
      <div className="tp-pc__ml-title">In Memoriam</div>
      <div className="tp-pc__ml-name">{v(data,'names','Ion Popescu')}</div>
      <div className="tp-pc__ml-dates">{v(data,'date','1940 – 2025')}</div>
      <div className="tp-pc__ml-text">{v(data,'subtext','Forever in our hearts')}</div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   NEW POSTERS
   ═══════════════════════════════════════════════════════════════════════ */
function PosterWorkshop({ data={} }) {
  return (
    <div className="tp-pos tp-pos--workshop">
      <div className="tp-pos__wk-tag">PHOTOGRAPHY WORKSHOP</div>
      <div className="tp-pos__wk-title">{v(data,'headline','Master the Light')}</div>
      <div className="tp-pos__wk-host">with {v(data,'name','Alexandra Moldovan')}</div>
      <div className="tp-pos__wk-rule" />
      <div className="tp-pos__wk-details">
        <div className="tp-pos__wk-detail">📅 {v(data,'date','10 Mai 2025')}</div>
        <div className="tp-pos__wk-detail">📍 {v(data,'venue','Studio A, Cluj')}</div>
      </div>
      <div className="tp-pos__wk-cta">Register Now</div>
    </div>
  )
}

function PosterAuction({ data={} }) {
  return (
    <div className="tp-pos tp-pos--auction">
      <div className="tp-pos__au-eyebrow">CHARITY ART AUCTION</div>
      <div className="tp-pos__au-title">{v(data,'headline','Frames of Life')}</div>
      <div className="tp-pos__au-author">{v(data,'name','Alexandra Moldovan')}</div>
      <div className="tp-pos__au-lot">
        <div className="tp-pos__au-item" /><div className="tp-pos__au-item" /><div className="tp-pos__au-item" />
      </div>
      <div className="tp-pos__au-date">{v(data,'date','1 Iunie 2025')} · {v(data,'venue','Galeria Fusion')}</div>
    </div>
  )
}

function PosterMovie({ data={} }) {
  return (
    <div className="tp-pos tp-pos--movie">
      <div className="tp-pos__mv-studio">ALEXANDRA STUDIOS</div>
      <div className="tp-pos__mv-title">{v(data,'headline','THE ART OF SEEING')}</div>
      <div className="tp-pos__mv-tagline">{v(data,'subtext','Every frame tells a story')}</div>
      <div className="tp-pos__mv-img" />
      <div className="tp-pos__mv-bar">
        <div className="tp-pos__mv-cast">{v(data,'name','A. Moldovan')} · {v(data,'date','2025')}</div>
      </div>
    </div>
  )
}

function PosterGeometric({ data={} }) {
  return (
    <div className="tp-pos tp-pos--posgeo">
      <div className="tp-pos__pg-shape1" /><div className="tp-pos__pg-shape2" /><div className="tp-pos__pg-shape3" />
      <div className="tp-pos__pg-content">
        <div className="tp-pos__pg-title">{v(data,'headline','GEOMETRY\nOF LIGHT')}</div>
        <div className="tp-pos__pg-name">{v(data,'name','A. MOLDOVAN')}</div>
        <div className="tp-pos__pg-date">{v(data,'date','2025')}</div>
      </div>
    </div>
  )
}

function PosterStreet({ data={} }) {
  return (
    <div className="tp-pos tp-pos--street">
      <div className="tp-pos__sr-noise" />
      <div className="tp-pos__sr-content">
        <div className="tp-pos__sr-tag">URBAN · PHOTOGRAPHY</div>
        <div className="tp-pos__sr-title">{v(data,'headline','STREETS OF CLUJ')}</div>
        <div className="tp-pos__sr-name">{v(data,'name','A. Moldovan')}</div>
        <div className="tp-pos__sr-rule" />
        <div className="tp-pos__sr-date">{v(data,'date','2025')}</div>
      </div>
    </div>
  )
}

function PosterPortraitStudio({ data={} }) {
  return (
    <div className="tp-pos tp-pos--portraitstudio">
      <div className="tp-pos__pt-photo" style={pStyle(data.photo,'linear-gradient(160deg,#c8a882,#3d2010)')} />
      <div className="tp-pos__pt-panel">
        <div className="tp-pos__pt-tag">PORTRAIT STUDIO</div>
        <div className="tp-pos__pt-name">{v(data,'name','Alexandra M.')}</div>
        <div className="tp-pos__pt-rule" />
        <div className="tp-pos__pt-sub">{v(data,'subtext','Capturing your true essence')}</div>
        <div className="tp-pos__pt-web">{v(data,'website','alexphoto.ro')}</div>
      </div>
    </div>
  )
}

function PosterGrunge({ data={} }) {
  return (
    <div className="tp-pos tp-pos--grunge">
      <div className="tp-pos__gu-scratch1" /><div className="tp-pos__gu-scratch2" />
      <div className="tp-pos__gu-content">
        <div className="tp-pos__gu-eyebrow">RAW · UNFILTERED</div>
        <div className="tp-pos__gu-title">{v(data,'headline','REAL PHOTOGRAPHY')}</div>
        <div className="tp-pos__gu-sub">{v(data,'name','ALEXANDRA MOLDOVAN')}</div>
        <div className="tp-pos__gu-date">{v(data,'date','2025')}</div>
      </div>
    </div>
  )
}

function PosterArtDeco({ data={} }) {
  return (
    <div className="tp-pos tp-pos--artdeco">
      <div className="tp-pos__ar-border">
        <div className="tp-pos__ar-fan-top" />
        <div className="tp-pos__ar-title">{v(data,'headline','ART OF\nPHOTOGRAPHY')}</div>
        <div className="tp-pos__ar-author">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-pos__ar-rule" />
        <div className="tp-pos__ar-date">{v(data,'date','MMXXV')}</div>
        <div className="tp-pos__ar-fan-bottom" />
      </div>
    </div>
  )
}

function PosterSwiss({ data={} }) {
  return (
    <div className="tp-pos tp-pos--swiss">
      <div className="tp-pos__sw-grid">
        <div className="tp-pos__sw-col-left">
          <div className="tp-pos__sw-vert">PHOTOGRAPHY</div>
        </div>
        <div className="tp-pos__sw-col-right">
          <div className="tp-pos__sw-title">{v(data,'headline','LICHT &\nSCHATTEN')}</div>
          <div className="tp-pos__sw-rule" />
          <div className="tp-pos__sw-name">{v(data,'name','A. Moldovan')}</div>
          <div className="tp-pos__sw-date">{v(data,'date','2025')}</div>
          <div className="tp-pos__sw-dot" />
        </div>
      </div>
    </div>
  )
}

function PosterWeddingFair({ data={} }) {
  return (
    <div className="tp-pos tp-pos--wedfair">
      <div className="tp-pos__wf-top">
        <div className="tp-pos__wf-heart">♥</div>
        <div className="tp-pos__wf-tag">WEDDING FAIR</div>
      </div>
      <div className="tp-pos__wf-title">{v(data,'headline','The Perfect Shot\nfor Your Perfect Day')}</div>
      <div className="tp-pos__wf-name">{v(data,'name','Alexandra Moldovan Photography')}</div>
      <div className="tp-pos__wf-rule" />
      <div className="tp-pos__wf-date">{v(data,'date','15 Mart 2025')} · {v(data,'venue','Palatul Culturii')}</div>
      <div className="tp-pos__wf-stand">Stand B12</div>
    </div>
  )
}

function PosterNature({ data={} }) {
  return (
    <div className="tp-pos tp-pos--nature">
      <div className="tp-pos__nt-top">
        <div className="tp-pos__nt-icon">🌲</div>
        <div className="tp-pos__nt-tag">NATURE PHOTOGRAPHY</div>
      </div>
      <div className="tp-pos__nt-img" />
      <div className="tp-pos__nt-bottom">
        <div className="tp-pos__nt-title">{v(data,'headline','Wild & Free')}</div>
        <div className="tp-pos__nt-name">{v(data,'name','Alexandra Moldovan')}</div>
        <div className="tp-pos__nt-date">{v(data,'date','Colecția 2025')}</div>
      </div>
    </div>
  )
}

function PosterMinimalDark({ data={} }) {
  return (
    <div className="tp-pos tp-pos--mindark">
      <div className="tp-pos__md-line-top" />
      <div className="tp-pos__md-content">
        <div className="tp-pos__md-eyebrow">{v(data,'subtext','PHOTOGRAPHY')}</div>
        <div className="tp-pos__md-title">{v(data,'headline','LIGHT.\nSHADOW.\nSTORY.')}</div>
        <div className="tp-pos__md-name">{v(data,'name','A. Moldovan')}</div>
      </div>
      <div className="tp-pos__md-line-bot" />
      <div className="tp-pos__md-date">{v(data,'date','2025')}</div>
    </div>
  )
}

/* ── Router ──────────────────────────────────────────────────────────── */
const PREVIEW_MAP = {
  'business-card': {
    noir: BCNoir, classic: BCClassic, gradient: BCGradient, split: BCSplit,
    gold: BCGold, pastel: BCPastel, mono: BCMono, retro: BCRetro,
    photocirc: BCPhotoCircle, photoleft: BCPhotoLeft, photobanner: BCPhotoBanner,
    photofull: BCPhotoFull, photooval: BCPhotoOval, photocorner: BCPhotoCorner,
    photodiag: BCPhotoDiagonal, photoduo: BCPhotoDuo,
    neon: BCNeon, minline: BCMinimalLine, qr: BCQr, waterc: BCWatercolor,
    luxwhite: BCLuxuryWhite, rosegold: BCRoseGold, sage: BCSage,
    blueprint: BCBlueprint, geobc: BCGeometric,
  },
  'cv': {
    executive: CVExecutive, minimal: CVMinimal, creative: CVCreative, photo: CVPhoto,
    timeline: CVTimeline, academic: CVAcademic, boldheader: CVBoldHeader, compact: CVCompact,
    infog: CVInfographic, colorful: CVColorful, darkmin: CVDarkMinimal,
    european: CVEuropean, grid: CVGrid, portfoliocv: CVPortfolioCv,
  },
  'flyer': {
    event: FlyerEvent, showcase: FlyerShowcase, promo: FlyerPromo,
    minimal: FlyerMinimal, darkphoto: FlyerDarkPhoto, corporate: FlyerCorporate,
    flywed: FlyerWedding, newborn: FlyerNewborn, realestate: FlyerRealEstate,
    flygeo: FlyerGeometric, flyvint: FlyerVintage, neonclub: FlyerNeonClub,
    spring: FlyerSpring, autumn: FlyerAutumn,
  },
  'invitation': {
    wedding: InvWedding, corporate: InvCorporate, gallery: InvGallery,
    birthday: InvBirthday, baptism: InvBaptism, graduation: InvGraduation,
    engagement: InvEngagement, anniversary: InvAnniversary, babyshow: InvBabyShower,
    xmas: InvChristmas, newyear: InvNewYear, bkids: InvBirthdayKids,
    farewell: InvFarewell, reunion: InvReunion,
  },
  'postcard': {
    thankyou: PCThankYou, announcement: PCAnnouncement, holiday: PCHoliday,
    portfolio: PCPortfolio, promocard: PCPromo,
    congrats: PCCongratulations, bwish: PCBirthdayWish, wedthanks: PCWeddingThanks,
    newstudio: PCNewStudio, seasspring: PCSeasonalSpring, referral: PCReferral,
    loyalty: PCLoyalty, newyear: PCNewYear, memorial: PCMemorial,
  },
  'poster': {
    exhibition: PosterExhibition, bold: PosterBold, text: PosterText,
    photobg: PosterPhotoBg, split: PosterSplit, retro: PosterRetro, neon: PosterNeon,
    workshop: PosterWorkshop, auction: PosterAuction, movie: PosterMovie,
    posgeo: PosterGeometric, street: PosterStreet, portraitstudio: PosterPortraitStudio,
    grunge: PosterGrunge, artdeco: PosterArtDeco, swiss: PosterSwiss,
    wedfair: PosterWeddingFair, nature: PosterNature, mindark: PosterMinimalDark,
  },
}

export default function TemplatePreview({ preview, size = 'card', data = {} }) {
  const Component = PREVIEW_MAP[preview.type]?.[preview.theme]
  if (!Component) return <div className="tp-placeholder">Preview</div>
  return (
    <div className={`tp-wrap tp-wrap--${preview.type} tp-wrap--${size}`}>
      <Component data={data} />
    </div>
  )
}
