import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { defineRelations } from 'drizzle-orm';

export const music = sqliteTable('music', {
	id: integer('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	uploadedAt: integer('uploaded_at', { mode: 'timestamp'}).notNull().$defaultFn(() => new Date()),
	bpm: integer('bpm'),
	hidden: integer('hidden', { mode: 'boolean' }).default(false).notNull(),
	setup: text('setup'),
	audioFile: text('audio_file').notNull(),
	coverUrl: text('cover_url').notNull().default('/content/splash/default.png'),
	duration: integer('duration').notNull().default(0),
});

export const authors = sqliteTable('authors', {
	id: integer('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const styles = sqliteTable('styles', {
	id: integer('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey(),
	name: text('name').notNull().unique()
});

// Relational tables

export const musicAuthors = sqliteTable('music_authors', {
    musicId: integer('music_id')
        .notNull()
        .references(() => music.id, { onDelete: 'cascade' }),
    authorId: integer('author_id')
        .notNull()
        .references(() => authors.id, { onDelete: 'cascade' }),
}, (table) => [ primaryKey({ columns: [table.musicId, table.authorId] })]);

export const musicStyles = sqliteTable('music_styles', {
    musicId: integer('music_id')
        .notNull()
        .references(() => music.id, { onDelete: 'cascade' }),
    styleId: integer('style_id')
        .notNull()
        .references(() => styles.id, { onDelete: 'cascade' }),
}, (table) => [ primaryKey({ columns: [table.musicId, table.styleId] })]);

export const musicTags = sqliteTable('music_tags', {
    musicId: integer('music_id')
        .notNull()
        .references(() => music.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
        .notNull()
        .references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [ primaryKey({ columns: [table.musicId, table.tagId] })]);

// Relations

export const relations = defineRelations({ music, authors, styles, tags, musicAuthors, musicStyles, musicTags }, 
	(r) => ({
		music: {
			styles: r.many.styles({
				from: r.music.id.through(r.musicStyles.musicId),
				to: r.styles.id.through(r.musicStyles.styleId),
			}),
			tags: r.many.tags({
				from: r.music.id.through(r.musicTags.musicId),
				to: r.tags.id.through(r.musicTags.tagId),
			}),
			authors: r.many.authors({
				from: r.music.id.through(r.musicAuthors.musicId),
				to: r.authors.id.through(r.musicAuthors.authorId),
			})
		},
		authors: {
			music: r.many.music({
				from: r.authors.id.through(r.musicAuthors.authorId),
				to: r.music.id.through(r.musicAuthors.musicId)
			})
		},
		styles: {
			music: r.many.music({
				from: r.styles.id.through(r.musicStyles.styleId),
				to: r.music.id.through(r.musicStyles.musicId)
			})
		},
		tags: {
			music: r.many.music({
				from: r.tags.id.through(r.musicTags.tagId),
				to: r.music.id.through(r.musicTags.musicId)
			})
		}
	})
)