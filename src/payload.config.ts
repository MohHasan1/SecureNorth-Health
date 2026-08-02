import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { AccessLogs } from "./collections/AccessLogs";
import { PatientRecords } from "./collections/PatientRecords";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Local dev uses a zero-setup SQLite file — nothing to install, nothing to
// run. Production uses MongoDB, since that's what an actual deployment
// (Vercel/Render/etc.) would point at. Same DATABASE_URI env var either
// way, just a different connection string format for each environment.
const db =
  process.env.NODE_ENV === "production"
    ? mongooseAdapter({ url: process.env.DATABASE_URI || "" })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./db.sqlite" } });

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, PatientRecords, AccessLogs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
});
