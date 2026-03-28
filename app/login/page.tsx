'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

/* ─── CSS ─────────────────────────────────────────────────────────── */
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
    --error:    #E07070;
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

  /* ── Custom cursor ── */
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
  .cursor.hovered .cursor-ring { width: 56px; height: 56px; border-color: var(--gold-lt); opacity: 1; }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 60px;
    background: linear-gradient(to bottom, rgba(8,12,16,.95), transparent);
  }
  .nav-logo {
    font-family: var(--ff-head); font-size: 22px; font-weight: 400;
    letter-spacing: .15em; color: var(--gold); text-decoration: none;
  }
  .nav-back {
    font-size: 11px; letter-spacing: .25em; text-transform: uppercase;
    color: var(--mist); text-decoration: none; opacity: .6;
    transition: opacity .3s, color .3s; display: flex; align-items: center; gap: 8px;
  }
  .nav-back:hover { opacity: 1; color: var(--white); }

  /* ── Page layout ── */
  .login-page {
    min-height: 100vh; display: flex;
    position: relative; overflow: hidden;
  }

  /* ── Left Panel ── */
  .left-panel {
    width: 45%; display: flex; flex-direction: column;
    justify-content: center; padding: 120px 70px 80px;
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, #0A1018 0%, #080C10 100%);
    border-right: 1px solid rgba(201,168,76,.1);
    opacity: 0; transform: translateX(-30px);
    transition: opacity .9s .2s ease, transform .9s .2s ease;
  }
  .left-panel.in { opacity: 1; transform: translateX(0); }

  .orb {
    position: absolute; border-radius: 50%; filter: blur(100px); opacity: .15;
    animation: drift 20s ease-in-out infinite;
  }
  .orb-1 { width: 500px; height: 500px; background: var(--gold-dk); top: -120px; right: -120px; animation-duration: 18s; }
  .orb-2 { width: 300px; height: 300px; background: #1A4A6B; bottom: 60px; left: -60px; animation-duration: 24s; animation-delay: -8s; }
  @keyframes drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33%  { transform: translate(20px,-15px) scale(1.05); }
    66%  { transform: translate(-15px,20px) scale(.97); }
  }

  .left-panel::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(201,168,76,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,.035) 1px, transparent 1px);
    background-size: 70px 70px; pointer-events: none;
  }

  .left-inner { position: relative; z-index: 1; }

  .left-eyebrow {
    font-size: 10px; letter-spacing: .45em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 28px; opacity: .8;
    display: flex; align-items: center; gap: 14px;
  }
  .left-eyebrow::before {
    content: ''; display: block; width: 30px; height: 1px; background: var(--gold); opacity: .5;
  }

  .left-title {
    font-family: var(--ff-head);
    font-size: clamp(42px, 4.5vw, 72px);
    font-weight: 300; line-height: 1.05;
    margin-bottom: 32px; color: var(--white);
  }
  .left-title em { font-style: italic; color: var(--gold); }

  .gold-divider { width: 48px; height: 1px; background: var(--gold); opacity: .4; margin-bottom: 28px; }

  .left-body {
    font-size: 14px; color: var(--mist); line-height: 1.8; opacity: .8;
    margin-bottom: 56px; max-width: 380px;
  }

  /* Testimonial / stat card */
  .stat-card {
    border: 1px solid rgba(201,168,76,.18);
    border-radius: 4px; padding: 28px 32px;
    background: rgba(201,168,76,.04);
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: '"'; position: absolute; top: -10px; left: 20px;
    font-family: var(--ff-head); font-size: 80px; font-weight: 600;
    color: rgba(201,168,76,.12); line-height: 1;
  }
  .stat-quote {
    font-family: var(--ff-head); font-size: 17px; font-weight: 300; font-style: italic;
    color: var(--mist); line-height: 1.6; margin-bottom: 20px; position: relative; z-index: 1;
  }
  .stat-author { display: flex; align-items: center; gap: 12px; }
  .stat-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold-dk), var(--gold));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--ff-head); font-size: 15px; font-weight: 600; color: var(--obsidian);
  }
  .stat-name { font-size: 12px; color: var(--white); letter-spacing: .05em; }
  .stat-role { font-size: 11px; color: var(--mist); opacity: .5; letter-spacing: .05em; }

  /* ── Right Panel ── */
  .right-panel {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 120px 70px 80px;
    opacity: 0; transform: translateX(30px);
    transition: opacity .9s .35s ease, transform .9s .35s ease;
  }
  .right-panel.in { opacity: 1; transform: translateX(0); }

  .form-wrap { width: 100%; max-width: 420px; }

  .form-header { margin-bottom: 48px; }
  .form-eyebrow {
    font-size: 10px; letter-spacing: .45em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 16px; opacity: .8;
  }
  .form-title {
    font-family: var(--ff-head);
    font-size: clamp(32px, 3.5vw, 48px);
    font-weight: 300; color: var(--white);
    line-height: 1.1; margin-bottom: 10px;
  }
  .form-title em { font-style: italic; color: var(--gold); }
  .form-subtitle { font-size: 13px; color: var(--mist); opacity: .6; line-height: 1.6; }

  /* ── Field ── */
  .field { margin-bottom: 20px; position: relative; }
  .field-label {
    display: block; font-size: 10px; letter-spacing: .3em;
    text-transform: uppercase; color: var(--mist); opacity: .7; margin-bottom: 10px;
  }
  .field-input-wrap { position: relative; }
  .field-input {
    width: 100%; padding: 16px 20px;
    background: rgba(26,35,50,.5);
    border: 1px solid rgba(180,194,212,.12);
    border-radius: 3px;
    color: var(--white); font-family: var(--ff-body); font-size: 14px; font-weight: 300;
    outline: none; transition: border-color .3s, background .3s, box-shadow .3s;
    cursor: none;
  }
  .field-input::placeholder { color: var(--mist); opacity: .3; }
  .field-input:focus {
    border-color: rgba(201,168,76,.5);
    background: rgba(26,35,50,.8);
    box-shadow: 0 0 0 3px rgba(201,168,76,.06);
  }
  .field-input.shake {
    animation: shake .4s ease;
    border-color: rgba(224,112,112,.5);
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }

  .field-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: var(--gold); transform: scaleX(0); transform-origin: left;
    transition: transform .35s ease; border-radius: 0 0 3px 3px;
  }
  .field-input:focus ~ .field-bar { transform: scaleX(1); }

  .field-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .forgot-link {
    font-size: 11px; letter-spacing: .15em; color: var(--gold);
    text-decoration: none; opacity: .7; transition: opacity .3s;
  }
  .forgot-link:hover { opacity: 1; }

  .pwd-toggle {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: none;
    color: var(--mist); opacity: .5; transition: opacity .3s;
    padding: 4px; display: flex;
  }
  .pwd-toggle:hover { opacity: 1; }

  /* ── Message ── */
  .form-msg {
    padding: 14px 18px; border-radius: 3px; font-size: 13px;
    margin-bottom: 20px; display: flex; align-items: center; gap: 10px;
    animation: msgSlide .35s ease;
  }
  .form-msg.err { background: rgba(224,112,112,.1); border: 1px solid rgba(224,112,112,.25); color: #E07070; }
  .form-msg.ok  { background: rgba(109,191,138,.1); border: 1px solid rgba(109,191,138,.25); color: var(--success); }
  @keyframes msgSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Submit ── */
  .btn-submit {
    position: relative; overflow: hidden;
    width: 100%; padding: 18px 32px;
    background: var(--gold); color: var(--obsidian);
    font-family: var(--ff-body); font-size: 11px; font-weight: 500;
    letter-spacing: .3em; text-transform: uppercase;
    border: none; border-radius: 3px;
    cursor: none; transition: background .3s, transform .3s, box-shadow .3s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: 28px; margin-bottom: 24px;
  }
  .btn-submit::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.22), transparent 70%);
    transform: translateX(-100%); transition: transform .55s ease;
  }
  .btn-submit:hover:not(:disabled)::before { transform: translateX(100%); }
  .btn-submit:hover:not(:disabled) {
    background: var(--gold-lt);
    transform: translateY(-2px);
    box-shadow: 0 20px 60px rgba(201,168,76,.3);
  }
  .btn-submit:disabled { opacity: .55; cursor: not-allowed; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(8,12,16,.3); border-top-color: var(--obsidian);
    border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Divider ── */
  .or-divider {
    display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
  }
  .or-line { flex: 1; height: 1px; background: rgba(180,194,212,.1); }
  .or-text { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--mist); opacity: .4; }

  /* ── Signup link ── */
  .signup-prompt { text-align: center; font-size: 13px; color: var(--mist); opacity: .6; }
  .signup-prompt a {
    color: var(--gold); text-decoration: none; opacity: 1;
    border-bottom: 1px solid rgba(201,168,76,.3); transition: border-color .3s;
  }
  .signup-prompt a:hover { border-color: var(--gold); }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    nav { padding: 24px; }
    .left-panel { display: none; }
    .right-panel { padding: 100px 28px 60px; }
    .form-wrap { max-width: 100%; }
  }
`

/* ─── Icons ─────────────────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function Login() {
  const supabase = createClient()
  const router   = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [message,  setMessage]  = useState<{ type: 'err' | 'ok'; text: string } | null>(null)
  const [shake,    setShake]    = useState(false)
  const [animated, setAnimated] = useState(false)

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
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setHovered(!!t.closest('a,button,input'))
    }
    window.addEventListener('mouseover', over)
    return () => window.removeEventListener('mouseover', over)
  }, [])

  useEffect(() => { const t = setTimeout(() => setAnimated(true), 80); return () => clearTimeout(t) }, [])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  const handleLogin = async () => {
    setMessage(null)
    if (!email || !password) {
      setMessage({ type: 'err', text: 'Please enter your email and password.' })
      triggerShake()
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setMessage({ type: 'err', text: error.message })
      triggerShake()
      return
    }

    if (!data.session) {
      setLoading(false)
      setMessage({ type: 'err', text: 'Email not confirmed yet — please check your inbox.' })
      triggerShake()
      return
    }

    setMessage({ type: 'ok', text: 'Welcome back! Redirecting…' })
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Cursor */}
      <div
        className={`cursor${hovered ? ' hovered' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px,${cursorPos.y}px)` }}
      >
        <div className="cursor-ring" />
        <div className="cursor-dot" />
      </div>

      {/* Nav */}
      <nav>
        <Link href="/" className="nav-logo">Fairway</Link>
        <Link href="/" className="nav-back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </Link>
      </nav>

      <div className="login-page">

        {/* ── Left Branding Panel ── */}
        <div className={`left-panel${animated ? ' in' : ''}`}>
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="left-inner">
            <div className="left-eyebrow">Welcome Back</div>
            <h2 className="left-title">
              Good to see<br/>you <em>again.</em>
            </h2>
            <div className="gold-divider" />
            <p className="left-body">
              Your scores are waiting. Jump back into your dashboard, check this month's draw, and see how your charity contributions are making an impact.
            </p>

            {/* Testimonial card */}
            <div className="stat-card">
              <p className="stat-quote">
                I've won twice in three months. And knowing a portion goes to charity makes every round feel meaningful.
              </p>
              <div className="stat-author">
                <div className="stat-avatar">J</div>
                <div>
                  <div className="stat-name">James Whitfield</div>
                  <div className="stat-role">Subscriber · 8 handicap</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className={`right-panel${animated ? ' in' : ''}`}>
          <div className="form-wrap">

            <div className="form-header">
              <div className="form-eyebrow">Sign In</div>
              <h1 className="form-title">Welcome<br/><em>back.</em></h1>
              <p className="form-subtitle">Enter your credentials to access your dashboard.</p>
            </div>

            {/* Message banner */}
            {message && (
              <div className={`form-msg ${message.type}`}>
                {message.type === 'ok' ? <IconCheck /> : <IconX />}
                {message.text}
              </div>
            )}

            {/* Email */}
            <div className="field">
              <label className="field-label">Email Address</label>
              <div className="field-input-wrap">
                <input
                  className={`field-input${shake ? ' shake' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="email"
                />
                <div className="field-bar" />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-row">
                <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>
              <div className="field-input-wrap" style={{ marginTop: '10px' }}>
                <input
                  className={`field-input${shake ? ' shake' : ''}`}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  autoComplete="current-password"
                  style={{ paddingRight: '48px' }}
                />
                <div className="field-bar" />
                <button
                  className="pwd-toggle"
                  onClick={() => setShowPwd(p => !p)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPwd ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn-submit"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading
                ? <><div className="spinner" /> Signing In…</>
                : <>Sign In <IconArrow /></>
              }
            </button>

            <div className="or-divider">
              <div className="or-line" /><span className="or-text">or</span><div className="or-line" />
            </div>

            <div className="signup-prompt">
              Don't have an account?{' '}
              <Link href="/signup">Create one</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}