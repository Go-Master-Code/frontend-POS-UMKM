import { z } from "zod";

export const customerSchema = z.object({
    name: z.string().trim().min(1, "Name is required."),
    phone: z
        .string()
        .trim()
        .min(8, "Phone number must be at least 8 characters.")
        .max(30, "Phone number cannot exceed 30 characters.")
        .regex(
            /^\+?[0-9]+$/,
            "Phone number may only contain digits and an optional leading '+'."
        ),
    is_active: z.boolean()
});