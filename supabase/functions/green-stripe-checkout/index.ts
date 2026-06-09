// supabase/functions/green-stripe-checkout/index.ts
// Creates a Stripe Checkout Session for the green $8/mo membership.
// NO account is created here — that happens in the webhook after payment.
import Stripe from "https://esm.sh/stripe@16?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});
const PRICE = Deno.env.get("GREEN_STRIPE_PRICE_ID")!;
const APP_URL = Deno.env.get("APP_URL")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Reuse an existing Stripe customer for this email if one exists.
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? (await stripe.customers.create({ email }));

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: PRICE, quantity: 1 }],
      success_url: `${APP_URL}/auth?welcome=1`,
      cancel_url: `${APP_URL}/subscribe`,
      allow_promotion_codes: true,
      metadata: { app: "green", email },
      subscription_data: { metadata: { app: "green", email } },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
