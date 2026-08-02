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
      name: "record",
      type: "relationship",
      relationTo: "patient-records",
      required: true,
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
