'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const CSS = `
  .sub-status-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
  }
  .sub-status-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  }
  .sub-status-dot.active   { background: #6DBF8A; box-shadow: 0 0 8px rgba(109,191,138,.5); }
  .sub-status-dot.inactive { background: #B4C2D4; opacity: .4; }
  .sub-status-dot.cancelled { background: #E07070; }
  .sub-status-text { font-size: 12px; letter-spacing: .25em; text-transform: uppercase; color: #B4C2D4; opacity: .6; }
  .sub-status-text b { color: #F5F0E8; opacity: 1; font-weight: 400; }

  .sub-plan-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; margin-bottom: 24px;
    border: 1px solid rgba(201,168,76,.2); border-radius: 3px;
    background: rgba(201,168,76,.05);
  }
  .sub-plan-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #B4C2D4; opacity: .5; margin-bottom: 6px; }
  .sub-plan-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 24px; font-weight: 300; color: #F5F0E8;
    text-transform: capitalize; font-style: italic;
  }
  .sub-plan-badge {
    font-size: 9px; letter-spacing: .3em; text-transform: uppercase;
    color: #6DBF8A; border: 1px solid rgba(109,191,138,.3);
    border-radius: 2px; padding: 4px 10px;
  }

  .sub-plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 0; }
  .sub-plan-option {
    border: 1px solid rgba(180,194,212,.1); border-radius: 3px;
    padding: 24px; background: rgba(26,35,50,.3);
    cursor: none; transition: border-color .3s, background .3s;
    position: relative; overflow: hidden;
  }
  .sub-plan-option:hover { border-color: rgba(201,168,76,.3); background: rgba(26,35,50,.6); }
  .sub-plan-option::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #C9A84C, transparent);
    opacity: 0; transition: opacity .3s;
  }
  .sub-plan-option:hover::before { opacity: .6; }
  .sub-plan-option.featured { border-color: rgba(201,168,76,.25); background: rgba(201,168,76,.05); }
  .sub-plan-option.featured::before { opacity: .4; }

  .sub-option-label { font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: #B4C2D4; opacity: .5; margin-bottom: 10px; }
  .sub-option-price {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 36px; font-weight: 300; color: #F5F0E8; line-height: 1; margin-bottom: 4px;
  }
  .sub-option-price em { font-style: italic; color: #C9A84C; }
  .sub-option-period { font-size: 11px; color: #B4C2D4; opacity: .4; margin-bottom: 20px; }
  .sub-option-saving {
    font-size: 10px; letter-spacing: .15em; text-transform: uppercase;
    color: #6DBF8A; margin-bottom: 20px;
  }
  .sub-option-btn {
    width: 100%; padding: 12px;
    background: #C9A84C; color: #080C10;
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 500;
    letter-spacing: .25em; text-transform: uppercase;
    border: none; border-radius: 3px; cursor: none;
    transition: background .3s, transform .3s;
  }
  .sub-option-btn:hover { background: #E8C97A; transform: translateY(-1px); }
  .sub-option-btn.outline {
    background: transparent; color: #C9A84C;
    border: 1px solid rgba(201,168,76,.4);
  }
  .sub-option-btn.outline:hover { background: rgba(201,168,76,.08); transform: translateY(-1px); }

  .sub-cancel-btn {
    padding: 12px 24px; margin-top: 20px;
    background: transparent; color: #E07070;
    font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 400;
    letter-spacing: .25em; text-transform: uppercase;
    border: 1px solid rgba(224,112,112,.25); border-radius: 3px; cursor: none;
    transition: border-color .3s, background .3s;
  }
  .sub-cancel-btn:hover { border-color: rgba(224,112,112,.5); background: rgba(224,112,112,.06); }
`

export default function SubscriptionSection() {
  const supabase = createClient()
  const [status, setStatus] = useState<string>('inactive')
  const [plan, setPlan]     = useState<string | null>(null)

  const fetchSubscription = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const { data } = await supabase
      .from('subscriptions').select('*').eq('user_id', user.id).single()
    if (data) { setStatus(data.status); setPlan(data.plan) }
    else { setStatus('inactive'); setPlan(null) }
  }

  useEffect(() => { fetchSubscription() }, [])

  const subscribe = async (p: 'monthly' | 'yearly') => {
    try {
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: p }),
      })
      const data = await res.json()
      if (!data.url) { alert('Stripe error'); return }
      window.location.href = data.url
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    }
  }

  const cancelSubscription = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    const { error } = await supabase
      .from('subscriptions').update({ status: 'cancelled' }).eq('user_id', user.id)
    if (error) { alert(error.message); return }
    fetchSubscription()
  }

  const dotClass = status === 'active' ? 'active' : status === 'cancelled' ? 'cancelled' : 'inactive'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="sub-status-row">
        <div className={`sub-status-dot ${dotClass}`} />
        <div className="sub-status-text">
          Status — <b>{status.charAt(0).toUpperCase() + status.slice(1)}</b>
        </div>
      </div>

      {status === 'active' ? (
        <>
          <div className="sub-plan-card">
            <div>
              <div className="sub-plan-label">Current Plan</div>
              <div className="sub-plan-name">{plan}</div>
            </div>
            <div className="sub-plan-badge">Active</div>
          </div>
          <button className="sub-cancel-btn" onClick={cancelSubscription}>
            Cancel Subscription
          </button>
        </>
      ) : (
        <div className="sub-plans-grid">
          <div className="sub-plan-option">
            <div className="sub-option-label">Monthly</div>
            <div className="sub-option-price">£<em>9</em></div>
            <div className="sub-option-period">per month</div>
            <button className="sub-option-btn outline" onClick={() => subscribe('monthly')}>
              Choose Monthly
            </button>
          </div>

          <div className="sub-plan-option featured">
            <div className="sub-option-label">Yearly</div>
            <div className="sub-option-price">£<em>79</em></div>
            <div className="sub-option-period">per year</div>
            <div className="sub-option-saving">Save ~27%</div>
            <button className="sub-option-btn" onClick={() => subscribe('yearly')}>
              Choose Yearly
            </button>
          </div>
        </div>
      )}
    </>
  )
}