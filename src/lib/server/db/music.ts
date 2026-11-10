import { db } from ".";
import {
    music,
    authors,
    styles,
    tags,
    musicAuthors,
    musicStyles,
    musicTags
} from "./schema";
import { eq, like, desc, or, sql, exists, and, count, SQL, notExists } from "drizzle-orm";

export type Track = {
    id: number;
    title: string;
    authors: { id: number, name: string }[];
    description?: string | null;
    uploadedAt?: Date | null;
    bpm?: number | null;
    styles?: { id: number, name: string }[];
    hidden: boolean;
    setup?: string | null;
    tags?: { id: number, name: string }[];
    coverUrl: string;
    audioFile: string;
    duration: number;
};

export const getTracksWithQuery = async (
    titleAuthor: string,
    tagNames: string[],
    styleNames: string[],
    page: number = 1,
    pageSize: number = 10,
    showHidden: boolean = false) => {
    const conditions: SQL[] = [];

    if (titleAuthor.trim() != '') {
        const search = `%${titleAuthor.trim().toLowerCase()}%`;

        const condition = or(
            like(sql`lower(${music.title})`, search),
            exists(
                db.select({ one: sql`1` })
                    .from(musicAuthors)
                    .innerJoin(authors, eq(musicAuthors.authorId, authors.id))
                    .where(
                        and(
                            eq(musicAuthors.musicId, music.id),
                            like(sql`lower(${authors.name})`, search)
                        )
                    )
            )
        );

        if (condition) conditions.push(condition);
    }

    for (const tagName of tagNames) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(musicTags)
                    .innerJoin(tags, eq(musicTags.tagId, tags.id))
                    .where(
                        and(
                            eq(musicTags.musicId, music.id),
                            eq(tags.name, tagName)
                        )
                    )
            )
        );
    }

    for (const styleName of styleNames) {
        conditions.push(
            exists(
                db.select({ one: sql`1` })
                    .from(musicStyles)
                    .innerJoin(styles, eq(musicStyles.styleId, styles.id))
                    .where(
                        and(
                            eq(musicStyles.musicId, music.id),
                            eq(styles.name, styleName)
                        )
                    )
            )
        );
    }

    if (!showHidden) {
        conditions.push(eq(music.hidden, false));
    }

    const offset = Math.max(0, page - 1) * pageSize;

    const matching_tracks = await db.select({ id: music.id }).from(music).where(and(...conditions)).orderBy(desc(music.uploadedAt)).limit(pageSize).offset(offset);
    const ids = matching_tracks.map((track) => track.id);

    const [{ total }] = await db.select({ total: count() }).from(music).where(and(...conditions));

    const totalPages = Math.ceil(total / pageSize);

    if (ids.length === 0) {
        return {
            tracks: [],
            total,
            page,
            pageSize,
            totalPages
        }
    }

    const tracks = await db.query.music.findMany({
        where: {
            id: {
                in: ids
            }
        },
        with: {
            tags: true,
            styles: true,
            authors: true
        },

        orderBy: (music, { desc }) => [
            desc(music.uploadedAt)
        ],
    });

    return {
        tracks,
        total,
        page,
        pageSize,
        totalPages
    }
}

export const getAllAuthors = (
    showHidden: boolean = false
) => {
    let sql_query = db.select().from(authors).$dynamic();

    if (!showHidden) {
        sql_query = sql_query.where(
            exists(
                db.select({ one: sql`1` })
                    .from(musicAuthors)
                    .innerJoin(music, eq(musicAuthors.musicId, music.id))
                    .where(
                        and(
                            eq(musicAuthors.authorId, authors.id),
                            eq(music.hidden, false)
                        ))
            )
        );
    }

    return sql_query.all();
}

export const getAllCovers = () => {
    let sql_query = db.selectDistinct({ coverUrl: music.coverUrl }).from(music).orderBy(music.coverUrl);

    return sql_query.all();
}

export const getAllTags = (
    showHidden: boolean = false
) => {

    let sql_query = db.select().from(tags).$dynamic();

    if (!showHidden) {
        sql_query = sql_query.where(
            exists(
                db.select({ one: sql`1` })
                    .from(musicTags)
                    .innerJoin(music, eq(musicTags.musicId, music.id))
                    .where(
                        and(
                            eq(musicTags.tagId, tags.id),
                            eq(music.hidden, false)
                        ))
            )
        );
    }

    return sql_query.all();
}

export const getAllStyles = (
    showHidden: boolean = false
) => {
    let sql_query = db.select().from(styles).$dynamic();

    if (!showHidden) {
        sql_query = sql_query.where(
            exists(
                db.select({ one: sql`1` })
                    .from(musicStyles)
                    .innerJoin(music, eq(musicStyles.musicId, music.id))
                    .where(
                        and(
                            eq(musicStyles.styleId, styles.id),
                            eq(music.hidden, false)
                        )
                    )
            )
        );
    }

    return sql_query.all();
}

export const getTrackById = async (id: number, showHidden: boolean) => {
    if (showHidden) {
        return db.query.music.findFirst({
            where: {
                id: {
                    eq: id
                },
            },
            with: {
                tags: true,
                styles: true,
                authors: true
            }
        });
    }
    return db.query.music.findFirst({
        where: {
            id: {
                eq: id
            },
            hidden: false
        },
        with: {
            tags: true,
            styles: true,
            authors: true
        }
    });
}

export const getTrackByFilename = async (filename: string, showHidden: boolean) => {
    if (showHidden) {
        return db.query.music.findFirst({
            where: {
                audioFile: {
                    eq: filename
                },
            },
            columns: {
                id: true
            }
        });
    }
    return db.query.music.findFirst({
        where: {
            audioFile: {
                eq: filename
            },
            hidden: false
        },
        columns: {
            id: true
        }
    });
}

export const hideTrackById = async (id: number) => {
    return db.update(music)
        .set({
            hidden: true
        }).where(eq(music.id, id));
}

export const showTrackById = async (id: number) => {
    return db.update(music)
        .set({
            hidden: false
        }).where(eq(music.id, id));
}


const getOrCreateEntity = (
    table: typeof authors | typeof styles | typeof tags,
    name: string
): number => {
    const existing = db.select({ id: table.id })
        .from(table)
        .where(eq(table.name, name))
        .limit(1)
        .get();
    if (existing) return existing.id;

    const [newEntity] = db.insert(table)
        .values({ name: name.trim() })
        .returning({ id: table.id })
        .all();
    return newEntity.id;
};

export const updateTrackById = async (id: number, input: {
    title: string;
    authors: string[];
    description?: string | null;
    bpm?: number | null;
    styles?: string[] | null;
    setup?: string | null;
    tags?: string[] | null;
    audioFile: string;
    coverUrl: string;
    duration: number;
}) => {
    const tagNames = input.tags?.filter(Boolean) ?? [];
    const styleNames = input.styles?.filter(Boolean) ?? [];
    const authorNames = input.authors.filter(Boolean) ?? [];

    // Decide which fields to update on the music record
    const musicUpdateData: Record<string, any> = {};
    musicUpdateData.title = input.title.trim();
    musicUpdateData.description = input.description?.trim() || null;
    musicUpdateData.bpm = input.bpm ?? null;
    musicUpdateData.setup = input.setup?.trim() || null;
    musicUpdateData.audioFile = input.audioFile.trim();
    musicUpdateData.duration = input.duration;
    musicUpdateData.coverUrl = input.coverUrl;

    return db.transaction(() => {
        // 1. Update the music record (only if there are changes)
        if (Object.keys(musicUpdateData).length > 0) {
            db.update(music)
                .set(musicUpdateData)
                .where(eq(music.id, id))
                .run();
        }

        // 2. Replace authors (only if the field was provided)
        // Delete all existing author links for this track
        db.delete(musicAuthors).where(eq(musicAuthors.musicId, id)).run();

        // Insert new ones
        for (const authorName of authorNames) {
            const authorId = getOrCreateEntity(authors, authorName);
            db.insert(musicAuthors).values({
                musicId: id,
                authorId,
            }).onConflictDoNothing().run();
        }

        // Delete orphaned authors
        db.delete(authors).where(
            notExists(
                db.select({ one: sql`1` })
                    .from(musicAuthors)
                    .where(eq(musicAuthors.authorId, authors.id))
            )
        )
            .run();

        // 3. Replace styles
        db.delete(musicStyles).where(eq(musicStyles.musicId, id)).run();

        for (const styleName of styleNames) {
            const styleId = getOrCreateEntity(styles, styleName);
            db.insert(musicStyles).values({
                musicId: id,
                styleId,
            }).onConflictDoNothing().run();
        }

        // Delete orphaned styles
        db.delete(styles)
            .where(
                notExists(
                    db.select({ one: sql`1` })
                        .from(musicStyles)
                        .where(eq(musicStyles.styleId, styles.id))
                )
            )
            .run();

        // 4. Replace tags
        db.delete(musicTags).where(eq(musicTags.musicId, id)).run();

        for (const tagName of tagNames) {
            const tagId = getOrCreateEntity(tags, tagName);
            db.insert(musicTags).values({
                musicId: id,
                tagId,
            }).onConflictDoNothing().run();
        }

        // Delete orphaned tags
        db.delete(tags)
            .where(
                notExists(
                    db.select({ one: sql`1` })
                        .from(musicTags)
                        .where(eq(musicTags.tagId, tags.id))
                )
            )
            .run();

        return id;
    });
};

export const deleteTrackById = async (id: number) => {
    return db.transaction(() => {

        const [track] = db.delete(music).where(eq(music.id, id)).returning().all();

        if (!track) {
            return null;
        }

        // Delete orphaned authors
        db.delete(authors)
            .where(
                notExists(
                    db.select({ one: sql`1` })
                        .from(musicAuthors)
                        .where(eq(musicAuthors.authorId, authors.id))
                )
            )
            .run();

        // Delete orphaned styles
        db.delete(styles)
            .where(
                notExists(
                    db.select({ one: sql`1` })
                        .from(musicStyles)
                        .where(eq(musicStyles.styleId, styles.id))
                )
            )
            .run();

        // Delete orphaned tags
        db.delete(tags)
            .where(
                notExists(
                    db.select({ one: sql`1` })
                        .from(musicTags)
                        .where(eq(musicTags.tagId, tags.id))
                )
            )
            .run();

        return track;
    });
}

export const createTrack = async (input: {
    title: string;
    authors: string[];
    description?: string | null;
    uploadedAt?: Date | null;
    bpm?: number | null;
    styles?: string[] | null;
    setup?: string | null;
    tags?: string[] | null;
    audioFile: string;
    coverUrl: string;
    duration: number;
}) => {
    const authorsToInsert = input.authors.filter(name => name.trim() !== '') ?? [];
    const tagsToInsert = input.tags?.filter(Boolean) ?? [];
    const stylesToInsert = input.styles?.filter(Boolean) ?? [];

    return db.transaction(() => {
        const [newTrack] = db.insert(music).values({
            title: input.title.trim(),
            description: input.description?.trim() || null,
            uploadedAt: input.uploadedAt ?? new Date(),
            bpm: input.bpm ?? null,
            setup: input.setup?.trim() || null,
            audioFile: input.audioFile.trim(),
            coverUrl: input.coverUrl,
            duration: input.duration,
        }).returning({ id: music.id }).all();

        const trackId = newTrack.id;

        // 3. Process authors
        for (const authorName of authorsToInsert) {
            const authorId = getOrCreateEntity(authors, authorName);
            db.insert(musicAuthors).values({
                musicId: trackId,
                authorId: authorId,
            }).onConflictDoNothing().run(); // sync
        }

        // 4. Process styles
        for (const styleName of stylesToInsert) {
            const styleId = getOrCreateEntity(styles, styleName);
            db.insert(musicStyles).values({
                musicId: trackId,
                styleId: styleId,
            }).onConflictDoNothing().run();
        }

        // 5. Process tags
        for (const tagName of tagsToInsert) {
            const tagId = getOrCreateEntity(tags, tagName);
            db.insert(musicTags).values({
                musicId: trackId,
                tagId: tagId,
            }).onConflictDoNothing().run();
        }

        return trackId;
    });
};
