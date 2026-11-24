# Muzikaro

A lightweight, self-hosted music portfolio built with SvelteKit and tailwindCSS.

<table>
  <tr>
    <td align="center" width="50%">
      <strong>Admin interface to Muzikaro</strong>
    </td>
    <td align="center" width="50%">
      <strong>Visitor interface to Muzikaro</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="static/muzikaro_admin.png" alt="Muzikaro admin screenshot" width="100%">
    </td>
    <td align="center" width="50%">
      <img src="static/muzikaro_base.png" alt="Muzikaro visitor screenshot" width="100%">
    </td>
  </tr>
</table>

[Live demo](muzikaro.kimvallee.fr)

## General information

This website is a lightweight self-hosted alternative to soundcloud and serves as a portfolio. It has the following features:
* Interface to add / remove / update music
* Metadata handling such as:
  * Time of upload
  * Title
  * Authors
  * BPM
  * Styles
  * Setup
  * Description
  * Tags
  * Splash art covers
* A waveform interface provided by waveform.js
* Search and filtering by title, author, tag and music style
* A tagging system

## Tech stack

* [SvelteKit](https://svelte.dev/)
* [Better auth](https://better-auth.com/docs/installation) with [SvelteKit](https://better-auth.com/docs/integrations/svelte-kit)
* [TailwindCSS](https://tailwindcss.com/) for the design
* [Drizzle ORM](https://svelte.dev/docs/cli/drizzle) + SQLite for the database
* [WaveSurfer.js](https://wavesurfer.xyz/) (for the waveform of the sound)



## Installation

### Requirements

The app requires Node.js 24 or later, pnpm and ffprobe:

- [NodeJS](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)
- [ffprobe (ffmpeg)](https://ffmpeg.org/download.html)

### Setup

First, create a [GitHub OAuth app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app). Set its callback URL to `http://localhost:5173/api/auth/callback/github` for local development, or `<BETTER_AUTH_URL>/api/auth/callback/github` in production.

Clone the project and install its dependencies:

```bash
git clone https://github.com/Kim-Vallee/Muzikaro.git
cd Muzikaro
pnpm install
```

Copy `.env.example` to `.env` and fill in the required values (see [Environment variables](#environment-variables)):

```bash
cp .env.example .env
```

Make sure `ffprobe` is available on your `PATH` and that the audio and cover directories exist and are writable.

Apply the database migrations:

```bash
pnpm run db:migrate
```

Start the development server:

```bash
pnpm run dev
```

### Environment variables

| Variable | Description | Required |
|---|---|---|
| `DEBUG` | Whether to use debug mode. When set to yes, authentification does not go through GitHub and is fully local.<br> THIS MEANS ANYONE CAN MESS WITH YOU WEBSITE, DO NOT USE IN PRODUCTION.  | Yes |
| `BETTER_AUTH_SECRET` | Secret used by Better Auth | Yes |
| `BETTER_AUTH_URL` | Public URL of the application used for the GitHub app | Yes |
| `DATABASE_URL` | URL of the database (e.g. `database.db`) | Yes |
| `CLIENT_ID_GITHUB` | Client ID of the GitHub app | Yes |
| `CLIENT_SECRET_GITHUB` | Client secret of the Github app | Yes |
| `AUDIO_DIR` | Absolute path to your audio files | Yes |
| `COVERS_DIR` | Absolute path to your splash art cover files | Yes |
| `DEFAULT_SPLASHART` | Absolute path to your defaut cover splash art. If none is given, the app default is taken. | No |
| `PRODUCTION_HOST` | The host IP in production | Production only |
| `PRODUCTION_PORT` | The port to use in production | Production only |
| `PRODUCTION_ORIGIN` | Your website URL, likely the same as `BETTER_AUTH_URL` | Production only |

The `BETTER_AUTH_SECRET` variable can be generated with the command `openssl rand -base64 32`.

## Contribution and dev

### Guidelines

Contributions are welcome. Please open an issue before implementing
substantial changes.

1. Fork the repository
2. Create a branch
3. Make your changes
4. Run the tests/checks (no test implemented in v0.1.0)
5. Open a pull request

### Handling the database

The database schema are found in `src/lib/server/db/schema.ts` and once updated, the procedure to generate migrations is:
1. `pnpm run db:generate` to generate the migration files
2. `pnpm run db:migrate` to migrate to apply the migration

A fast forward, but not recommended option is to use `pnpm run db:push` which ignores the previously mentioned commands and directly applies the update, only useful in dev mode.

The general methods to access the db are in `src/lib/server/db/music.ts`.

### Testing

Testing is done with [Vitest](https://svelte.dev/docs/svelte/testing). You can run the tests with:

```bash
pnpm run test
```

### Deploy

The app uses [adapter-node](https://svelte.dev/docs/kit/adapter-node). On the production server, install Node.js 24 or later, pnpm and ffprobe. Configure the production values in `.env` before building, and make sure the audio and cover directories exist and are writable.

From the project directory, install dependencies, apply database migrations and build the app:

```bash
pnpm install --frozen-lockfile
pnpm run db:migrate
pnpm run build
cp package.json pnpm-lock.yaml build/
cd build/
pnpm ci --prod
cd ..
node --env-file=.env build
```

Keep `.env` in the project directory when starting the server. Set `PRODUCTION_HOST` and `PRODUCTION_PORT` to configure the listening address and port.

To run the server with socket activation, see the [adapter-node socket activation guide](https://svelte.dev/docs/kit/adapter-node#Socket-activation).

## License

Muzikaro is released under the GPLv3 License. See [LICENSE](LICENSE) file.
