import crypto from "crypto";

export function generateToken(length: number) {
    return crypto.randomBytes(Math.round(length / 2)).toString("hex");
}
