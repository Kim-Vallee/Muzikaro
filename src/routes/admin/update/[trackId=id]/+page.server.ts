import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllAuthors, getAllStyles, getAllTags, getTrackById, updateTrackById, getAllCovers } from '$lib/server/db/music';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { getAudioDir, getAudioPath, getCoversDir } from '$lib/assets';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

export const load: PageServerLoad = async ({ locals, params }) => {
    const isAuthenticated = Boolean(locals.user);
    if (!isAuthenticated) {
        throw error(403, 'You must be authenticated to update a track.');
    }

    const track = await getTrackById(Number(params.trackId), isAuthenticated);

    if (!track) {
        throw error(404, 'Track not found');
    }

    const allTags = getAllTags(isAuthenticated);
    const allStyles = getAllStyles(isAuthenticated);
    const allAuthors = getAllAuthors(isAuthenticated);

    const allCovers = getAllCovers().filter(
        (cover) => cover.coverUrl !== "default.jpg"
    );

    return {
        track: track,
        allUniqueAuthors: allAuthors,
        allUniqueStyles: allStyles,
        allUniqueTags: allTags,
        allUniqueCovers: allCovers
    };
};

export const actions: Actions = {
    update_track: async ({ locals, request, params }) => {
        const isAuthenticated = Boolean(locals.user);
        if (!isAuthenticated) {
            throw error(403, 'You must be authenticated to update a track.');
        }

        const trackId = Number(params.trackId);
        const existingTrack = await getTrackById(trackId, isAuthenticated);

        if (!existingTrack) {
            return fail(404, { error: 'Track not found.' });
        }

        const formData = await request.formData();
        const title = String(formData.get('title') ?? '').trim();
        const authors = String(formData.get('author') ?? '').trim();
        const description = String(formData.get('description') ?? '').trim();
        const bpm = String(formData.get('bpm') ?? '').trim();
        const styles = String(formData.get('styles') ?? '').trim();
        const setup = String(formData.get('setup') ?? '').trim();
        const tags = String(formData.get('tags') ?? '').trim();
        const audioFile = formData.get('audioFile');
        const coverUrl = String(formData.get('coverSelection') ?? '').trim();
        const coverFile = formData.get('splashArt');
        const values = {
            title,
            author: authors,
            description,
            bpm,
            styles,
            setup,
            tags,
            coverSelection: coverUrl,
            audioFileName: audioFile instanceof File ? audioFile.name : '',
            splashArtName: coverFile instanceof File ? coverFile.name : ''
        };
        const failWithForm = (status: 400 | 500, message: string) =>
            fail(status, { error: message, values });


        const fileTypes = ['wav', 'mp3', 'ogg', 'm4a'];
        const imgFileTypes = ["avif", "gif", "jpeg", "jpg", "png", "webp"];

        if (!title) {
            return failWithForm(400, 'Title is required.');
        }

        if (!authors) {
            return failWithForm(400, 'Author is required.');
        }

        if (!coverUrl) {
            return failWithForm(400, 'Cover is required (you probably broke something).');
        }

        let audioFileName = existingTrack.audioFile;
        let filePath: string = "";
        let duration = existingTrack.duration;
        let shouldSaveNewFile = false;

        try {
            if (audioFile && audioFile instanceof File && audioFile.size > 0) {
                const extension = (audioFile.name.split('.').pop() ?? '').toLowerCase();
                if (!fileTypes.includes(extension)) {
                    return failWithForm(400, 'Unknown extension, allowed extensions are wav, mp3, ogg and m4a.');
                }

                const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'track';
                const uniqueSuffix = Math.random().toString(16).slice(2, 10);
                audioFileName = `${uniqueSuffix}-${safeTitle}.${extension}`;

                // Save new file
                const audioDir = getAudioDir();
                await mkdir(audioDir, { recursive: true });
                filePath = join(audioDir, audioFileName);
                const bytes = await audioFile.arrayBuffer();
                await writeFile(filePath, Buffer.from(bytes));
                shouldSaveNewFile = true;

            }
        } catch (err) {
            console.log(err);
            return failWithForm(500, 'Failed to save file.');
        }

        if (shouldSaveNewFile) {
            const execFileAsync = promisify(execFile);

            try {
                const { stdout } = await execFileAsync('ffprobe', [
                    '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    filePath,
                ]);

                const seconds = Number.parseFloat(stdout.trim());
                if (!Number.isNaN(seconds) && seconds > 0) {
                    duration = seconds;
                } else {
                    return failWithForm(500, 'Internal error while computing the duration.');
                }
            } catch (err) {
                console.log(err);
                return failWithForm(500, 'Internal error while computing the duration.');
            }

            try {
                // Delete old file
                const filePathToDelete = getAudioPath(existingTrack.audioFile);
                await rm(filePathToDelete);
            } catch (err) {
                console.log(err);
                return failWithForm(500, 'Internal error while deleting the file.');
            }
        }

        // SPLASHART PROCESSING
        let validatedCoverUrl = "";

        if (coverUrl.toLowerCase().trim() !== "new" && coverUrl.toLowerCase().trim() !== "default") {
            // Check that the cover filename is not already in use
            const existingCoverURL = getAllCovers();
            if (existingCoverURL.filter((cover) => cover.coverUrl === coverUrl).length == 0) {
                return failWithForm(400, "The cover art selected does not exist.");
            }
            validatedCoverUrl = coverUrl;
        } else if (coverUrl.toLocaleLowerCase() === "default") {
            validatedCoverUrl = "default.jpg";
        } else {
            // Creating a new cover
            try {
                if (coverFile && coverFile instanceof File && coverFile.size > 0) {
                    const splashArtName = coverFile.name.split('.');
                    const splashArtExtension = splashArtName.pop() ?? "";
                    if (!imgFileTypes.includes(splashArtExtension)) {
                        return failWithForm(400, 'Unknown extension for the splash art cover, allowed extensions are avif, gif, jpeg, jpg, png and webp.');
                    }
                    const safeSplashArtFilename = splashArtName.join(".").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "";
                    if (safeSplashArtFilename.trim() === "") {
                        return failWithForm(400, 'Invalid filename for splash art.');
                    }
                    validatedCoverUrl = `${safeSplashArtFilename}.${splashArtExtension}`;

                    const coversDir = getCoversDir();
                    await mkdir(coversDir, { recursive: true });
                    const coverPath = join(coversDir, validatedCoverUrl);
                    const bytes = await coverFile.arrayBuffer();
                    await writeFile(coverPath, Buffer.from(bytes));
                } else {
                    return failWithForm(500, "Failed to process splash art cover.")
                }
            } catch (err) {
                console.log(err);
                return failWithForm(500, "Failed to save splash art cover.")
            }
        }


        try {
            await updateTrackById(trackId, {
                title,
                authors: authors.split(',').map((author) => author.trim()).filter(Boolean),
                description: description || null,
                bpm: bpm ? Number(bpm) : null,
                styles: styles
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                setup: setup || null,
                tags: tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                audioFile: audioFileName,
                coverUrl: validatedCoverUrl,
                duration,
            });


            return { success: true, message: 'Track updated successfully.' };
        } catch (err) {
            console.log(err);

            return failWithForm(500, 'Unable to update the track right now.');
        }
    },
};
