// supabase/functions/green-stripe-webhook/index.ts
// Payment-first account creation. On checkout.session.completed we resolve (or create)
// the auth user by email, ensure a green_profile, and upsert green_subscriptions.
// Subsequent events keep status in sync.
import Stripe from "https://esm.sh/stripe@16?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});
const WH = Deno.env.get("GREEN_STRIPE_WEBHOOK_SECRET")!;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

// Resolve user id by email; create the auth user if none exists (payment confirmed).
async function resolveUserId(email: string): Promise<string> {
  const { data, error } = await admin.rpc("green_get_user_id_by_email", { p_email: email });
  if (error) throw error;
  if (data) return data as string;
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (cErr) throw cErr;
  return created.user!.id;
}

async function ensureProfile(userId: string, email: string) {
  await admin
    .from("green_profiles")
    .upsert({ id: userId, email }, { onConflict: "id", ignoreDuplicates: true });
}

async function upsertSub(userId: string, fields: Record<string, unknown>) {
  const { error } = await admin
    .from("green_subscriptions")
    .upsert({ user_id: userId, ...fields }, { onConflict: "user_id" });
  if (error) throw error;
}

async function userIdBySubscription(subId: string): Promise<string | null> {
  const { data } = await admin
    .from("green_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subId)
    .maybeSingle();
  return data?.user_id ?? null;
}

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, WH);
  } catch (e) {
    return new Response(`Bad signature: ${e}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email = s.customer_details?.email ?? (s.metadata?.email as string);
        const userId = await resolveUserId(email);
        await ensureProfile(userId, email);
        const sub = await stripe.subscriptions.retrieve(s.subscription as string);
        await upsertSub(userId, {
          stripe_customer_id: s.customer as string,
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await userIdBySubscription(sub.id);
        if (userId) {
          await upsertSub(userId, {
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const userId = await userIdBySubscription(inv.subscription as string);
        if (userId) await upsertSub(userId, { status: "past_due", updated_at: new Date().toISOString() });
        break;
      }
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(`Handler error: ${e}`, { status: 500 });
  }
});
