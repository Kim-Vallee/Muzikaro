<script lang="ts">
    import type { PageProps } from "./$types";
    import { authClient } from "$lib/client";
    let { data }: PageProps = $props();
    const session = authClient.useSession();
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-gray-950">
    {#if data.debugMode}
        {#if data.debugAuthenticated}
            <div
                class="w-full max-w-sm flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
            >
                <p class="m-0 font-semibold text-slate-900">
                    Welcome, Debug User
                </p>
                <a
                    class="button inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    href="/admin/splasharts"
                >
                    Manage splash arts
            </a>
                <form method="POST" action="?/debugLogout" class="w-full">
                    <button
                        class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-red-900 px-4 py-3 font-semibold text-white transition hover:bg-red-800"
                    >
                        Sign Out
                    </button>
                </form>
            </div>
        {:else}
            <div
                class="w-full max-w-sm flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
            >
                <p class="text-slate-600">
                    Sign in to access the admin dashboard.
                </p>
                <form method="POST" action="?/debugLogin" class="w-full">
                    <button
                        class="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                        Log In
                    </button>
                </form>
            </div>
        {/if}
    {:else if $session.data}
        <div
            class="w-full max-w-sm flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
        >
            <p class="m-0 font-semibold text-slate-900">
                Welcome, {$session.data.user.name}
            </p>
            <button
                class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                onclick={async () => {
                    await authClient.signOut();
                }}
            >
                Sign Out
            </button>
        </div>
    {:else}
        <div
            class="w-full max-w-sm flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
        >
            <p class="text-slate-600">Sign in to access the admin dashboard.</p>
            <button
                class="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
                onclick={async () => {
                    await authClient.signIn.social({
                        provider: "github",
                    });
                }}
            >
                <svg
                    class="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        fill="currentColor"
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.805 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    />
                </svg>
                Continue with GitHub
            </button>
        </div>
    {/if}
</div>
