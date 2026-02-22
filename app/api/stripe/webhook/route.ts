import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { env } from "@/server/env";
import {
  handleStripeEvent,
  verifyStripeWebhook,
} from "@/server/services/stripe-webhook.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await request.text();
  const secret = env.stripe.webhookSecret;

  try {
    verifyStripeWebhook(body, signature, secret);
  } catch (error) {
    console.error("[StripeWebhook] invalid signature", { error: String(error) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await prisma.paymentWebhookEvent.create({
      data: {
        id: event.id,
        provider: "stripe",
        eventType: event.type,
      },
    });
  } catch {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    await prisma.paymentWebhookEvent.delete({ where: { id: event.id } }).catch(() => null);
    console.error("[StripeWebhook] processing failed", { eventId: event.id, error: String(error) });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

