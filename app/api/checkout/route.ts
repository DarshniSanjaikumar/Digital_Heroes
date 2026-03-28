import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()

    // 🔥 YOUR PRICE IDS
    const priceId =
      plan === 'monthly'
        ? 'price_1TFshvAuBBYNmblf0MiSSm0N'
        : 'price_1TFsiZAuBBYNmblfdF1CdSgr'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe Error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}