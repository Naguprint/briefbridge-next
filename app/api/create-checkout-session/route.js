import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { category, priceAmount, successUrl, cancelUrl } = await request.json();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Access to ${category} Briefs`,
            description: '30 days access to all briefs in this category',
          },
          unit_amount: priceAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { category },
    });
    
    return NextResponse.json({ 
      sessionUrl: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}