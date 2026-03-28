'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const CSS = `
  .score-input-row {
    display: flex; gap: 12px; align-items: center; margin-bottom: 32px;
  }
  .score-input {
    flex: 1; padding: 14px 18px;
    background: rgba(26,35,50,.5);
    border: 1px solid rgba(180,194,212,.12);
    border-radius: 3px;
    color: #F5F0E8; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300;
    outline: none; transition: border-color .3s, background .3s, box-shadow .3s;
  }
  .score-input::placeholder { color: #B4C2D4; opacity: .35; }
  .score-input:focus {
    border-color: rgba(201,168,76,.5);
    background: rgba(26,35,50,.8);
    box-shadow: 0 0 0 3px rgba(201,168,76,.06);
  }
  .score-btn {
    padding: 14px 28px;
    background: #C9A84C; color: #080C10;
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500;
    letter-spacing: .3em; text-transform: uppercase;
    border: none; border-radius: 3px; cursor: none;
    transition: background .3s, transform .3s, box-shadow .3s;
    white-space: nowrap;
    position: relative; overflow: hidden;
  }
  .score-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.2), transparent 70%);
    transform: translateX(-100%); transition: transform .5s ease;
  }
  .score-btn:hover::before { transform: translateX(100%); }
  .score-btn:hover { background: #E8C97A; transform: translateY(-1px); box-shadow: 0 12px 40px rgba(201,168,76,.25); }

  .score-list-label {
    font-size: 10px; letter-spacing: .35em; text-transform: uppercase;
    color: #B4C2D4; opacity: .5; margin-bottom: 16px;
  }
  .score-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .score-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border: 1px solid rgba(180,194,212,.07);
    border-radius: 3px;
    background: rgba(26,35,50,.3);
    transition: border-color .3s, background .3s;
  }
  .score-item:hover { border-color: rgba(201,168,76,.2); background: rgba(26,35,50,.55); }
  .score-item-num {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 300; color: #F5F0E8;
  }
  .score-item-num em { font-style: italic; color: #C9A84C; }
  .score-item-date { font-size: 11px; color: #B4C2D4; opacity: .4; letter-spacing: .05em; }
  .score-empty { font-size: 13px; color: #B4C2D4; opacity: .4; text-align: center; padding: 24px 0; }
`

export default function ScoreSection() {
  const supabase = createClient()
  const [score, setScore]   = useState('')
  const [scores, setScores] = useState<any[]>([])

  const fetchScores = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setScores(data)
  }

  useEffect(() => { fetchScores() }, [])

  const addScore = async () => {
    const value = Number(score)
    if (!value || value < 1 || value > 45) {
      alert('Enter valid score (1–45)')
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const { error } = await supabase.from('scores').insert({ user_id: user.id, score: value })
    if (error) { alert(error.message); return }
    setScore('')
    fetchScores()
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="score-input-row">
        <input
          className="score-input"
          value={score}
          onChange={e => setScore(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addScore()}
          placeholder="Enter score (1–45)"
          type="number"
          min={1} max={45}
        />
        <button className="score-btn" onClick={addScore}>Add</button>
      </div>

      <div className="score-list-label">Last 5 Scores</div>

      {scores.length === 0 ? (
        <div className="score-empty">No scores recorded yet.</div>
      ) : (
        <ul className="score-list">
          {scores.map(s => (
            <li key={s.id} className="score-item">
              <span className="score-item-num"><em>{s.score}</em></span>
              <span className="score-item-date">{formatDate(s.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}