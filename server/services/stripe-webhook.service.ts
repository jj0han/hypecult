import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/server/db/prisma";
import { syncOrderToDimona } from "@/server/services/dimona-sync.service";

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function parseStripeSignature(header: string) {
  const parts = header.split(",").map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    throw new Error("INVALID_STRIPE_SIGNATURE_HEADER");
  }

  return { timestamp, signatures };
}

export function verifyStripeWebhook(body: string, signatureHeader: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const signedPayload = `${timestamp}.${body}`;
  const expected = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const valid = signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature, "hex");
    return (
      signatureBuffer.length === expectedBuffer.length &&
      timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });

  if (!valid) {
    throw new Error("STRIPE_SIGNATURE_VERIFICATION_FAILED");
  }
}

async function processPaid({
  orderId,
  paymentIntentId,
}: {
  orderId?: string | null;
  paymentIntentId?: string | null;
}) {
  if (!orderId && !paymentIntentId) {
    return;
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        orderId ? { id: orderId } : undefined,
        paymentIntentId ? { paymentIntentId } : undefined,
      ].filter(Boolean) as { id?: string; paymentIntentId?: string }[],
    },
  });

  if (!order) {
    console.warn("[StripeWebhook] order not found", { orderId, paymentIntentId });
    return;
  }

  if (order.status === "pending") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paymentIntentId: paymentIntentId ?? order.paymentIntentId,
      },
    });
  } else if (!order.paymentIntentId && paymentIntentId) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId },
    });
  }

  try {
    await syncOrderToDimona(order.id);
  } catch (error) {
    // Don't fail webhook acknowledgment because retries are handled internally.
    console.error("[StripeWebhook] dimona sync failed", {
      orderId: order.id,
      paymentIntentId,
      error: String(error),
    });
  }
}

export async function handleStripeEvent(event: StripeEvent) {
  const object = event.data.object;

  if (event.type === "checkout.session.completed") {
    await processPaid({
      orderId: (object.metadata as { orderId?: string } | undefined)?.orderId ?? null,
      paymentIntentId:
        typeof object.payment_intent === "string" ? object.payment_intent : null,
    });
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    await processPaid({
      orderId: (object.metadata as { orderId?: string } | undefined)?.orderId ?? null,
      paymentIntentId: typeof object.id === "string" ? object.id : null,
    });
  }
}

