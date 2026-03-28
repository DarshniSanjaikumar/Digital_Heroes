'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const CSS = `
  .logout-btn {
    font-family: 'DM Sans', sans-serif;
    font-size: 11px; letter-spacing: .25em; text-transform: uppercase;
    color: #B4C2D4; background: none;
    border: 1px solid rgba(180,194,212,.15);
    border-radius: 3px; padding: 10px 22px;
    cursor: none; transition: border-color .3s, color .3s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .logout-btn:hover { border-color: #C9A84C; color: #C9A84C; }
`

const IconLogout = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function LogoutButton() {
  const supabase = createClient()
  const router   = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button className="logout-btn" onClick={handleLogout}>
        <IconLogout /> Sign Out
      </button>
    </>
  )
}