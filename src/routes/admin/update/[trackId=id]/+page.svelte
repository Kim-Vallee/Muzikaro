<script lang="ts">
    import { onMount } from 'svelte';
    import type { ActionData, PageData } from './$types';
    import Tagify from '@yaireo/tagify';

    let { data, form }: { data: PageData; form?: ActionData } = $props();
    let selectedFileName = $state('');
    let selectedSplashArtName = $state("");

    // Element references for Tagify
    let tagsInput: HTMLInputElement | undefined = $state(undefined);
    let stylesInput: HTMLInputElement | undefined = $state(undefined);
    let authorInput: HTMLInputElement | undefined = $state(undefined);

    // Whitelists from the server (must be provided in the page data)
    let allTags = $derived(data.allUniqueTags);
    let allStyles = $derived(data.allUniqueStyles);
    let allAuthors = $derived(data.allUniqueAuthors);
    let allCovers = $derived(data.allUniqueCovers);

    const inputClasses =
        'w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

    const track = $derived(data.track);
    let coverSelection = $derived(track.coverUrl === "default.jpg" ? "default" : track.coverUrl );

    onMount(() => {
        const instances: Array<{ destroy: () => void }> = [];

        if (tagsInput) {
            instances.push(
                new Tagify(tagsInput, {
                    delimiters: ',',
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allTags.map((tag) => tag.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(','),
                }),
            );
        }

        if (stylesInput) {
            instances.push(
                new Tagify(stylesInput, {
                    delimiters: ',',
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allStyles.map((style) => style.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(','),
                }),
            );
        }

        if (authorInput) {
            instances.push(
                new Tagify(authorInput, {
                    delimiters: ',',
                    maxTags: 10,
                    dropdown: { enabled: 0, maxItems: 6 },
                    keepInvalidTags: false,
                    whitelist: allAuthors.map((author) => author.name),
                    originalInputValueFormat: (valuesArr) =>
                        valuesArr.map((item) => item.value).join(','),
                }),
            );
        }

        return () => {
            instances.forEach((instance) => instance.destroy());
        };
    });
</script>

<div class="min-h-screen bg-gray-950">
    <div class="mx-auto max-w-4xl px-6 py-10">
        <div class="rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl shadow-black/30">
            <div class="mb-8">
                <a
                    href="/"
                    class="text-sm text-blue-300 transition-colors hover:text-white"
                >
                    ← Back to home
                </a>
                <p class="mb-2 text-sm uppercase tracking-[0.3em] text-blue-400">Admin</p>
                <h1 class="text-3xl font-semibold text-white">Update track</h1>
                <p class="mt-2 text-sm text-gray-400">
                    Edit the existing track details below and save your changes.
                </p>
            </div>

            {#if form?.error}
                <div class="mb-6 rounded-lg border border-red-700/40 bg-red-900/20 p-4 text-sm text-red-200">
                    {form.error}
                </div>
            {/if}

            {#if form?.success}
                <div class="mb-6 rounded-lg border border-emerald-700/40 bg-emerald-900/20 p-4 text-sm text-emerald-200">
                    {form.message}
                </div>
            {/if}

            {#if track}
                <form method="POST" class="space-y-6" action="?/update_track" enctype="multipart/form-data">
                    <div class="grid gap-6 md:grid-cols-2">
                        <label class="block text-sm font-medium text-gray-300">
                            <span class="mb-2 block">Title</span>
                            <input name="title" required value={track.title} class={inputClasses} />
                        </label>

                        <!-- Author field now uses Tagify -->
                        <div class="block text-sm font-medium text-gray-300">
                            <label class="mb-2 block" for="author">Author</label>
                            <input
                                bind:this={authorInput}
                                id="author"
                                name="author"
                                required
                                value={track.authors.map((a) => a.name).join(',') ?? ''}
                                class="customTagify addTrackTagify {inputClasses}"
                            />
                        </div>

                        <label class="block text-sm font-medium text-gray-300 md:col-span-2">
                            <span class="mb-2 block">Description</span>
                            <textarea name="description" required rows="4" class={inputClasses}>{track.description ?? ''}</textarea>
                        </label>

                        <label class="block text-sm font-medium text-gray-300">
                            <span class="mb-2 block">BPM</span>
                            <input
                                name="bpm"
                                type="number"
                                min="20"
                                max="320"
                                value={track.bpm ?? ''}
                                class={inputClasses}
                            />
                        </label>

                        <!-- Styles field now uses Tagify -->
                        <div class="block text-sm font-medium text-gray-300">
                            <label class="mb-2 block" for="styles">Styles</label>
                            <input
                                bind:this={stylesInput}
                                name="styles"
                                id="styles"
                                value={track.styles.map((s) => s.name).join(',') ?? ''}
                                class="customTagify addTrackTagify style-tagify {inputClasses}"
                            />
                        </div>

                        <label class="block text-sm font-medium text-gray-300 md:col-span-2">
                            <span class="mb-2 block">Setup</span>
                            <textarea name="setup" rows="3" class={inputClasses}>{track.setup ?? ''}</textarea>
                        </label>

                        <label class="block text-sm font-medium text-gray-300 md:col-span-2">
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
                                <span class="mt-3 text-sm font-medium text-white">Replace audio file</span>
                                <span class="mt-1 text-xs text-gray-400">MP3, WAV, OGG, M4A</span>
                                <input
                                    name="audioFile"
                                    type="file"
                                    accept="audio/*"
                                    class="sr-only"
                                    onchange={(event) => {
                                        selectedFileName = event.currentTarget.files?.[0]?.name ?? '';
                                    }}
                                />
                            </div>
                            {#if selectedFileName}
                                <p class="mt-2 text-sm text-gray-400">Selected: {selectedFileName}</p>
                            {:else}
                                <p class="mt-2 text-sm text-gray-400">Current file: {track.audioFile}</p>
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
                                src="/content/splash/{coverSelection === 'default'
                                    ? 'default.jpg'
                                    : coverSelection}"
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

                        <!-- Tags field now uses Tagify -->
                        <div class="block text-sm font-medium text-gray-300 md:col-span-2">
                            <label class="mb-2 block" for="tags">Tags</label>
                            <input
                                bind:this={tagsInput}
                                name="tags"
                                id="tags"
                                value={track.tags.map((t) => t.name).join(',')}
                                class="customTagify addTrackTagify tag-tagify {inputClasses}"
                            />
                        </div>
                    </div>

                    <div class="flex justify-end">
                        <button
                            type="submit"
                            class="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            {/if}
        </div>
    </div>
</div>