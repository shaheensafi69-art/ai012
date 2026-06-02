import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
// تغییر مهم: سیستم حالا دقیقاً اسم کلید شما را می‌خواند
const PAYPAL_SECRET = process.env.PAYPAL_SECRET_KEY || process.env.PAYPAL_SECRET;

const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !secret) {
    throw new Error("کلیدها در فایل env یافت نشدند!");
  }

  // استفاده از URLSearchParams برای جلوگیری از خطاهای احتمالی در فرمت درخواست
  const details = new URLSearchParams();
  details.append('grant_type', 'client_credentials');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: details
  });

  if (!response.ok) {
    const errorData = await response.text(); // تغییر به text برای دیدن اصل ماجرا
    console.error("DEBUG - Status:", response.status);
    console.error("DEBUG - Response Body:", errorData);
    throw new Error(`خطای 401: پی‌پل اعتبار شما را رد کرد. پاسخ پی‌پل: ${errorData}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { planId, amount } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'کاربر لاگین نیست.' }, { status: 401 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accessToken = await getPayPalAccessToken();
    const formattedAmount = Number(amount).toFixed(2);

    const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            custom_id: `${user.id}:${planId}`,
            description: `SAFI Neural Studio - ${planId.toUpperCase()} Plan`,
            amount: {
              currency_code: 'USD',
              value: formattedAmount,
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'SAFI Neural Studio',
              locale: 'en-US',
              landing_page: 'LOGIN',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: `${appUrl}/dashboard/profile?payment=success`,
              cancel_url: `${appUrl}/dashboard/checkout?plan=${planId}&payment=cancelled`
            }
          }
        }
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal Order Error Details:', JSON.stringify(orderData, null, 2));
      throw new Error(`خطای پی‌پال: ${orderData.message || orderData.name}`);
    }

    const approveLink = orderData.links.find((link: any) => link.rel === 'approve' || link.rel === 'payer-action');

    if (!approveLink) {
      throw new Error('لینک تایید پی‌پال یافت نشد.');
    }

    return NextResponse.json({ url: approveLink.href });

  } catch (error: any) {
    console.error('PayPal Checkout Fatal Error:', error);
    return NextResponse.json({ error: error.message || 'خطای داخلی سرور پی‌پال' }, { status: 500 });
  }
}