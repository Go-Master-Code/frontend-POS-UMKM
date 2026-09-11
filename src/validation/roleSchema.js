import { z } from "zod";

export const roleSchema = z.object({
    name: z.string().trim().min(3, "Role name is required.")
});