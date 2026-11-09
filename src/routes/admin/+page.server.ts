import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    createDebugSession,
    DEBUG_SESSION_MAX_AGE,
    DEBUG_SESSION_COOKIE,
    isDebugAuthEnabled
} from "$lib/server/debug-auth";

export const load: PageServerLoad = ({ locals }) => ({
    debugMode: locals.debugMode ?? false,
    debugAuthenticated: locals.debugAuthenticated ?? false
});

export const actions: Actions = {
    debugLogin: async ({ cookies, url }) => {
        if (!isDebugAuthEnabled) {
            throw error(404, "Debug login is disabled.");
        }

        cookies.set(DEBUG_SESSION_COOKIE, createDebugSession(), {
            httpOnly: true,
            secure: url.protocol === "https:",
            sameSite: "strict",
            path: "/",
            maxAge: DEBUG_SESSION_MAX_AGE
        });
        throw redirect(303, "/admin");
    },
    debugLogout: async ({ cookies }) => {
        if (!isDebugAuthEnabled) {
            throw error(404, "Debug login is disabled.");
        }

        cookies.delete(DEBUG_SESSION_COOKIE, { path: "/" });
        throw redirect(303, "/admin");
    }
};
