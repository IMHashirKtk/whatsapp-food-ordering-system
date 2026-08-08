import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/i;

export const isValidMetaSignature = (rawBody, signature, secret) => {
  if (!Buffer.isBuffer(rawBody) || !rawBody.length) {
    return false;
  }

  if (typeof signature !== "string" || !secret?.trim()) {
    return false;
  }

  const match = signature.trim().match(SIGNATURE_PATTERN);

  if (!match) {
    return false;
  }

  const receivedDigest = Buffer.from(match[1], "hex");
  const expectedDigest = createHmac("sha256", secret.trim())
    .update(rawBody)
    .digest();

  return (
    receivedDigest.length === expectedDigest.length &&
    timingSafeEqual(receivedDigest, expectedDigest)
  );
};
