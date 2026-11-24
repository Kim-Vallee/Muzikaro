import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    let isAuthenticated = Boolean(locals.user);

    return {
        isAuthenticated: isAuthenticated
    };
};