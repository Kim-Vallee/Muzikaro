import type { PageServerLoad } from "./$types";
import { getTrackById } from "$lib/server/db/music";
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals, params }) => {
    let isAuthenticated = Boolean(locals.user);
    let track = await getTrackById(Number(params.track), isAuthenticated);
    if (!track) {
        error(404, {
            message: 'Track does not exist'
        });
    }
    return {
        track: {
            ...track,
            audioUrl: `/content/track/${track.audioFile}`,
        },
        isAuthenticated: isAuthenticated,
    };
};