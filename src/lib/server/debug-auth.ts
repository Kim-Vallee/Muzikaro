import { createHmac, timingSafeEqual } from "node:crypto";
import { BETTER_AUTH_SECRET, DEBUG } from "$env/static/private";

export const DEBUG_SESSION_COOKIE = "muzikaro_debug_session";

export const DEBUG_SESSION_MAX_AGE = 60 * 60 * 24;

export const isDebugAuthEnabled = DEBUG === "TRUE";

export function createDebugSession(): string {
    const issuedAt = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", BETTER_AUTH_SECRET)
        .update(issuedAt)
        .digest("base64url");

    return `${issuedAt}.${signature}`;
}

export function isDebugSessionValid(value: string | undefined): boolean {
    if (!isDebugAuthEnabled || !value) {
        return false;
    }

    const [issuedAt, signature, ...rest] = value.split(".");
    const issuedAtSeconds = Number(issuedAt);
    if (
        rest.length > 0 ||
        !signature ||
        !/^[A-Za-z0-9_-]{43}$/.test(signature) ||
        !/^\d+$/.test(issuedAt) ||
        !Number.isSafeInteger(issuedAtSeconds) ||
        issuedAtSeconds > Math.floor(Date.now() / 1000) ||
        Math.floor(Date.now() / 1000) - issuedAtSeconds > DEBUG_SESSION_MAX_AGE
    ) {
        return false;
    }

    const expectedSignature = createHmac("sha256", BETTER_AUTH_SECRET)
        .update(issuedAt)
        .digest();
    const providedSignature = Buffer.from(signature, "base64url");

    return (
        providedSignature.length === expectedSignature.length &&
        timingSafeEqual(providedSignature, expectedSignature)
    );
}
