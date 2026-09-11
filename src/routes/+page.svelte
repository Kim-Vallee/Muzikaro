<script lang="ts">
    import type { PageProps } from "./$types";

    import WaveSurfer from "wavesurfer.js";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { enhance } from "$app/forms";
    import Tagify from "@yaireo/tagify";
    import { goto } from "$app/navigation";

    let { data, form }: PageProps = $props();
    let activeTrackId: number | null = $state(null);
    let showDeleteModal = $state(false);
    let trackToDelete: { id: number; title: string } | null = $state(null);
    let showFormResult: boolean | null = $state(false);

    let searchQuery = $state("");

    let tagFilterInput: HTMLInputElement | undefined = $state(undefined);
    let styleFilterInput: HTMLInputElement | undefined = $state(undefined);

    let allTracks = $derived(data.tracks);
    let allTags = $derived(data.allTags);
    let allStyles = $derived(data.allStyles);
    let currentPage = $derived(data.currentPage);
    let totalPages = $derived(data.totalPages);
    let totalTracks = $derived(data.totalTracks);

    let searchInputClasses =
        "rounded-lg w-full border bg-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 py-3 px-4";

    const isAuthenticated = $derived(Boolean(data.isAuthenticated));

    let wavesurfers = new Map<HTMLElement, WaveSurfer>();

    function waveform(node: HTMLElement, audio: string) {
        import("wavesurfer.js").then((module) => {
            const WaveSurfer = module.default;

            if (!audio) return;

            let wavesurfer = WaveSurfer.create({
                container: node,
                waveColor: "#9810FA",
                progressColor: "#155DFC",
                barWidth: 4,
                barHeight: 0.8,
                barRadius: 2,
            });

            const parent = node.parentElement?.parentElement;
            if (parent) wavesurfers.set(parent, wavesurfer);
            else console.log("Error");

            wavesurfer.load(audio);
        });
    }

    function playPauseTrack(soundId: number, event: MouseEvent) {
        const button = event.currentTarget as HTMLElement;
        const parent = button.closest(".group") as HTMLElement;
        if (!parent) return;

        let wavesurfer = wavesurfers.get(parent);
        if (!wavesurfer) return;

        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            activeTrackId = null;
            return;
        }

        wavesurfers.forEach((ws: WaveSurfer) => {
            if (ws !== wavesurfer && ws.isPlaying()) {
                ws.pause();
            }
        });

        wavesurfer.play();
        activeTrackId = soundId;
    }

    function openDeleteModal(track: { id: number; title: string }) {
        trackToDelete = track;
        showDeleteModal = true;
    }

    function closeDeleteModal() {
        showDeleteModal = false;
        trackToDelete = null;
    }

    function goToPage(page: number) {
        if (page < 1 || page > totalPages || page === currentPage) return;

        const params = new URLSearchParams(window.location.search);
        params.set("p", page.toString());

        goto(`/?${params.toString()}`);
    }

    onMount(() => {
        const instances: Array<{ destroy: () => void }> = [];

        if (tagFilterInput) {
            instances.push(
                new Tagify(tagFilterInput, {
                    delimiters: ",",
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allTags.map((tag) => tag.name),
                    enforceWhitelist: true,
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(","),
                }),
            );
        }

        if (styleFilterInput) {
            instances.push(
                new Tagify(styleFilterInput, {
                    delimiters: ",",
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allStyles.map((style) => style.name),
                    enforceWhitelist: true,
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(","),
                }),
            );
        }

        return () => {
            instances.forEach((instance) => instance.destroy());
        };
    });
</script>

<div class="min-h-screen bg-gray-950">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="mx-auto py-8">
            {#if isAuthenticated && showFormResult}
                {#if form?.success}
                    <div
                        class="fixed inset-x-0 mx-auto top-4 w-5xl z-50 border rounded-xl text-sm text-white text-center border-green-500/40 bg-green-950/95 py-3"
                        out:fade
                        in:fade
                    >
                        {form?.message}
                    </div>
                {:else}
                    <div
                        class="fixed inset-x-0 mx-auto top-4 w-5xl z-50 border rounded-xl text-sm text-white text-center border-red-500/40 bg-red-950/95 py-3"
                        out:fade
                        in:fade
                    >
                        {form?.error}
                    </div>
                {/if}
            {/if}
            <h1 class="text-3xl font-bold text-white mb-6">
                <a href="/">Muzikaro</a>
            </h1>

            <div
                class="rounded-2xl border border-gray-700 bg-gray-900/80 p-4 shadow-lg shadow-black/20"
            >
                <form action="/" method="GET">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
                        <div class="flex-1">
                            <label
                                for="title-author-search"
                                class="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Filter by title or author
                            </label>
                            <div class="relative">
                                <input
                                    id="title-author-search"
                                    name="title-author-search"
                                    type="text"
                                    bind:value={searchQuery}
                                    placeholder="Search tracks by title or author..."
                                    class="pl-12 w-full rounded-lg border border-gray-700 bg-gray-800 py-3 px-4 text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:border-white hover:ring-2 hover:ring-white/30"
                                />
                                <svg
                                    class="absolute left-3 top-3 w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    ></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-4 mt-4 lg:flex-row">
                        <div class="flex-2">
                            <label
                                for="tag-filter"
                                class="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Filter by tags
                            </label>
                            <input
                                bind:this={tagFilterInput}
                                id="tag-filter"
                                name="tag-filter"
                                placeholder="Add tags"
                                class="customTagify searchBarTagify tag-tagify {searchInputClasses}"
                            />
                        </div>

                        <div class="flex-2">
                            <label
                                for="style-filter"
                                class="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Filter by style
                            </label>
                            <input
                                bind:this={styleFilterInput}
                                id="style-filter"
                                name="style-filter"
                                placeholder="Add styles"
                                class="customTagify searchBarTagify style-tagify {searchInputClasses}"
                            />
                        </div>

                        <div class="flex-1 flex items-end">
                            <button
                                type="submit"
                                class="bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center p-3 w-full text-white rounded-xl transition-colors cursor-pointer"
                                aria-label="Search"
                                title="Search"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <!-- Tracks Grid -->
        <div class="grid grid-cols-1 gap-6">
            {#if isAuthenticated}
                <a
                    href="/admin/add"
                    class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/70 p-6 text-center text-sm font-medium text-gray-300 transition-all hover:border-blue-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
                >
                    Add track
                </a>
            {/if}
            {#each allTracks as track (track.id)}
                <div
                    class="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 overflow-hidden group"
                    id="track-id-{track.id}"
                >
                    <!-- Card Header -->
                    <div class="h-32 relative overflow-hidden">
                        <div
                            use:waveform={"/content/track/" + track.audioFile}
                            class="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity bg-black/20"
                        ></div>
                    </div>

                    <!-- Card Content -->
                    <div class="p-5">
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3"
                        >
                            <div class="min-w-0">
                                <a
                                    href="/track/{track.id}"
                                    class="text-lg font-bold text-white truncate"
                                >
                                    {track.title}
                                </a>
                                <p class="text-sm text-gray-400 truncate">
                                    by {track.authors
                                        .map((author) => author.name)
                                        .join(", ")}
                                </p>
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                {#each track.tags as tag}
                                    <span
                                        class="text-[11px] px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/50"
                                    >
                                        {tag.name}
                                    </span>
                                {/each}
                            </div>
                        </div>

                        <!-- Info -->
                        <div
                            class="mb-3 border-t border-gray-700 pt-3 text-xs text-gray-400"
                        >
                            <div
                                class="flex flex-wrap items-center justify-between gap-3"
                            >
                                <div class="flex items-center gap-2">
                                    <span>Duration</span>
                                    <span class="text-gray-200"
                                        >{Math.floor(
                                            track.duration / 60,
                                        )}:{Math.round(track.duration % 60)
                                            .toString()
                                            .padStart(2, "0")}</span
                                    >
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>Styles</span>
                                    {#each track.styles as style}
                                        <span
                                            class="text-[11px] px-2 py-1 bg-purple-900/50 text-purple-300 rounded-full border border-purple-700/50"
                                        >
                                            {style.name}
                                        </span>
                                    {/each}
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>BPM</span>
                                    <span class="text-gray-200">
                                        {#if track.bpm}
                                            {track.bpm}
                                        {:else}
                                            N/A
                                        {/if}</span
                                    >
                                </div>
                                <div class="flex items-center gap-2">
                                    <span>Uploaded</span>
                                    <span class="text-gray-200"
                                        >{track.uploadedAt.toDateString()}</span
                                    >
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex justify-center gap-2">
                            <button
                                type="button"
                                onclick={(event) =>
                                    playPauseTrack(track.id, event)}
                                class="inline-flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                aria-label="Play or pause track"
                            >
                                {#if activeTrackId === track.id}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-6 h-6 pointer-events-none"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"
                                        />
                                    </svg>
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-6 h-6 pointer-events-none"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                        />
                                    </svg>
                                {/if}
                            </button>

                            {#if isAuthenticated}
                                <button
                                    type="button"
                                    onclick={() => {
                                        goto(`/admin/update/${track.id}`);
                                    }}
                                    class="inline-flex items-center justify-center w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                                    aria-label="Modify track"
                                    title="Modify track"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="size-5"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        />
                                    </svg>
                                </button>

                                <form action="?/hide_track" method="POST">
                                    <input
                                        type="hidden"
                                        value={track.id}
                                        name="trackId"
                                    />
                                    {#if track.hidden}
                                        <button
                                            type="submit"
                                            class="inline-flex items-center justify-center w-12 h-12 text-white rounded-xl transition-colors bg-gray-700 hover:bg-gray-600"
                                            aria-label="Show track (currently hidden)"
                                            title="Show track (currently hidden)"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke-width="1.5"
                                                stroke="currentColor"
                                                class="size-6"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                                />
                                            </svg>
                                        </button>
                                    {:else}
                                        <button
                                            type="submit"
                                            class="inline-flex items-center justify-center w-12 h-12 text-white rounded-xl transition-colors bg-gray-700 hover:bg-gray-600"
                                            aria-label="Hide track (currently shown)"
                                            title="Hide track (currently shown)"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke-width="1.5"
                                                stroke="currentColor"
                                                class="size-6"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                                />
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                />
                                            </svg>
                                        </button>
                                    {/if}
                                </form>

                                <button
                                    type="button"
                                    onclick={() => openDeleteModal(track)}
                                    class="inline-flex items-center justify-center w-12 h-12 text-white rounded-xl transition-colors bg-red-600 hover:bg-red-700"
                                    aria-label="Delete track"
                                    title="Delete track"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="size-5"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
            {#if totalPages > 1}
                <div class="flex flex-col items-center gap-3 py-6">
                    <div class="text-sm text-gray-400">
                        Showing page <span class="font-medium text-gray-200"
                            >{currentPage}</span
                        >
                        of
                        <span class="font-medium text-gray-200"
                            >{totalPages}</span
                        >
                        ({totalTracks} tracks)
                    </div>

                    <div class="flex items-center gap-1">
                        <button
                            type="button"
                            onclick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            class="inline-flex h-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-4"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>
                        </button>

                        {#each Array(totalPages) as _, i}
                            {@const page = i + 1}

                            <button
                                type="button"
                                onclick={() => goToPage(page)}
                                class="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors
                        {page === currentPage
                                    ? 'border-blue-500 bg-blue-600 text-white'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}"
                                aria-current={page === currentPage
                                    ? "page"
                                    : undefined}
                            >
                                {page}
                            </button>
                        {/each}

                        <button
                            type="button"
                            onclick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            class="inline-flex h-10 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="size-4"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    </div>

    {#if showDeleteModal && trackToDelete}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        >
            <div
                class="w-full max-w-md rounded-2xl border p-6 shadow-2xl border-gray-700 bg-gray-900 shadow-black/40"
            >
                <h2 class="text-xl font-semibold text-white">Delete track?</h2>
                <p class="mt-3 text-sm text-gray-400">
                    Are you sure you want to delete <span
                        class="font-medium text-white"
                        >{trackToDelete.title}</span
                    >?
                </p>
                <div class="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onclick={closeDeleteModal}
                        class="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <form
                        action="?/delete_track"
                        method="POST"
                        use:enhance={({}) => {
                            return async ({ update }) => {
                                closeDeleteModal();
                                showFormResult = true;
                                setTimeout(
                                    () => (showFormResult = false),
                                    5000,
                                );
                                update();
                            };
                        }}
                    >
                        <input
                            type="hidden"
                            value={trackToDelete.id}
                            name="trackId"
                            id="trackId"
                        />
                        <button
                            type="submit"
                            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                        >
                            Confirm delete
                        </button>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div>
