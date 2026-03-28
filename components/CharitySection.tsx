'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const CSS = `
  .charity-select-wrap { position: relative; margin-bottom: 20px; }
  .charity-select {
    width: 100%; padding: 14px 40px 14px 18px;
    background: rgba(26,35,50,.5);
    border: 1px solid rgba(180,194,212,.12);
    border-radius: 3px;
    color: #F5F0E8; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 300;
    outline: none; appearance: none; cursor: none;
    transition: border-color .3s, background .3s, box-shadow .3s;
  }
  .charity-select:focus {
    border-color: rgba(201,168,76,.5);
    background: rgba(26,35,50,.8);
    box-shadow: 0 0 0 3px rgba(201,168,76,.06);
  }
  .charity-select option { background: #0D1117; color: #F5F0E8; }
  .charity-select-arrow {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    pointer-events: none; color: #B4C2D4; opacity: .5;
  }

  .charity-save-btn {
    padding: 14px 32px;
    background: #C9A84C; color: #080C10;
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500;
    letter-spacing: .3em; text-transform: uppercase;
    border: none; border-radius: 3px; cursor: none;
    transition: background .3s, transform .3s, box-shadow .3s;
    position: relative; overflow: hidden;
  }
  .charity-save-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.2), transparent 70%);
    transform: translateX(-100%); transition: transform .5s ease;
  }
  .charity-save-btn:hover::before { transform: translateX(100%); }
  .charity-save-btn:hover { background: #E8C97A; transform: translateY(-1px); box-shadow: 0 12px 40px rgba(201,168,76,.25); }

  .charity-saved-card {
    display: flex; align-items: center; gap: 16px;
    margin-top: 24px; padding: 18px 24px;
    border: 1px solid rgba(201,168,76,.2);
    border-radius: 3px; background: rgba(201,168,76,.05);
  }
  .charity-saved-icon {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #8B6914, #C9A84C);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .charity-saved-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #B4C2D4; opacity: .5; margin-bottom: 4px; }
  .charity-saved-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 20px; font-weight: 300; color: #F5F0E8;
    font-style: italic;
  }
  .charity-percentage {
    margin-left: auto; text-align: right;
  }
  .charity-pct-value {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px; font-weight: 300; color: #C9A84C;
  }
  .charity-pct-label { font-size: 10px; letter-spacing: .2em; color: #B4C2D4; opacity: .45; }
`

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#080C10" stroke="none">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

export default function CharitySection() {
  const supabase = createClient()
  const [charities, setCharities]   = useState<any[]>([])
  const [selected, setSelected]     = useState('')
  const [savedCharity, setSavedCharity] = useState<string | null>(null)

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*')
    if (data) setCharities(data)
  }

  const fetchUserCharity = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const { data } = await supabase
      .from('user_charities')
      .select('charity_id, charities (name)')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setSavedCharity((data.charities as any).name)
      setSelected(data.charity_id)
    }
  }

  useEffect(() => {
    fetchCharities()
    fetchUserCharity()
  }, [])

  const saveCharity = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user || !selected) { alert('Select a charity'); return }
    const { error } = await supabase
      .from('user_charities')
      .upsert({ user_id: user.id, charity_id: selected, percentage: 10 }, { onConflict: 'user_id' })
    if (error) { alert(error.message); return }
    await fetchUserCharity()
    alert('Saved successfully ✅')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="charity-select-wrap">
        <select
          className="charity-select"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          <option value="">Choose a charity</option>
          {charities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="charity-select-arrow">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <button className="charity-save-btn" onClick={saveCharity}>Save Charity</button>

      {savedCharity && (
        <div className="charity-saved-card">
          <div className="charity-saved-icon"><HeartIcon /></div>
          <div>
            <div className="charity-saved-label">Currently Supporting</div>
            <div className="charity-saved-name">{savedCharity}</div>
          </div>
          <div className="charity-percentage">
            <div className="charity-pct-value">10%</div>
            <div className="charity-pct-label">of winnings</div>
          </div>
        </div>
      )}
    </>
  )
}