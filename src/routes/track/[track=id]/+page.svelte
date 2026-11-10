<script lang="ts">
    import type WaveSurfer from "wavesurfer.js";

    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();

    let wavesurfer: WaveSurfer;
    let isPlaying: boolean = $state(false);
    let coverDialog: HTMLDialogElement;

    function formatDate(date: Date) {
        return date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
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
                        class="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-center"
                    >
                        <button
                            type="button"
                            onclick={togglePlay}
                            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
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
                        <p class="mt-3 text-sm leading-6 text-gray-300 mb-5">
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
                                <div class="">BPM: {data.track.bpm}</div>
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
                                    {#each data.track.styles as style}
                                        <span
                                            class="text-[11px] px-2 py-1 mx-1 bg-purple-900/50 text-purple-300 rounded-full border border-purple-700/50"
                                        >
                                            {style.name}
                                        </span>
                                    {/each}
                                </div>
                                <div class="mt-2">
                                    Tags:
                                    {#each data.track.tags as tag}
                                        <span
                                            class="text-[11px] px-2 py-1 mx-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700/50"
                                        >
                                            {tag.name}
                                        </span>
                                    {/each}
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
                            <p class="mt-3 text-sm leading-6 text-gray-300">
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
</div>
