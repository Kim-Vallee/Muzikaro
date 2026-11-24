import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deleteCoverFromTracks, getAllCovers } from "$lib/server/db/music";
import { deleteCoverFile, getCoversDir } from "$lib/assets";

export const load: PageServerLoad = ({ locals }) => {
    if (!locals.user) {
        throw error(403, 'You do not have access to this page.');
    }

    const allCovers = getAllCovers();

    return {
        debugMode: locals.debugMode ?? false,
        debugAuthenticated: locals.debugAuthenticated ?? false,
        allCovers: allCovers,
    }
};

export const actions: Actions = {
    deleteSplashart: async ({ locals, request }) => {
        if (!locals.user) {
            throw error(403, 'You must be authenticated to delete a splash art cover.');
        }

        const formData = await request.formData();
        const coverUrl = String(formData.get('splashart') ?? '').trim();

        // Delete cover from db
        const coversUpdated = await deleteCoverFromTracks(coverUrl);

        // Delete cover file;
        try {
            await deleteCoverFile(coverUrl);
            return { success: true, message: 'Cover ' + coverUrl + ' deleted successfully (' + coversUpdated.changes + ' changed)' };
        } catch (cause) {
            return { error: true, message: 'Could not delete the splash art file ' + coverUrl + ' (' + coversUpdated.changes + ' changes in the database).', errorMessage: cause };
        }
    }
};
