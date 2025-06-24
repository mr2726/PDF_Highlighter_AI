import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set in .env file');
    return NextResponse.json({ error: 'Internal server error: Webhook secret not configured.' }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') || '';

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return NextResponse.json({ error: 'Invalid signature format.' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta.event_name;

  if (eventName === 'order_created') {
    // This is where you would handle the successful order.
    // For example, you could update a user's account in your database to grant them access to paid features.
    
    const orderData = payload.data;
    console.log(`Order ${orderData.id} created for ${orderData.attributes.user_email}.`);
    
    // Example: find user by email and grant access based on the variant ID
    // const userEmail = orderData.attributes.user_email;
    // const variantId = orderData.attributes.first_order_item.variant_id;
    // await grantPremiumAccess(userEmail, variantId);
  }
  
  // Acknowledge receipt of the webhook
  return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
}
