'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import ScoreSection from '@/components/ScoreSection'
import DrawSection from '@/components/DrawSection'
import CharitySection from '@/components/CharitySection'
import SubscriptionSection from '@/components/SubscriptionSection'

/* ─── CSS ──────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold:     #C9A84C;
    --gold-lt:  #E8C97A;
    --gold-dk:  #8B6914;
    --obsidian: #080C10;
    --ink:      #0D1117;
    --slate:    #1A2332;
    --mist:     #B4C2D4;
    --white:    #F5F0E8;
    --success:  #6DBF8A;
    --ff-head:  'Cormorant Garamond', Georgia, serif;
    --ff-body:  'DM Sans', sans-serif;
  }

  html, body { height: 100%; }

  body {
    background: var(--obsidian);
    color: var(--white);
    font-family: var(--ff-body);
    font-weight: 300;
    overflow-x: hidden;
    cursor: none;
    min-height: 100vh;
  }

  /* ── Cursor ── */
  .cursor { position: fixed; top: 0; left: 0; z-index: 9999; pointer-events: none; }
  .cursor-ring {
    width: 36px; height: 36px;
    border: 1.5px solid var(--gold); border-radius: 50%;
    position: absolute; transform: translate(-50%,-50%);
    transition: width .25s, height .25s, border-color .25s, opacity .25s;
    opacity: .7;
  }
  .cursor-dot {
    width: 6px; height: 6px; background: var(--gold);
    border-radius: 50%; position: absolute; transform: translate(-50%,-50%);
  }
  .cursor.hovered .cursor-ring { width: 52px; height: 52px; border-color: var(--gold-lt); opacity: 1; }

  /* ── Layout shell ── */
  .dash-shell {
    display: flex; min-height: 100vh; position: relative;
  }

  /* ── Ambient orbs ── */
  .orb {
    position: fixed; border-radius: 50%; filter: blur(130px); opacity: .1;
    animation: drift 22s ease-in-out infinite; pointer-events: none; z-index: 0;
  }
  .orb-1 { width: 700px; height: 700px; background: var(--gold-dk); top: -250px; right: -200px; animation-duration: 20s; }
  .orb-2 { width: 450px; height: 450px; background: #0E2A45; bottom: -80px; left: 200px; animation-duration: 28s; animation-delay: -10s; }
  @keyframes drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%  { transform: translate(20px,-15px) scale(1.05); }
    66%  { transform: translate(-15px,20px) scale(.97); }
  }

  /* grid texture */
  .dash-shell::before {
    content: ''; position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(201,168,76,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,.025) 1px, transparent 1px);
    background-size: 70px 70px; pointer-events: none;
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 260px; flex-shrink: 0;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 50;
    display: flex; flex-direction: column;
    background: rgba(8,12,16,.97);
    border-right: 1px solid rgba(201,168,76,.09);
    padding: 40px 0 32px;
    transition: transform .4s cubic-bezier(.4,0,.2,1);
  }

  .sidebar-logo-wrap {
    padding: 0 32px 40px;
    border-bottom: 1px solid rgba(201,168,76,.08);
    margin-bottom: 32px;
  }
  .sidebar-logo {
    font-family: var(--ff-head); font-size: 24px; font-weight: 400;
    letter-spacing: .15em; color: var(--gold); text-decoration: none;
    display: block;
  }
  .sidebar-logo-sub {
    font-size: 10px; letter-spacing: .35em; text-transform: uppercase;
    color: var(--mist); opacity: .35; margin-top: 4px;
  }

  /* nav items */
  .sidebar-nav { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }

  .nav-item {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 16px; border-radius: 3px; cursor: none;
    border: 1px solid transparent;
    transition: background .25s, border-color .25s;
    position: relative; overflow: hidden;
    background: none;
    width: 100%; text-align: left;
  }
  .nav-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: var(--gold); transform: scaleY(0); transform-origin: center;
    transition: transform .25s ease;
    border-radius: 0 2px 2px 0;
  }
  .nav-item:hover { background: rgba(201,168,76,.05); border-color: rgba(201,168,76,.1); }
  .nav-item.active {
    background: rgba(201,168,76,.08);
    border-color: rgba(201,168,76,.18);
  }
  .nav-item.active::before { transform: scaleY(1); }

  .nav-item-icon {
    width: 36px; height: 36px; border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(26,35,50,.6); flex-shrink: 0;
    color: var(--mist); opacity: .5;
    transition: background .25s, opacity .25s, color .25s;
  }
  .nav-item:hover .nav-item-icon { opacity: .8; }
  .nav-item.active .nav-item-icon {
    background: rgba(201,168,76,.12); color: var(--gold); opacity: 1;
  }

  .nav-item-text { flex: 1; }
  .nav-item-label {
    font-size: 12px; letter-spacing: .15em; text-transform: uppercase;
    color: var(--mist); opacity: .55;
    transition: opacity .25s, color .25s;
    display: block;
  }
  .nav-item:hover .nav-item-label { opacity: .85; }
  .nav-item.active .nav-item-label { color: var(--white); opacity: 1; }

  .nav-item-desc {
    font-size: 10px; color: var(--mist); opacity: .3; margin-top: 1px;
    transition: opacity .25s;
  }
  .nav-item.active .nav-item-desc { opacity: .5; }

  /* section divider label */
  .nav-section-label {
    font-size: 9px; letter-spacing: .45em; text-transform: uppercase;
    color: var(--mist); opacity: .25;
    padding: 20px 32px 8px;
  }

  /* sidebar footer */
  .sidebar-footer {
    padding: 24px 32px 0;
    border-top: 1px solid rgba(201,168,76,.08);
    margin-top: 16px;
  }
  .sidebar-user-email {
    font-size: 11px; color: var(--mist); opacity: .4;
    letter-spacing: .05em; margin-bottom: 14px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-logout {
    width: 100%; padding: 11px 16px;
    display: flex; align-items: center; gap: 10px;
    font-family: var(--ff-body); font-size: 10px; font-weight: 400;
    letter-spacing: .25em; text-transform: uppercase;
    color: var(--mist); background: none;
    border: 1px solid rgba(180,194,212,.12); border-radius: 3px;
    cursor: none; transition: border-color .3s, color .3s;
  }
  .sidebar-logout:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Mobile top bar ── */
  .topbar {
    display: none;
    position: fixed; top: 0; left: 0; right: 0; z-index: 60;
    align-items: center; justify-content: space-between;
    padding: 18px 24px;
    background: rgba(8,12,16,.97);
    border-bottom: 1px solid rgba(201,168,76,.09);
  }
  .topbar-logo {
    font-family: var(--ff-head); font-size: 20px; font-weight: 400;
    letter-spacing: .15em; color: var(--gold); text-decoration: none;
  }
  .topbar-hamburger {
    background: none; border: 1px solid rgba(180,194,212,.15); border-radius: 3px;
    padding: 8px 10px; cursor: none; color: var(--mist);
    transition: border-color .3s;
  }
  .topbar-hamburger:hover { border-color: var(--gold); }

  /* mobile drawer */
  .sidebar.mobile-open { transform: translateX(0) !important; }

  /* ── Main content ── */
  .dash-main {
    margin-left: 260px; flex: 1;
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column;
  }

  /* ── Content header ── */
  .content-header {
    padding: 52px 60px 40px;
    border-bottom: 1px solid rgba(180,194,212,.06);
    opacity: 0; transform: translateY(16px);
    transition: opacity .7s .1s ease, transform .7s .1s ease;
  }
  .content-header.in { opacity: 1; transform: translateY(0); }

  .content-eyebrow {
    font-size: 10px; letter-spacing: .45em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 12px; opacity: .8;
    display: flex; align-items: center; gap: 12px;
  }
  .content-eyebrow::before {
    content: ''; display: block; width: 24px; height: 1px;
    background: var(--gold); opacity: .5;
  }
  .content-title {
    font-family: var(--ff-head);
    font-size: clamp(32px, 3.5vw, 56px);
    font-weight: 300; line-height: 1.05; color: var(--white);
  }
  .content-title em { font-style: italic; color: var(--gold); }
  .content-subtitle {
    font-size: 13px; color: var(--mist); opacity: .55;
    margin-top: 10px; line-height: 1.7; max-width: 460px;
  }

  /* ── Content body ── */
  .content-body {
    padding: 48px 60px 80px;
    opacity: 0; transform: translateY(20px);
    transition: opacity .7s .2s ease, transform .7s .2s ease;
    flex: 1;
  }
  .content-body.in { opacity: 1; transform: translateY(0); }

  /* section fade for tab switching */
  .section-fade {
    animation: secFadeIn .4s ease forwards;
  }
  @keyframes secFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Overview cards ── */
  .overview-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
    margin-bottom: 40px;
  }
  .ov-card {
    border: 1px solid rgba(201,168,76,.12); border-radius: 4px;
    padding: 26px 28px; background: rgba(201,168,76,.04);
    position: relative; overflow: hidden;
    transition: border-color .3s, background .3s;
    cursor: none;
  }
  .ov-card:hover { border-color: rgba(201,168,76,.28); background: rgba(201,168,76,.07); }
  .ov-card::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .ov-card:hover::after { opacity: .5; }
  .ov-card-label {
    font-size: 9px; letter-spacing: .4em; text-transform: uppercase;
    color: var(--mist); opacity: .45; margin-bottom: 12px;
  }
  .ov-card-value {
    font-family: var(--ff-head); font-size: 40px; font-weight: 300;
    color: var(--white); line-height: 1;
  }
  .ov-card-value em { font-style: italic; color: var(--gold); }
  .ov-card-delta { font-size: 11px; color: var(--success); margin-top: 8px; opacity: .8; }

  /* overview quick-nav */
  .ov-sections { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .ov-section-btn {
    border: 1px solid rgba(180,194,212,.08); border-radius: 4px;
    padding: 22px 24px; background: rgba(26,35,50,.3);
    cursor: none; text-align: left; width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    transition: border-color .3s, background .3s;
    position: relative; overflow: hidden;
  }
  .ov-section-btn::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity: 0; transition: opacity .3s;
  }
  .ov-section-btn:hover { border-color: rgba(201,168,76,.22); background: rgba(26,35,50,.6); }
  .ov-section-btn:hover::before { opacity: .5; }
  .ov-btn-label {
    font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
    color: var(--mist); opacity: .45; margin-bottom: 6px; display: block;
  }
  .ov-btn-title {
    font-family: var(--ff-head); font-size: 22px; font-weight: 300;
    color: var(--white);
  }
  .ov-btn-title em { font-style: italic; color: var(--gold); }
  .ov-btn-arrow { color: var(--gold); opacity: .5; transition: opacity .3s, transform .3s; }
  .ov-section-btn:hover .ov-btn-arrow { opacity: 1; transform: translateX(4px); }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .topbar { display: flex; }
    .sidebar {
      transform: translateX(-100%);
      top: 0; padding-top: 80px;
    }
    .dash-main { margin-left: 0; padding-top: 60px; }
    .content-header { padding: 32px 24px 28px; }
    .content-body { padding: 32px 24px 60px; }
    .overview-grid { grid-template-columns: 1fr; }
    .ov-sections { grid-template-columns: 1fr; }
  }
`

/* ─── Nav items config ──────────────────────────────────────────── */
type SectionKey = 'overview' | 'scores' | 'draw' | 'charity' | 'subscription'

const NAV_ITEMS: {
  key: SectionKey
  label: string
  desc: string
  icon: () => JSX.Element
  eyebrow: string
  title: string
  titleEm: string
  subtitle: string
}[] = [
  {
    key: 'overview',
    label: 'Overview',
    desc: 'Dashboard summary',
    eyebrow: 'Dashboard',
    title: 'Welcome ',
    titleEm: 'back.',
    subtitle: 'A snapshot of your scores, draw status, and charity contributions.',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    key: 'scores',
    label: 'Scores',
    desc: 'Log & view rounds',
    eyebrow: 'Score System',
    title: 'Your ',
    titleEm: 'Scores.',
    subtitle: 'Log your latest round and track your last five scores.',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    key: 'draw',
    label: 'Monthly Draw',
    desc: "This month's entry", // ✅ FIXED HERE
    eyebrow: 'Prize Draw',
    title: 'Monthly ',
    titleEm: 'Draw.',
    subtitle: 'Your numbers for this month\'s draw — matched against your scores.',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4l3 3"/>
      </svg>
    ),
  },
  {
    key: 'charity',
    label: 'Charity',
    desc: 'Choose your cause',
    eyebrow: 'Charity Impact',
    title: 'Your ',
    titleEm: 'Charity.',
    subtitle: 'Select the cause that receives 10% of your winnings each month.',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    key: 'subscription',
    label: 'Subscription',
    desc: 'Manage your plan',
    eyebrow: 'Membership',
    title: 'Your ',
    titleEm: 'Plan.',
    subtitle: 'Manage your subscription, upgrade, or cancel at any time.',
    icon: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

/* ─── Icons ─────────────────────────────────────────────────────── */
const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/* ─── Overview panel ─────────────────────────────────────────────── */
function Overview({ onNav }: { onNav: (k: SectionKey) => void }) {
  return (
    <>
      <div className="overview-grid">
        {[
          { label: 'Handicap', value: <>8<em>.4</em></>, delta: '↓ 0.3 this month' },
          { label: 'Rounds This Month', value: <><em>6</em></>, delta: '↑ 2 vs last month' },
          { label: 'Total Donated', value: <>£<em>124</em></>, delta: 'Across 3 charities' },
        ].map(({ label, value, delta }) => (
          <div key={label} className="ov-card">
            <div className="ov-card-label">{label}</div>
            <div className="ov-card-value">{value}</div>
            <div className="ov-card-delta">{delta}</div>
          </div>
        ))}
      </div>

      <div className="ov-sections">
        {NAV_ITEMS.filter(n => n.key !== 'overview').map(item => (
          <button key={item.key} className="ov-section-btn" onClick={() => onNav(item.key)}>
            <div>
              <span className="ov-btn-label">{item.eyebrow}</span>
              <div className="ov-btn-title">{item.title}<em>{item.titleEm}</em></div>
            </div>
            <span className="ov-btn-arrow"><IconArrow /></span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function DashboardClient({ email }: { email: string }) {
  const supabase = createClient()
  const router   = useRouter()

  const [active,   setActive]   = useState<SectionKey>('overview')
  const [animated, setAnimated] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sectionKey, setSectionKey] = useState(0) // force re-mount fade

  /* Cursor */
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [hovered,   setHovered]   = useState(false)
  const cx = useRef(0); const cy = useRef(0)
  const tx = useRef(0); const ty = useRef(0)
  const animFrame = useRef<number>()

  useEffect(() => {
    const move = (e: MouseEvent) => { tx.current = e.clientX; ty.current = e.clientY }
    window.addEventListener('mousemove', move)
    const tick = () => {
      cx.current += (tx.current - cx.current) * 0.12
      cy.current += (ty.current - cy.current) * 0.12
      setCursorPos({ x: cx.current, y: cy.current })
      animFrame.current = requestAnimationFrame(tick)
    }
    animFrame.current = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(animFrame.current!) }
  }, [])

  useEffect(() => {
    const over = (e: MouseEvent) =>
      setHovered(!!(e.target as HTMLElement).closest('a,button,input,select'))
    window.addEventListener('mouseover', over)
    return () => window.removeEventListener('mouseover', over)
  }, [])

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t) }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navigate = (key: SectionKey) => {
    setActive(key)
    setSectionKey(k => k + 1)
    setMobileOpen(false)
  }

  const current = NAV_ITEMS.find(n => n.key === active)!
const safeEmail = email || ''

const displayName = safeEmail
  ? safeEmail
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  : 'User'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Custom cursor */}
      <div
        className={`cursor${hovered ? ' hovered' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px,${cursorPos.y}px)` }}
      >
        <div className="cursor-ring" />
        <div className="cursor-dot" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(8,12,16,.7)', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Mobile top bar */}
      <div className="topbar">
        <Link href="/" className="topbar-logo">Fairway</Link>
        <button className="topbar-hamburger" onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <div className="dash-shell">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        {/* ── Sidebar ── */}
        <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
          <div className="sidebar-logo-wrap">
            <Link href="/" className="sidebar-logo">Fairway</Link>
            <div className="sidebar-logo-sub">Member Portal</div>
          </div>

          <div className="nav-section-label">Navigation</div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`nav-item${active === item.key ? ' active' : ''}`}
                onClick={() => navigate(item.key)}
              >
                <div className="nav-item-icon">
                  <item.icon />
                </div>
                <div className="nav-item-text">
                  <span className="nav-item-label">{item.label}</span>
                  <span className="nav-item-desc">{item.desc}</span>
                </div>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-user-email">{email}</div>
            <button className="sidebar-logout" onClick={handleLogout}>
              <IconLogout /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="dash-main">
          {/* Content header */}
          <div className={`content-header${animated ? ' in' : ''}`}>
            <div className="content-eyebrow">{current.eyebrow}</div>
            <h1 className="content-title">
              {active === 'overview'
                ? <>Welcome back, <em>{displayName}.</em></>
                : <>{current.title}<em>{current.titleEm}</em></>
              }
            </h1>
            <p className="content-subtitle">{current.subtitle}</p>
          </div>

          {/* Content body */}
          <div className={`content-body${animated ? ' in' : ''}`}>
            <div key={sectionKey} className="section-fade">
              {active === 'overview'     && <Overview onNav={navigate} />}
              {active === 'scores'       && <ScoreSection />}
              {active === 'draw'         && <DrawSection />}
              {active === 'charity'      && <CharitySection />}
              {active === 'subscription' && <SubscriptionSection />}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}