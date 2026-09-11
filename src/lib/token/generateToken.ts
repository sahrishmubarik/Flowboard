import crypto from "crypto";

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}