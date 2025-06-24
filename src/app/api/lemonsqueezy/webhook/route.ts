import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set in .env file');
    return NextResponse.json({ error: 'Internal server error: Webhook secret not configured.' }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature') || '';

    if (!signature) {
        return NextResponse.json({ error: 'Signature header is missing.' }, { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', secret);
    const computedSignature = hmac.update(rawBody).digest('hex');

    const computedSignatureBuffer = Buffer.from(computedSignature, 'hex');
    const receivedSignatureBuffer = Buffer.from(signature, 'hex');

    if (!crypto.timingSafeEqual(computedSignatureBuffer, receivedSignatureBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    
    if (eventName === 'order_created') {
      const attributes = payload.data.attributes;
      const userEmail = attributes.user_email;
      const variantId = attributes.first_order_item.variant_id.toString();
      const orderId = payload.data.id;

      console.log(`Received 'order_created' webhook for order ${orderId} from ${userEmail}.`);

      // This is where you would interact with your database (e.g., Firestore)
      // to grant access to the user based on the purchased product.
      
      switch (variantId) {
        case '869701': // Pro Monthly
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          console.log(`ACTION: Grant 'Pro Monthly' access to ${userEmail} until ${expiryDate.toISOString()}.`);
          // Example DB Logic: await grantProAccess(userEmail, expiryDate);
          break;
        case '869712': // Pay per PDF
          console.log(`ACTION: Grant 1 additional PDF credit to ${userEmail}.`);
          // Example DB Logic: await addPdfCredit(userEmail, 1);
          break;
        default:
          console.warn(`Order ${orderId} has an unhandled variant_id: ${variantId}`);
      }
    }
    
    return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: `Webhook error: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
