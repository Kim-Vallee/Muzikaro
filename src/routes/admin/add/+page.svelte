<script lang="ts">
    import { onMount } from "svelte";
    import type { PageProps } from "./$types";
    import Tagify from "@yaireo/tagify";

    let { data, form }: PageProps = $props();
    let selectedFileName = $state("");
    let coverSelection = $state("default");
    let selectedSplashArtName = $state("");

    $effect(() => {
        selectedFileName = form?.values?.audioFileName ?? "";
        coverSelection = form?.values?.coverSelection ?? "default";
        selectedSplashArtName = form?.values?.splashArtName ?? "";
    });

    let tagsInput: HTMLInputElement | undefined;
    let stylesInput: HTMLInputElement | undefined;
    let authorInput: HTMLInputElement | undefined;

    let allTags = $derived(data.allUniqueTags);
    let allStyles = $derived(data.allUniqueStyles);
    let allAuthors = $derived(data.allUniqueAuthors);
    let allCovers = $derived(data.allUniqueCovers);

    const inputClasses =
        "w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

    onMount(() => {
        const instances: Array<{ destroy: () => void }> = [];

        if (tagsInput) {
            instances.push(
                new Tagify(tagsInput, {
                    delimiters: ",",
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allTags.map((tag) => tag.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(","),
                }),
            );
        }

        if (stylesInput) {
            instances.push(
                new Tagify(stylesInput, {
                    delimiters: ",",
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allStyles.map((style) => style.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(","),
                }),
            );
        }

        if (authorInput) {
            instances.push(
                new Tagify(authorInput, {
                    delimiters: ",",
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allAuthors.map((author) => author.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(","),
                }),
            );
        }
    });
</script>

<div class="min-h-screen bg-gray-950">
    <div class="mx-auto max-w-4xl px-6 py-10">
        <div
            class="rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/30"
        >
            <div class="mb-8">
                <a
                    href="/"
                    class="text-sm text-blue-300 hover:text-white transition-colors"
                >
                    ← Back to home
                </a>
                <p
                    class="mb-2 text-sm uppercase tracking-[0.3em] text-blue-400"
                >
                    Admin
                </p>
                <h1 class="text-3xl font-semibold text-white">
                    Add a new track
                </h1>
                <p class="mt-2 text-sm text-gray-400">
                    Fill in the track details below to publish it to the
                    catalog.
                </p>
            </div>

            {#if form?.error}
                <div
                    class="mb-6 rounded-lg border border-red-700/40 bg-red-900/20 p-4 text-sm text-red-200"
                >
                    {form.error}
                </div>
            {/if}

            {#if form?.success}
                <div
                    class="mb-6 rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-4 text-sm text-emerald-200"
                >
                    {form.message}
                </div>
            {/if}

            <form
                method="POST"
                class="space-y-6"
                action="?/add_track"
                enctype="multipart/form-data"
            >
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="block text-sm font-medium text-gray-300">
                        <label class="mb-2 block" for="title">Title</label>
                        <input
                            name="title"
                            id="title"
                            required
                            value={form?.values?.title ?? ""}
                            placeholder="Midnight Jazz"
                            class={inputClasses}
                        />
                    </div>

                    <div class="block text-sm font-medium text-gray-300">
                        <label class="mb-2 block" for="author"> Author </label>
                        <input
                            bind:this={authorInput}
                            id="author"
                            name="author"
                            required
                            value={form?.values?.author ?? ""}
                            placeholder="Alex Rivers"
                            class="customTagify addTrackTagify {inputClasses}"
                        />
                    </div>

                    <div
                        class="block text-sm font-medium text-gray-300 md:col-span-2"
                    >
                        <label for="description" class="mb-2 block">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            required
                            rows="4"
                            value={form?.values?.description ?? ""}
                            placeholder="What makes this track special?"
                            class={inputClasses}
                        ></textarea>
                    </div>

                    <div class="block text-sm font-medium text-gray-300">
                        <label class="mb-2 block" for="bpm">BPM</label>
                        <input
                            id="bpm"
                            name="bpm"
                            type="number"
                            min="20"
                            max="320"
                            value={form?.values?.bpm ?? ""}
                            placeholder="120"
                            class={inputClasses}
                        />
                    </div>

                    <div class="block text-sm font-medium text-gray-300">
                        <label class="mb-2 block" for="styles">Styles</label>
                        <input
                            bind:this={stylesInput}
                            name="styles"
                            id="styles"
                            value={form?.values?.styles ?? ""}
                            placeholder="Métal,Thrash métal"
                            class="customTagify addTrackTagify style-tagify {inputClasses}"
                        />
                    </div>

                    <div
                        class="block text-sm font-medium text-gray-300 md:col-span-2"
                    >
                        <label class="mb-2 block" for="setup">Setup</label>
                        <textarea
                            id="setup"
                            name="setup"
                            rows="3"
                            value={form?.values?.setup ?? ""}
                            placeholder="Tell us how this track should be played or prepared."
                            class={inputClasses}
                        ></textarea>
                    </div>

                    <label
                        class="block text-sm font-medium text-gray-300 md:col-span-2"
                        for="audiofile"
                    >
                        <span class="mb-2 block">Audio file</span>
                        <div
                            class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/70 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-gray-800"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-10 w-10 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="1.5"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 16.5V4.75m0 0l-3.75 3.75M12 4.75l3.75 3.75M4.5 14.25v2.25a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-2.25"
                                />
                            </svg>
                            <span class="mt-3 text-sm font-medium text-white"
                                >Drop your audio file here</span
                            >
                            <span class="mt-1 text-xs text-gray-400"
                                >MP3, WAV, OGG, M4A</span
                            >
                            <input
                                name="audioFile"
                                id="audiofile"
                                type="file"
                                accept="audio/*"
                                required
                                class="sr-only"
                                onchange={(event) => {
                                    selectedFileName =
                                        event.currentTarget.files?.[0]?.name ??
                                        "";
                                }}
                            />
                        </div>
                        {#if selectedFileName}
                            <p class="mt-2 text-sm text-gray-400">
                                Selected: {selectedFileName}
                            </p>
                        {/if}
                    </label>

                    <div
                        class="block text-sm font-medium text-gray-300 md:col-span-2"
                    >
                        <label class="mb-2 block" for="coverSelection">
                            Cover
                        </label>
                        <div class="relative">
                            <select
                                id="coverSelection"
                                name="coverSelection"
                                bind:value={coverSelection}
                                onchange={() => {
                                    selectedSplashArtName = "";
                                }}
                                class={inputClasses + " appearance-none"}
                            >   
                                <option value="default">Use default cover</option>
                                {#each allCovers as track (track.coverUrl)}
                                    <option value="{track.coverUrl}">{track.coverUrl}</option>
                                {/each}
                                <option value="new">Add a new cover</option>
                            </select>
                            
                            <svg
                                aria-hidden="true"
                                class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M5.22 7.47a.75.75 0 011.06 0L10 11.19l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.53a.75.75 0 010-1.06z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    {#if coverSelection !== "new"}
                        <div
                            class="md:col-span-2 overflow-hidden rounded-xl border border-gray-700 bg-gray-800/70"
                        >
                            <img
                                src="/content/splash/{coverSelection}"
                                alt="Selected cover preview"
                                class="max-h-80 w-full object-contain"
                            />
                        </div>
                    {/if}

                    {#if coverSelection === "new"}
                        <label
                            class="block text-sm font-medium text-gray-300 md:col-span-2"
                            for="splashArt"
                        >
                            <span class="mb-2 block">Splash art</span>
                            <div
                                class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/70 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-gray-800"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-10 w-10 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M4.5 16.5l4.5-4.5 3 3 4.5-6 3 4.5M4.5 19.5h15a1.5 1.5 0 001.5-1.5v-12a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5z"
                                    />
                                </svg>
                                <span
                                    class="mt-3 text-sm font-medium text-white"
                                >
                                    Drop your splash art here
                                </span>
                                <span class="mt-1 text-xs text-gray-400">
                                    Image files
                                </span>
                                <input
                                    name="splashArt"
                                    id="splashArt"
                                    type="file"
                                    accept="image/*"
                                    required
                                    class="sr-only"
                                    onchange={(event) => {
                                        selectedSplashArtName =
                                            event.currentTarget.files?.[0]
                                                ?.name ?? "";
                                    }}
                                />
                            </div>
                            {#if selectedSplashArtName}
                                <p class="mt-2 text-sm text-gray-400">
                                    Selected: {selectedSplashArtName}
                                </p>
                            {/if}
                        </label>
                    {/if}

                    <div
                        class="block text-sm font-medium text-gray-300 md:col-span-2"
                    >
                        <label class="mb-2 block" for="tags">Tags</label>
                        <input
                            bind:this={tagsInput}
                            name="tags"
                            id="tags"
                            value={form?.values?.tags ?? ""}
                            placeholder="chill, lo-fi, cinematic"
                            class="customTagify addTrackTagify tag-tagify {inputClasses}"
                        />
                    </div>
                </div>

                <div class="flex justify-end">
                    <button
                        type="submit"
                        class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Add track
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
