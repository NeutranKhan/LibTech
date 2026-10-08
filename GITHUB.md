# LibTech on GitHub

Repository: [NeutranKhan/LibTech](https://github.com/NeutranKhan/LibTech). The existing repository is public. Source files belong at its root; private credentials and local test artifacts are excluded.

The `LibTech-source.zip` delivery contains source code, course content, tests and setup documentation. It excludes dependencies, build caches, local account data and `.env.local`.

## Upload the project

1. Extract the source archive on your computer.
2. Create your GitHub repository. A private repository is suitable while the curriculum and launch details are being prepared.
3. Upload the extracted files and folders. Put `package.json`, `src`, `public` and `vercel.json` at the repository root; upload the extracted contents rather than the ZIP itself.
4. Include hidden configuration files such as `.gitignore` and `.env.example`.
5. Connect the repository to Vercel and follow [VERCEL.md](VERCEL.md). If the source is at the repository root, no custom Root Directory is required.

For a Git client or terminal, initialize a repository in this source directory, review the files selected for the first commit, and connect it to your new GitHub repository. The checked-in `.gitignore` excludes local secrets, generated records, dependencies and build output.

## Configuration belongs outside the repository

- `.env.example` contains variable names and blank credential fields; it is safe to commit.
- Keep Firebase Admin private keys and the OpenAI API key in your local `.env.local` and Vercel's server environment variables.
- Do not upload service-account JSON files, local databases, screenshots containing private records or real payment details.
- Firebase browser configuration uses `NEXT_PUBLIC_FIREBASE_*` variables. Never add that prefix to an Admin private key or OpenAI key.

Once connected, use GitHub changes to update the application through Vercel. Course content created through the live admin studio is stored in Firebase; it is separate from the sample curriculum in `src/lib/seed.ts`.

## Further courses

The next content phase will expand LibTech into several comprehensive courses. Use substantial modules, focused lessons, guided exercises, practical projects and assessments. The existing studio supports multiple courses and ordered modules/lessons. For a significantly larger curriculum, review the documented per-course content limit before authoring; split course content into separate lesson documents when needed.
