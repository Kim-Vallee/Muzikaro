import type { Actions, PageServerLoad } from "./$types";
import { deleteTrackById, getAllTags, getAllStyles, getTrackById, getTracksWithQuery, hideTrackById, showTrackById, type Track } from "$lib/server/db/music";
import { error, fail, redirect } from "@sveltejs/kit";
import { getAudioPath } from "$lib/assets";
import { rm } from "node:fs/promises";

export const load: PageServerLoad = async ({ locals, url }) => {
    let isAuthenticated = Boolean(locals.user);

    // Clean URL before any db call

    const URLparams = new URLSearchParams(url.searchParams);
    for (const [key, value] of URLparams.entries()) {
        if (!value.trim()) {
            URLparams.delete(key);
        }
    }

    // Validating the page
    const page_parameter = URLparams.get("p") || "0";
    const page_as_int = Number.parseInt(page_parameter);
    if ( Number.isNaN(page_as_int) || page_as_int <= 1) {
        URLparams.delete("p");
    }

    const cleanUrl = URLparams.toString();
    
    if (cleanUrl !== url.searchParams.toString()) {
        if (!cleanUrl) {
            throw redirect(303, "/");
        }
        throw redirect(303, `/?${cleanUrl}`);
    }

    const current_page = Number.parseInt(url.searchParams.get("p") ?? "1");

    // Filter tracks by search params
    const titleAuthorSearch = (url.searchParams.get("title-author-search") ?? "").toLowerCase();

    const tagsSearch = (url.searchParams.get("tag-filter") ?? "")
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    const styleSearch = (url.searchParams.get("style-filter") ?? "")
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const { tracks, total, totalPages } = await getTracksWithQuery(titleAuthorSearch, tagsSearch, styleSearch, page_as_int, 10, isAuthenticated);
    
    if (totalPages < page_as_int) {
        // Then set page to 1 and reset
        url.searchParams.delete("p");
        throw redirect(303, `/?${url.searchParams.toString()}`);
    }

    const allTags = getAllTags(isAuthenticated);

    const allStyles = getAllStyles(isAuthenticated);

    return {
        tracks: tracks,
        currentPage: current_page,
        totalPages: totalPages,
        totalTracks: total,
        allTags: allTags,
        allStyles: allStyles,
    };
};

export const actions: Actions = {
    delete_track: async ({ locals, request }) => {
        const isAuthenticated = Boolean(locals.user);
        if (!isAuthenticated) {
            throw error(403, 'You must be authenticated to delete a track');
        }

        const formData = await request.formData();
        const trackId = Number.parseInt(String(formData.get('trackId') ?? ''));

        if (!trackId || Number.isNaN(trackId)) {
            return fail(400, { error: 'Track Id is not valid' });
        }

        const deletedTrack = await deleteTrackById(trackId);

        if (!deletedTrack) {
            return fail(400, { error: "No track corresponding to this Id" });
        }

        const filePath = getAudioPath(deletedTrack.audioFile);

        try {
            await rm(filePath);
        } catch (err) {
            console.log(err);
            throw error(500, "Error while deleting the file");
        }

        return { success: true, message: `Track ${deletedTrack.title} (id ${deletedTrack.id}) was deleted successfully.` };
    },
    hide_track: async ({ locals, request }) => {
        const isAuthenticated = Boolean(locals.user);
        if (!isAuthenticated) {
            throw error(403, 'You must be authenticated to change the visibility of a track');
        }

        const formData = await request.formData();
        const trackId = Number.parseInt(String(formData.get('trackId') ?? ''));

        if (!trackId || Number.isNaN(trackId)) {
            return fail(400, { error: 'Track Id is not valid' });
        }

        const track = await getTrackById(trackId, true);

        if (!track) {
            return fail(400, { error: "No track corresponding to this Id" });
        }

        if (track.hidden) {
            await showTrackById(track.id);
            return { success: true, message: `Track ${track.title} (id ${track.id}) was shown successfully.` };
        }

        await hideTrackById(track.id);

        return { success: true, message: `Track ${track.title} (id ${track.id}) was hidden successfully.` };
    }
}