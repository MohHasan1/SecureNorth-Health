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

// Picked from the DATABASE_URI value itself, not NODE_ENV. `next build`
// always sets NODE_ENV=production internally, even for a local build with
// no Mongo instance around, so branching on NODE_ENV would force a Mongo
// connection any time someone runs `pnpm build` locally. A mongodb:// or
// mongodb+srv:// URI means Mongo, anything else (including unset) falls
// back to the local SQLite file.
const databaseUri = process.env.DATABASE_URI || "file:./db.sqlite";
const db = databaseUri.startsWith("mongodb")
  ? mongooseAdapter({ url: databaseUri })
  : sqliteAdapter({ client: { url: databaseUri } });

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
