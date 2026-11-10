<script lang="ts">
    import type { PageProps } from "./$types";
    import { authClient } from "$lib/client";
    let { data }: PageProps = $props();
    const session = authClient.useSession();
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-gray-950">
    <div
        class="w-full max-w-lg flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
    >
        <p class="m-0 font-semibold text-slate-900">Splash art management</p>
        <form method="POST" action="?/deleteSplashart" class="flex flex-row">
            <select
                name="splashart"
                id="splashart"
                class="w-full rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
                <option value="value1">value1</option>
            </select>
            <button class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-red-900 px-4 py-3 font-semibold text-white transition hover:bg-red-800" > Delete </button>
        </form>
        <form method="POST" action="?/deleteUnusedSplasharts" class="w-md">
            <button
                class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-red-900 px-4 py-3 font-semibold text-white transition hover:bg-red-800"
            >
                Delete all unused splasharts
            </button>
        </form>
        <a
            class="button inline-flex w-md items-center justify-center rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            href="/admin"
        >
            Back to admin panel
        </a>
    </div>
</div>
