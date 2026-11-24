<script lang="ts">
    import type { PageProps } from "./$types";
    import { authClient } from "$lib/client";
    let { data, form }: PageProps = $props();
    const session = authClient.useSession();

    const allCovers = $derived(data.allCovers);

    const filteredCovers = $derived(
        data.allCovers.filter((cov) => cov.coverUrl !== "default"),
    );

    let coverSelection = $derived(
        filteredCovers.length > 0 ? filteredCovers[0].coverUrl : "",
    );
</script>

<div class="min-h-screen flex items-center justify-center p-8 bg-gray-950">
    <div
        class="w-full max-w-lg flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg"
    >
        <p class="m-0 font-semibold text-slate-900">Splash art management</p>
        {#if form?.error}
            <div
                class="mb-6 rounded-lg border border-red-700/40 bg-red-900/20 p-4 text-sm text-red-200"
            >
                {form.message}
            </div>
        {/if}

        {#if form?.success}
            <div
                class="mb-6 rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-4 text-sm text-emerald-600"
            >
                {form.message}
            </div>
        {/if}
        {#if data.allCovers.length > 1}
            <form
                method="POST"
                action="?/deleteSplashart"
                class="flex flex-row"
            >
                <div>
                    <select
                        name="splashart"
                        id="splashart"
                        bind:value={coverSelection}
                        class="w-full rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        {#each allCovers as cover}
                            {#if cover.coverUrl != "default"}
                                <option value={cover.coverUrl}
                                    >{cover.coverUrl}</option
                                >
                            {/if}
                        {/each}
                    </select>

                    <button
                        class="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-red-900 px-4 py-3 font-semibold text-white transition hover:bg-red-800"
                    >
                        Delete
                    </button>
                </div>

                <div
                    class="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/70"
                >
                    <img
                        src="/content/splash/{coverSelection}"
                        alt="Selected cover preview"
                        class="max-h-80 w-full object-contain"
                    />
                </div>
            </form>
        {:else}
            <div class="flex flex-row">
                <p>No covers to manage</p>
            </div>
        {/if}
        <a
            class="button inline-flex w-md items-center justify-center rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            href="/admin"
        >
            Back to admin panel
        </a>
    </div>
</div>
