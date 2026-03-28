'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const CSS = `
  .draw-btn {
    padding: 16px 36px;
    background: #C9A84C; color: #080C10;
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500;
    letter-spacing: .3em; text-transform: uppercase;
    border: none; border-radius: 3px; cursor: none;
    transition: background .3s, transform .3s, box-shadow .3s;
    position: relative; overflow: hidden;
  }
  .draw-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.2), transparent 70%);
    transform: translateX(-100%); transition: transform .5s ease;
  }
  .draw-btn:hover::before { transform: translateX(100%); }
  .draw-btn:hover { background: #E8C97A; transform: translateY(-1px); box-shadow: 0 12px 40px rgba(201,168,76,.25); }

  .draw-empty {
    font-size: 13px; color: #B4C2D4; opacity: .5; line-height: 1.7;
    margin-bottom: 24px;
  }

  .draw-numbers-label {
    font-size: 10px; letter-spacing: .35em; text-transform: uppercase;
    color: #B4C2D4; opacity: .5; margin-bottom: 16px;
  }
  .draw-numbers {
    display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 28px;
  }
  .draw-ball {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(201,168,76,.25);
    background: rgba(201,168,76,.06);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 22px; font-weight: 300; color: #F5F0E8;
    transition: border-color .3s, background .3s;
  }
  .draw-ball.matched {
    border-color: #C9A84C;
    background: rgba(201,168,76,.18);
    color: #C9A84C;
  }

  .draw-stats { display: flex; gap: 24px; flex-wrap: wrap; }
  .draw-stat-box {
    border: 1px solid rgba(180,194,212,.08); border-radius: 3px;
    padding: 16px 24px; background: rgba(26,35,50,.3);
    min-width: 120px;
  }
  .draw-stat-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #B4C2D4; opacity: .45; margin-bottom: 8px; }
  .draw-stat-value {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 32px; font-weight: 300; color: #F5F0E8; line-height: 1;
  }
  .draw-stat-value em { font-style: italic; color: #C9A84C; }

  .draw-loading { font-size: 13px; color: #B4C2D4; opacity: .4; }
`

export default function DrawSection() {
  const supabase = createClient()
  const [existingDraw, setExistingDraw] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const parseArray = (value: any): number[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
      } catch { return [] }
    }
    return []
  }

  const fetchDraw = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const { data } = await supabase
      .from('draws').select('*').eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString()).maybeSingle()
    if (data) setExistingDraw(data)
    setLoading(false)
  }

  useEffect(() => { if (mounted) fetchDraw() }, [mounted])

  const runDraw = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const { data: existing } = await supabase
      .from('draws').select('*').eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString()).maybeSingle()
    if (existing) { alert('Already participated this month'); return }
    let drawNumbers: number[] = []
    while (drawNumbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1
      if (!drawNumbers.includes(n)) drawNumbers.push(n)
    }
    const { data: scores } = await supabase.from('scores').select('score').eq('user_id', user.id)
    if (!scores || scores.length === 0) { alert('Add scores first'); return }
    const userScores = scores.map(s => s.score)
    const matched = drawNumbers.filter(n => userScores.includes(n))
    const { error } = await supabase.from('draws').insert({
      user_id: user.id, result: drawNumbers, matches: matched.length, matched_numbers: matched,
    })
    if (error) { alert(error.message); return }
    fetchDraw()
  }

  if (!mounted) return null

  const resultNums  = existingDraw ? parseArray(existingDraw.result) : []
  const matchedNums = existingDraw ? parseArray(existingDraw.matched_numbers) : []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {loading ? (
        <div className="draw-loading">Loading…</div>
      ) : existingDraw ? (
        <>
          <div className="draw-numbers-label">This Month's Numbers</div>
          <div className="draw-numbers">
            {resultNums.map(n => (
              <div key={n} className={`draw-ball${matchedNums.includes(n) ? ' matched' : ''}`}>
                {n}
              </div>
            ))}
          </div>
          <div className="draw-stats">
            <div className="draw-stat-box">
              <div className="draw-stat-label">Matches</div>
              <div className="draw-stat-value"><em>{existingDraw.matches}</em></div>
            </div>
            {matchedNums.length > 0 && (
              <div className="draw-stat-box">
                <div className="draw-stat-label">Matched</div>
                <div className="draw-stat-value" style={{ fontSize: 18, paddingTop: 6 }}>
                  {matchedNums.join(', ')}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="draw-empty">
            Your draw for this month hasn't been run yet.<br/>
            Enter your scores, then run the draw below.
          </p>
          <button className="draw-btn" onClick={runDraw}>Run Draw</button>
        </>
      )}
    </>
  )
}