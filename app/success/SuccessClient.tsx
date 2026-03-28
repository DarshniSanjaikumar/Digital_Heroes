'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SuccessClient() {
  const supabase = createClient()
  const params = useSearchParams()
  const router = useRouter()

  const plan = params.get('plan')

  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const saveSubscription = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user || !plan) {
        setLoading(false)
        return
      }

      const now = new Date()

      const expiry =
        plan === 'monthly'
          ? new Date(now.setMonth(now.getMonth() + 1))
          : new Date(now.setFullYear(now.getFullYear() + 1))

      const { data: existing, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (fetchError) {
        console.error(fetchError)
        alert('Error fetching subscription')
        setLoading(false)
        return
      }

      if (existing) {
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            expires_at: expiry,
          })
          .eq('user_id', user.id)

        if (error) {
          console.error(error)
          alert('Error updating subscription')
          setLoading(false)
          return
        }
      } else {
        const { error } = await supabase.from('subscriptions').insert({
          user_id: user.id,
          plan,
          status: 'active',
          expires_at: expiry,
        })

        if (error) {
          console.error(error)
          alert('Error saving subscription')
          setLoading(false)
          return
        }
      }

      setLoading(false)
    }

    saveSubscription()
  }, [plan, supabase])

  useEffect(() => {
    if (loading) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [loading, router])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: 'white',
      }}
    >
      <div
        style={{
          padding: '40px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          width: '360px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        {loading ? (
          <>
            <h2>Processing Payment...</h2>
            <p style={{ marginTop: '10px', opacity: 0.7 }}>
              Please wait while we confirm your subscription.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
              🎉 Payment Successful!
            </h1>

            <p style={{ marginBottom: '15px', opacity: 0.8 }}>
              Your <b>{plan}</b> plan is now active.
            </p>

            <p style={{ fontSize: '14px', opacity: 0.6 }}>
              Redirecting in {countdown}s...
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}