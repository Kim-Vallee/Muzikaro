<script lang="ts">
    import type WaveSurfer from "wavesurfer.js";

    import type { PageProps } from "./$types";
    import { goto } from "$app/navigation";
    import { enhance } from "$app/forms";

    let { data }: PageProps = $props();

    let wavesurfer: WaveSurfer;
    let isPlaying: boolean = $state(false);
    let coverDialog: HTMLDialogElement;
    let showFormResult: boolean | null = $state(false);

    const isAuthenticated = $derived(data.isAuthenticated);

    function formatDate(date: Date) {
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    let showDeleteModal = $state(false);
    function openDeleteModal() {
        showDeleteModal = true;
    }

    function closeDeleteModal() {
        showDeleteModal = false;
    }

    function waveform(node: HTMLElement, audio: string | null) {
        if (!audio) {
            return;
        }

        import("wavesurfer.js").then((module) => {
            const WaveSurfer = module.default;

            wavesurfer = WaveSurfer.create({
                container: node,
                waveColor: "#9810FA",
                progressColor: "#155DFC",
                barWidth: 4,
                barHeight: 0.8,
                barRadius: 2,
            });

            wavesurfer.load(audio);
        });
    }

    function togglePlay() {
        if (!wavesurfer) return;

        wavesurfer.playPause();

        if (wavesurfer.isPlaying()) isPlaying = true;
        else isPlaying = false;
    }

    function openCoverDialog() {
        coverDialog?.showModal();
    }

    function closeCoverDialog() {
        coverDialog?.close();
    }
</script>

<div class="min-h-screen flex flex-col bg-gray-950">
    <main
        class="relative isolate w-full px-4 py-6 sm:px-6 sm:py-12 flex-1 flex flex-col"
    >
        <div
            class="relative z-10 flex-1 flex rounded-3xl border border-gray-700 bg-gray-900/75 shadow-xl backdrop-blur-md overflow-hidden"
        >
            <img
                src="/content/splash/{data.track.coverUrl}"
                alt=""
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            />
            <div
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 z-0 bg-gray-950/75 backdrop-blur-sm"
            ></div>
            <div class="flex flex-col flex-1 p-8 z-10">
                <a
                    href="/"
                    class="text-sm text-blue-300 hover:text-white transition-colors"
                >
                    ← Back to home
                </a>
                <div
                    use:waveform={data.track.audioUrl}
                    class="opacity-100 w-full bg-black/20 mt-4"
                ></div>

                <div class="mt-4">
                    <div
                        class="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-center flex flex-row gap-2"
                    >
                        <button
                            type="button"
                            onclick={togglePlay}
                            class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                            aria-label="Play or pause track"
                        >
                            {#if isPlaying}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
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
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.5"
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
                                    goto(`/admin/update/${data.track.id}`);
                                }}
                                class="inline-flex items-center justify-center w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
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

                            <form
                                action="/?/hide_track"
                                method="POST"
                                use:enhance
                            >
                                <input
                                    type="hidden"
                                    value={data.track.id}
                                    name="trackId"
                                />
                                {#if data.track.hidden}
                                    <button
                                        type="submit"
                                        class="inline-flex items-center justify-center w-14 h-14 text-white rounded-xl transition-colors bg-gray-700 hover:bg-gray-600"
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
                                        class="inline-flex items-center justify-center w-14 h-14 text-white rounded-xl transition-colors bg-gray-700 hover:bg-gray-600"
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
                                onclick={() => openDeleteModal()}
                                class="inline-flex items-center justify-center w-14 h-14 text-white rounded-xl transition-colors bg-red-600 hover:bg-red-700"
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
                    <div
                        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                        <div class="order-1 min-w-0">
                            <h2 class="text-2xl font-bold text-white truncate">
                                {data.track.title}
                            </h2>
                            <p class="text-sm text-gray-400 mt-2">
                                by {data.track.authors
                                    .map((author) => author.name)
                                    .join(", ")}
                            </p>
                        </div>
                        <button
                            type="button"
                            onclick={openCoverDialog}
                            class="order-2 inline-flex shrink-0 self-start items-center gap-2 rounded-lg border border-gray-600 bg-gray-950/70 px-4 py-2 text-sm font-medium text-white transition hover:border-blue-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <svg
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                class="h-5 w-5"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z"
                                />
                                <circle cx="12" cy="12" r="2.25" />
                            </svg>
                            View splash art
                        </button>
                    </div>
                </div>

                <div class="mt-4 flex grow flex-col md:flex-row gap-3">
                    <div
                        class="relative rounded-2xl bg-gray-900 border border-gray-700 p-5 basis-1 md:basis-2/3"
                    >
                        <h3
                            class="text-sm font-semibold text-white uppercase tracking-[0.2em]"
                        >
                            Description
                        </h3>
                        <p
                            class="mt-3 text-sm leading-6 text-gray-300 mb-5 whitespace-pre-line"
                        >
                            {data.track.description}
                        </p>
                    </div>
                    <div class="flex flex-col basis-1 md:basis-1/3 gap-3">
                        <div
                            class="rounded-2xl bg-gray-900 border border-gray-700 p-5 basis-1/2"
                        >
                            <h3
                                class="text-sm font-semibold text-white uppercase tracking-[0.2em]"
                            >
                                Infos
                            </h3>
                            <div class="mt-3 text-sm leading-6 text-gray-300">
                                <div class="">
                                    BPM: {data.track.bpm
                                        ? data.track.bpm
                                        : "N/A"}
                                </div>
                                <div class="mt-2">
                                    Duration:
                                    {Math.floor(
                                        data.track.duration / 60,
                                    )}:{Math.round(data.track.duration % 60)}
                                </div>
                                <div class="mt-2">
                                    Upload date: {formatDate(
                                        data.track.uploadedAt,
                                    )}
                                </div>
                                <div class="mt-2">
                                    Styles:
                                    {#if data.track.styles.length > 0}
                                        {#each data.track.styles as style}
                                            <span
                                                class="text-[11px] px-2 py-1 mx-1 bg-purple-900/50 text-purple-300 rounded-full border border-purple-700/50"
                                            >
                                                {style.name}
                                            </span>
                                        {/each}
                                    {:else}
                                        N/A
                                    {/if}
                                </div>
                                <div class="mt-2">
                                    Tags:
                                    {#if data.track.tags.length > 0}
                                        {#each data.track.tags as tag}
                                            <span
                                                class="text-[11px] px-2 py-1 mx-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/50"
                                            >
                                                {tag.name}
                                            </span>
                                        {/each}
                                    {:else}
                                        N/A
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div
                            class="rounded-2xl bg-gray-900 border border-gray-700 p-5 basis-1/2"
                        >
                            <h3
                                class="text-sm font-semibold text-white uppercase tracking-[0.2em]"
                            >
                                Setup
                            </h3>
                            <p
                                class="mt-3 text-sm leading-6 text-gray-300 whitespace-pre-line"
                            >
                                {data.track.setup}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <dialog
        bind:this={coverDialog}
        aria-label="Splash art for {data.track.title}"
        onclick={(event) => {
            if (event.target === coverDialog) closeCoverDialog();
        }}
        class="m-auto max-h-[95vh] max-w-[95vw] overflow-visible border-0 bg-transparent p-0 backdrop:bg-black/85"
    >
        <button
            type="button"
            onclick={closeCoverDialog}
            aria-label="Close splash art"
            class="absolute -right-3 -top-3 z-10 rounded-full bg-gray-900/90 p-2 text-white shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                class="h-6 w-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                />
            </svg>
        </button>
        <img
            src="/content/splash/{data.track.coverUrl}"
            alt="Splash art of {data.track.title}"
            class="max-h-[95vh] max-w-[95vw] object-contain"
        />
    </dialog>

    {#if showDeleteModal}
        <div
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        >
            <div
                class="w-full max-w-md rounded-2xl border p-6 shadow-2xl border-gray-700 bg-gray-900 shadow-black/40"
            >
                <h2 class="text-xl font-semibold text-white">Delete track?</h2>
                <p class="mt-3 text-sm text-gray-400">
                    Are you sure you want to delete <span
                        class="font-medium text-white">{data.track.title}</span
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
                        action="/?/delete_track"
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
                            value={data.track.id}
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
