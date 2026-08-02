import type { CollectionConfig } from "payload";

// Written only by the system (PatientRecords' afterRead hook, via
// overrideAccess), never by a client request — so create is locked down
// entirely here and access control is enforced at the write site instead.
export const AccessLogs: CollectionConfig = {
  slug: "access-logs",
  admin: {
    useAsTitle: "id",
    defaultColumns: ["user", "record", "action", "createdAt"],
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => user?.role === "admin",
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      required: true,
    },
    {
      // Not required: audit log entries must survive the record they
      // reference being deleted (an admin deleting a record shouldn't also
      // erase the evidence that it once existed and was read) — SQLite
      // nulls this out on delete instead of blocking the delete entirely,
      // which it can't do if the column is NOT NULL.
      name: "record",
      type: "relationship",
      relationTo: "patient-records",
      required: false,
    },
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        { label: "Read", value: "read" },
        { label: "Tamper (demo)", value: "tamper" },
      ],
    },
  ],
};
