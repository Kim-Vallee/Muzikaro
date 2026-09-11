import path from 'node:path';
import { AUDIO_DIR, COVERS_DIR } from "$env/static/private";

export const getAudioDir = (): string => {
    const audioDir = AUDIO_DIR;

    if (!audioDir) {
        throw new Error('AUDIO_DIR env variable not defined');
    }

    return path.resolve(audioDir);
};

export const getCoversDir = (): string => {
    if (!COVERS_DIR) {
        throw new Error('COVERS_DIR env variable not defined');
    }

    return path.resolve(COVERS_DIR);
};

export const getAudioPath = (filename: string): string =>
    path.join(getAudioDir(), filename);

export const getCoverPath = (filename: string): string =>
    path.join(getCoversDir(), filename);