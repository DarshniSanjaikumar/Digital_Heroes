'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

/* ─── CSS injected once ──────────────────────────────────────────── */
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
    --ff-head:  'Cormorant Garamond', Georgia, serif;
    --ff-body:  'DM Sans', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--obsidian);
    color: var(--white);
    font-family: var(--ff-body);
    font-weight: 300;
    overflow-x: hidden;
    cursor: none;
  }

  /* ── Custom cursor ── */
  .cursor {
    position: fixed; top: 0; left: 0; z-index: 9999;
    pointer-events: none;
  }
  .cursor-ring {
    width: 36px; height: 36px;
    border: 1.5px solid var(--gold);
    border-radius: 50%;
    position: absolute;
    transform: translate(-50%,-50%);
    transition: width .25s, height .25s, border-color .25s, opacity .25s;
    opacity: .7;
  }
  .cursor-dot {
    width: 6px; height: 6px;
    background: var(--gold);
    border-radius: 50%;
    position: absolute;
    transform: translate(-50%,-50%);
  }
  .cursor.hovered .cursor-ring { width: 56px; height: 56px; border-color: var(--gold-lt); opacity: 1; }

  /* ── Loader ── */
  .loader {
    position: fixed; inset: 0; z-index: 9000;
    background: var(--obsidian);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 28px;
    transition: opacity .7s ease, visibility .7s ease;
  }
  .loader.done { opacity: 0; visibility: hidden; }
  .loader-logo {
    font-family: var(--ff-head);
    font-size: clamp(28px, 5vw, 48px);
    font-weight: 300;
    letter-spacing: .25em;
    color: var(--gold);
    animation: fadePulse 1.4s ease infinite;
  }
  .loader-bar {
    width: 180px; height: 1px;
    background: var(--slate);
    overflow: hidden;
  }
  .loader-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold-dk), var(--gold), var(--gold-lt));
    animation: loadFill 1.8s cubic-bezier(.4,0,.2,1) forwards;
  }
  .loader-text {
    font-size: 11px;
    letter-spacing: .3em;
    text-transform: uppercase;
    color: var(--mist);
    opacity: .6;
    animation: fadePulse 1.4s ease infinite;
  }
  @keyframes loadFill { from { width: 0 } to { width: 100% } }
  @keyframes fadePulse { 0%,100%{ opacity:.5 } 50%{ opacity:1 } }

  /* ── Nav ── */
  nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 60px;
    background: linear-gradient(to bottom, rgba(8,12,16,.95), transparent);
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity .8s .3s ease, transform .8s .3s ease;
  }
  nav.visible { opacity: 1; transform: translateY(0); }
  .nav-logo {
    font-family: var(--ff-head);
    font-size: 22px;
    font-weight: 400;
    letter-spacing: .15em;
    color: var(--gold);
    text-decoration: none;
  }
  .nav-links { display: flex; gap: 40px; align-items: center; }
  .nav-links a {
    text-decoration: none;
    font-size: 12px;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: var(--mist);
    transition: color .3s;
  }
  .nav-links a:hover { color: var(--white); }
  .nav-cta {
    padding: 10px 28px;
    border: 1px solid var(--gold);
    border-radius: 2px;
    color: var(--gold) !important;
    transition: background .3s, color .3s !important;
  }
  .nav-cta:hover { background: var(--gold) !important; color: var(--obsidian) !important; }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 120px 40px 80px;
  }

  /* Animated background orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    opacity: .18;
    animation: drift 20s ease-in-out infinite;
  }
  .orb-1 { width: 600px; height: 600px; background: var(--gold-dk); top: -100px; right: -100px; animation-duration: 18s; }
  .orb-2 { width: 400px; height: 400px; background: #1A4A6B; bottom: 50px; left: -80px; animation-duration: 24s; animation-delay: -8s; }
  .orb-3 { width: 300px; height: 300px; background: var(--gold); top: 40%; left: 40%; animation-duration: 15s; animation-delay: -4s; opacity: .08; }
  @keyframes drift {
    0%,100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-20px) scale(1.05); }
    66% { transform: translate(-20px,30px) scale(.97); }
  }

  /* Grid overlay */
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(201,168,76,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,.04) 1px, transparent 1px);
    background-size: 80px 80px;
    pointer-events: none;
  }

  /* Noise grain */
  .hero::after {
    content: '';
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: .4;
  }

  .hero-inner { position: relative; z-index: 1; text-align: center; max-width: 900px; }

  .hero-eyebrow {
    font-size: 11px;
    letter-spacing: .4em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 32px;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity .8s ease, transform .8s ease;
    display: flex; align-items: center; justify-content: center; gap: 16px;
  }
  .hero-eyebrow::before, .hero-eyebrow::after {
    content: ''; display: block;
    width: 40px; height: 1px; background: var(--gold); opacity: .5;
  }
  .hero-eyebrow.in { opacity: 1; transform: translateY(0); }

  .hero-title {
    font-family: var(--ff-head);
    font-size: clamp(52px, 9vw, 110px);
    font-weight: 300;
    line-height: 1.0;
    letter-spacing: -.01em;
    color: var(--white);
    margin-bottom: 8px;
    opacity: 0; transform: translateY(30px);
    transition: opacity 1s .15s ease, transform 1s .15s ease;
  }
  .hero-title.in { opacity: 1; transform: translateY(0); }
  .hero-title em {
    font-style: italic;
    color: var(--gold);
    font-weight: 300;
  }

  .hero-title-line2 {
    font-family: var(--ff-head);
    font-size: clamp(52px, 9vw, 110px);
    font-weight: 300;
    line-height: 1.0;
    letter-spacing: -.01em;
    color: var(--white);
    opacity: 0; transform: translateY(30px);
    transition: opacity 1s .3s ease, transform 1s .3s ease;
    margin-bottom: 40px;
  }
  .hero-title-line2.in { opacity: 1; transform: translateY(0); }

  .hero-sub {
    font-size: clamp(15px, 2vw, 18px);
    font-weight: 300;
    color: var(--mist);
    line-height: 1.7;
    max-width: 540px; margin: 0 auto 56px;
    opacity: 0; transform: translateY(20px);
    transition: opacity .9s .45s ease, transform .9s .45s ease;
  }
  .hero-sub.in { opacity: 1; transform: translateY(0); }

  /* Pill stats */
  .hero-stats {
    display: flex; gap: 0; justify-content: center;
    margin-bottom: 52px;
    border: 1px solid rgba(201,168,76,.2);
    border-radius: 3px; overflow: hidden;
    max-width: 580px; margin: 0 auto 52px;
    opacity: 0; transform: translateY(20px);
    transition: opacity .9s .6s ease, transform .9s .6s ease;
  }
  .hero-stats.in { opacity: 1; transform: translateY(0); }
  .stat {
    flex: 1; padding: 20px 16px;
    border-right: 1px solid rgba(201,168,76,.15);
    text-align: center;
  }
  .stat:last-child { border-right: none; }
  .stat-num {
    font-family: var(--ff-head);
    font-size: 28px; font-weight: 600;
    color: var(--gold); display: block; margin-bottom: 4px;
  }
  .stat-label {
    font-size: 10px; letter-spacing: .25em;
    text-transform: uppercase; color: var(--mist); opacity: .7;
  }

  /* CTA buttons */
  .hero-ctas {
    display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
    opacity: 0; transform: translateY(20px);
    transition: opacity .9s .75s ease, transform .9s .75s ease;
  }
  .hero-ctas.in { opacity: 1; transform: translateY(0); }

  .btn-primary {
    position: relative; overflow: hidden;
    padding: 18px 52px;
    background: var(--gold);
    color: var(--obsidian);
    font-family: var(--ff-body);
    font-size: 12px; font-weight: 500;
    letter-spacing: .25em; text-transform: uppercase;
    border: none; border-radius: 2px;
    cursor: none; text-decoration: none;
    display: inline-flex; align-items: center; gap: 10px;
    transition: background .3s, transform .3s, box-shadow .3s;
  }
  .btn-primary::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.25), transparent 70%);
    transform: translateX(-100%);
    transition: transform .6s ease;
  }
  .btn-primary:hover::before { transform: translateX(100%); }
  .btn-primary:hover {
    background: var(--gold-lt);
    transform: translateY(-2px);
    box-shadow: 0 20px 60px rgba(201,168,76,.35);
  }

  .btn-secondary {
    padding: 18px 52px;
    background: transparent;
    color: var(--white);
    font-family: var(--ff-body);
    font-size: 12px; font-weight: 400;
    letter-spacing: .25em; text-transform: uppercase;
    border: 1px solid rgba(245,240,232,.25);
    border-radius: 2px;
    cursor: none; text-decoration: none;
    transition: border-color .3s, background .3s, transform .3s;
    display: inline-flex; align-items: center; gap: 10px;
  }
  .btn-secondary:hover {
    border-color: var(--white);
    background: rgba(245,240,232,.06);
    transform: translateY(-2px);
  }

  /* Scroll indicator */
  .scroll-hint {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0; animation: scrollFade 1s 2.5s ease forwards;
  }
  .scroll-hint span { font-size: 9px; letter-spacing: .35em; text-transform: uppercase; color: var(--mist); opacity: .5; }
  .scroll-line { width: 1px; height: 50px; background: linear-gradient(var(--gold), transparent); animation: scrollLine 2s ease infinite; }
  @keyframes scrollFade { to { opacity: 1; } }
  @keyframes scrollLine { 0%{ transform: scaleY(0); transform-origin: top; } 50%{ transform: scaleY(1); transform-origin: top; } 51%{ transform: scaleY(1); transform-origin: bottom; } 100%{ transform: scaleY(0); transform-origin: bottom; } }

  /* ── How It Works ── */
  .section {
    padding: 120px 60px;
    position: relative;
  }
  .section-label {
    font-size: 10px; letter-spacing: .45em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 20px; opacity: .8;
  }
  .section-title {
    font-family: var(--ff-head);
    font-size: clamp(38px, 5vw, 64px);
    font-weight: 300; line-height: 1.1;
    margin-bottom: 60px;
    max-width: 600px;
  }
  .section-title em { font-style: italic; color: var(--gold); }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1px;
    background: rgba(201,168,76,.12);
    border: 1px solid rgba(201,168,76,.12);
  }
  .step {
    background: var(--ink);
    padding: 48px 40px;
    position: relative;
    overflow: hidden;
    transition: background .4s;
  }
  .step::before {
    content: attr(data-num);
    position: absolute; top: -20px; right: 24px;
    font-family: var(--ff-head);
    font-size: 120px; font-weight: 600;
    color: rgba(201,168,76,.06);
    line-height: 1;
    transition: color .4s;
  }
  .step:hover { background: #111820; }
  .step:hover::before { color: rgba(201,168,76,.12); }
  .step-icon { font-size: 32px; margin-bottom: 24px; display: block; }
  .step-title {
    font-family: var(--ff-head);
    font-size: 22px; font-weight: 400;
    margin-bottom: 12px; color: var(--white);
  }
  .step-desc { font-size: 14px; color: var(--mist); line-height: 1.7; opacity: .8; }

  /* ── Prize Tier ── */
  .prizes-section {
    padding: 120px 60px;
    background: linear-gradient(180deg, var(--obsidian) 0%, #0A1018 100%);
  }
  .prize-tiers {
    display: flex; gap: 20px; flex-wrap: wrap; margin-top: 60px;
  }
  .prize-card {
    flex: 1; min-width: 220px;
    border: 1px solid rgba(201,168,76,.2);
    border-radius: 4px; padding: 48px 32px;
    position: relative; overflow: hidden;
    transition: transform .4s, border-color .4s, box-shadow .4s;
    background: linear-gradient(145deg, rgba(201,168,76,.03), transparent);
  }
  .prize-card.jackpot {
    border-color: var(--gold);
    background: linear-gradient(145deg, rgba(201,168,76,.1), rgba(201,168,76,.02));
  }
  .prize-card:hover {
    transform: translateY(-6px);
    border-color: var(--gold);
    box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 40px rgba(201,168,76,.12);
  }
  .prize-match {
    font-family: var(--ff-head);
    font-size: 16px; letter-spacing: .1em;
    color: var(--mist); margin-bottom: 16px;
  }
  .prize-pct {
    font-family: var(--ff-head);
    font-size: 72px; font-weight: 300; line-height: 1;
    color: var(--gold); margin-bottom: 4px;
  }
  .prize-pct span { font-size: 32px; }
  .prize-label { font-size: 11px; letter-spacing: .25em; text-transform: uppercase; color: var(--mist); opacity: .6; margin-bottom: 24px; }
  .prize-tag {
    display: inline-block; font-size: 10px; letter-spacing: .2em;
    text-transform: uppercase; padding: 6px 14px;
    border: 1px solid rgba(201,168,76,.3); border-radius: 2px; color: var(--gold);
  }
  .jackpot-badge {
    position: absolute; top: 20px; right: 20px;
    background: var(--gold); color: var(--obsidian);
    font-size: 9px; letter-spacing: .2em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 2px; font-weight: 500;
  }

  /* ── Charity ── */
  .charity-section {
    padding: 120px 60px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
  }
  .charity-visual {
    position: relative; aspect-ratio: 1;
    max-width: 480px;
  }
  .charity-ring {
    position: absolute; inset: 0;
    border-radius: 50%; border: 1px solid rgba(201,168,76,.2);
    animation: spinSlow 30s linear infinite;
  }
  .charity-ring-2 {
    position: absolute; inset: 15%;
    border-radius: 50%; border: 1px dashed rgba(201,168,76,.15);
    animation: spinSlow 20s linear infinite reverse;
  }
  .charity-center {
    position: absolute; inset: 20%;
    background: radial-gradient(circle at 30% 30%, rgba(201,168,76,.15), rgba(201,168,76,.03));
    border-radius: 50%; border: 1px solid rgba(201,168,76,.3);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  }
  .charity-pct-big {
    font-family: var(--ff-head);
    font-size: 72px; font-weight: 300; color: var(--gold); line-height: 1;
  }
  .charity-pct-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--mist); opacity: .7; }
  .charity-dot {
    position: absolute; width: 8px; height: 8px;
    background: var(--gold); border-radius: 50%;
    top: 0; left: 50%; transform: translateX(-50%);
    box-shadow: 0 0 12px var(--gold);
  }
  @keyframes spinSlow { to { transform: rotate(360deg); } }
  .charity-text .section-title { font-size: clamp(34px, 4vw, 54px); }
  .charity-body { font-size: 15px; color: var(--mist); line-height: 1.8; opacity: .85; margin-bottom: 32px; }

  /* ── Footer ── */
  footer {
    border-top: 1px solid rgba(201,168,76,.12);
    padding: 48px 60px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
  }
  .footer-logo {
    font-family: var(--ff-head); font-size: 20px;
    font-weight: 400; letter-spacing: .15em; color: var(--gold);
  }
  .footer-note { font-size: 12px; color: var(--mist); opacity: .4; letter-spacing: .05em; }

  /* ── Divider ── */
  .gold-divider {
    width: 60px; height: 1px; background: var(--gold); opacity: .5; margin: 24px 0;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    nav { padding: 24px 24px; }
    .nav-links { display: none; }
    .section, .prizes-section { padding: 80px 24px; }
    .charity-section { grid-template-columns: 1fr; padding: 80px 24px; gap: 60px; }
    .charity-visual { max-width: 320px; margin: 0 auto; }
    footer { padding: 40px 24px; }
  }
`

/* ─── Icon SVGs ─────────────────────────────────────────────────── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ─── Component ─────────────────────────────────────────────────── */
export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const [animated, setAnimated] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const animFrame = useRef<number>()
  const cx = useRef(0); const cy = useRef(0)
  const tx = useRef(0); const ty = useRef(0)

  /* Smooth cursor tracking */
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

  /* Hover detection for interactive elements */
  useEffect(() => {
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setHovered(!!t.closest('a,button,.step,.prize-card'))
    }
    window.addEventListener('mouseover', over)
    return () => window.removeEventListener('mouseover', over)
  }, [])

  /* Loading sequence */
  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 2000)
    const t2 = setTimeout(() => setAnimated(true), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const cls = (base: string) => animated ? `${base} in` : base

  return (
    <>
      {/* Inject global CSS */}
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className={`cursor${hovered ? ' hovered' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px,${cursorPos.y}px)` }}
      >
        <div className="cursor-ring" />
        <div className="cursor-dot" />
      </div>

      {/* Loader */}
      <div className={`loader${loaded ? ' done' : ''}`}>
        <div className="loader-logo">FAIRWAY</div>
        <div className="loader-bar"><div className="loader-fill" /></div>
        <div className="loader-text">Preparing your experience</div>
      </div>

      {/* Nav */}
      <nav className={animated ? 'visible' : ''}>
        <span className="nav-logo">Fairway</span>
        <div className="nav-links">
          <a href="#how">How It Works</a>
          <a href="#prizes">Prizes</a>
          <a href="#charity">Charity</a>
          <Link href="/signup" className="nav-cta">Subscribe</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-inner">
          <div className={cls('hero-eyebrow')}>Golf · Community · Impact</div>

          <h1 className={cls('hero-title')}>
            Play with <em>Purpose.</em>
          </h1>
          <div className={cls('hero-title-line2')}>
            Win with <em>Heart.</em>
          </div>

          <p className={cls('hero-sub')}>
            Enter your Stableford scores, join monthly prize draws, and direct real money to causes that matter.
            Golf as it should be — generous by design.
          </p>

          <div className={cls('hero-stats')}>
            <div className="stat">
              <span className="stat-num">10%+</span>
              <span className="stat-label">To Charity</span>
            </div>
            <div className="stat">
              <span className="stat-num">Monthly</span>
              <span className="stat-label">Prize Draws</span>
            </div>
            <div className="stat">
              <span className="stat-num">5</span>
              <span className="stat-label">Scores Tracked</span>
            </div>
            <div className="stat">
              <span className="stat-num">40%</span>
              <span className="stat-label">Jackpot Pool</span>
            </div>
          </div>

          <div className={cls('hero-ctas')}>
            <Link href="/signup" className="btn-primary">
              Start Giving Back <IconArrow />
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign In <IconArrow />
            </Link>
          </div>
        </div>

        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="section" id="how">
        <div className="section-label">The Experience</div>
        <h2 className="section-title">
          Simple to play.<br/><em>Meaningful</em> to win.
        </h2>
        <div className="steps-grid">
          {[
            { num: '01', icon: '◉', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. A portion of every subscription feeds the prize pool and goes directly to charity.' },
            { num: '02', icon: '◎', title: 'Track Scores', desc: 'Enter your last 5 Stableford scores. The system auto-rotates — your newest round always counts.' },
            { num: '03', icon: '◈', title: 'Enter Draws', desc: 'Your scores become your lottery numbers. Match 3, 4, or all 5 to claim tiered cash prizes.' },
            { num: '04', icon: '♡', title: 'Give Back', desc: 'Select a charity at signup. Increase your giving anytime. Track your total impact from your dashboard.' },
          ].map(s => (
            <div key={s.num} className="step" data-num={s.num}>
              <span className="step-icon">{s.icon}</span>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Prize Tiers ──────────────────────────────────── */}
      <section className="prizes-section" id="prizes">
        <div className="section-label">Prize Structure</div>
        <h2 className="section-title">
          Three ways<br/>to <em>win</em>.
        </h2>
        <div className="prize-tiers">
          <div className="prize-card jackpot">
            <div className="jackpot-badge">Jackpot</div>
            <div className="prize-match">5-Number Match</div>
            <div className="prize-pct">40<span>%</span></div>
            <div className="prize-label">of total prize pool</div>
            <div className="prize-tag">Rolls over if unclaimed</div>
          </div>
          <div className="prize-card">
            <div className="prize-match">4-Number Match</div>
            <div className="prize-pct">35<span>%</span></div>
            <div className="prize-label">of total prize pool</div>
            <div className="prize-tag">Split equally</div>
          </div>
          <div className="prize-card">
            <div className="prize-match">3-Number Match</div>
            <div className="prize-pct">25<span>%</span></div>
            <div className="prize-label">of total prize pool</div>
            <div className="prize-tag">Split equally</div>
          </div>
        </div>
      </section>

      {/* ── Charity ──────────────────────────────────────── */}
      <section className="charity-section" id="charity">
        <div className="charity-visual">
          <div className="charity-ring">
            <div className="charity-dot" />
          </div>
          <div className="charity-ring-2" />
          <div className="charity-center">
            <div className="charity-pct-big">10%</div>
            <div className="charity-pct-label">Minimum donation</div>
          </div>
        </div>
        <div className="charity-text">
          <div className="section-label">Charitable Impact</div>
          <h2 className="section-title">
            Golf that<br/><em>gives</em>.
          </h2>
          <div className="gold-divider" />
          <p className="charity-body">
            At signup, you choose the cause your subscription supports. A minimum of 10% of every payment goes directly to your selected charity — and you can always give more. Browse upcoming charity golf days, discover new causes, and track your cumulative impact from your personal dashboard.
          </p>
          <Link href="/signup" className="btn-primary" style={{ display: 'inline-flex' }}>
            Choose Your Cause <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer>
        <div className="footer-logo">Fairway</div>
        <div className="footer-note">© 2026 · Golf Charity Platform · All rights reserved</div>
      </footer>
    </>
  )
}