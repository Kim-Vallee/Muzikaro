import { error } from '@sveltejs/kit';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getCoversDir } from '$lib/assets';
import defaultSplashArt from '$lib/assets/default_splashart.jpg?inline';

const mimeTypes: Record<string, string> = {
    avif: 'image/avif',
    gif: 'image/gif',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

export const GET = async ({ params }) => {
    const filename: string = params.filename;

    if (!filename) {
        throw error(400, 'Missing splash art filename.');
    } else if (filename === "default.jpg") {
        const file = Buffer.from(defaultSplashArt.split(',')[1], 'base64');

        return new Response(file, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    }

    const filePath = join(getCoversDir(), filename);
    const extension = filename.split('.').pop()?.toLowerCase() ?? '';
    const contentType = mimeTypes[extension];

    if (!contentType) {
        throw error(415, 'Unsupported splash art format.');
    }

    try {
        const file = await readFile(filePath);

        return new Response(file, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        throw error(404, 'Splash art not found.');
    }
};