import type { CollectionConfig } from "payload";

const isAdmin = ({ req: { user } }: { req: { user: { role?: string } | null } }) =>
  user?.role === "admin";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role"],
  },
  access: {
    // Accounts are provisioned by an admin, not self-registered. Mirrors
    // real hospital IT onboarding and closes the "anyone can grant
    // themselves doctor access" gap.
    create: isAdmin,
    read: ({ req: { user } }) =>
      user?.role === "admin" ? true : { id: { equals: user?.id } },
    update: ({ req: { user } }) =>
      user?.role === "admin" ? true : { id: { equals: user?.id } },
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "nurse",
      options: [
        { label: "Nurse", value: "nurse" },
        { label: "Doctor", value: "doctor" },
        { label: "Admin", value: "admin" },
      ],
      access: {
        // Only an admin can change roles. A nurse editing their own
        // profile can't promote themselves to doctor/admin.
        update: isAdmin,
      },
    },
  ],
};
