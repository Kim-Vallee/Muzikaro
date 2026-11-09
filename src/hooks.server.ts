import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import {
    DEBUG_SESSION_COOKIE,
    isDebugAuthEnabled,
    isDebugSessionValid
} from "$lib/server/debug-auth";

export async function handle({ event, resolve }) {
    event.locals.debugMode = isDebugAuthEnabled;

    const session = await auth.api.getSession({
        headers: event.request.headers,
    });

    if (session) {
        event.locals.session = session.session;
        event.locals.user = session.user;
    } else if (isDebugSessionValid(event.cookies.get(DEBUG_SESSION_COOKIE))) {
        event.locals.debugAuthenticated = true;
        event.locals.user = { id: "debug-user", name: "Debug User" };
    }

    return svelteKitHandler({ event, resolve, auth, building });
}