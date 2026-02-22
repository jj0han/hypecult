import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  calculateNextRetryAt,
  shouldRetrySync,
} from "@/server/services/dimona-sync.service";
import { verifyStripeWebhook } from "@/server/services/stripe-webhook.service";

test("verifyStripeWebhook accepts a valid signature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_1", type: "payment_intent.succeeded" });
  const timestamp = "1700000000";
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");

  assert.doesNotThrow(() => {
    verifyStripeWebhook(payload, `t=${timestamp},v1=${signature}`, secret);
  });
});

test("verifyStripeWebhook rejects an invalid signature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_2", type: "checkout.session.completed" });
  const timestamp = "1700000001";

  assert.throws(() => {
    verifyStripeWebhook(payload, `t=${timestamp},v1=deadbeef`, secret);
  });
});

test("shouldRetrySync respects retryability and max retries", () => {
  assert.equal(shouldRetrySync(1, true), true);
  assert.equal(shouldRetrySync(4, true), true);
  assert.equal(shouldRetrySync(5, true), false);
  assert.equal(shouldRetrySync(1, false), false);
});

test("calculateNextRetryAt applies exponential backoff", () => {
  const now = Date.now();
  const retry1 = calculateNextRetryAt(1).getTime();
  const retry2 = calculateNextRetryAt(2).getTime();

  const delta1 = retry1 - now;
  const delta2 = retry2 - now;

  assert.ok(delta1 >= 5 * 60 * 1000 - 1000);
  assert.ok(delta2 >= 10 * 60 * 1000 - 1000);
});

