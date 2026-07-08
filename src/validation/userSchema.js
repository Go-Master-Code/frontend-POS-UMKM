import { z } from "zod";

const baseSchema = {
    full_name: z.string().trim().min(1, "Full Name is required."),
    username: z.string().trim().min(1, "Username is required."),
    phone: z
        .string()
        .trim()
        .min(8, "Phone number must be at least 8 characters.")
        .max(30, "Phone number cannot exceed 30 characters.")
        .regex(
            /^\+?[0-9]+$/,
            "Phone number may only contain digits and an optional leading '+'."
        ),
    role_id: z.string().trim().min(1, "Role is required."),
    is_active: z.boolean()
};

export const createUserSchema = z.object({
    ...baseSchema,
    password: z
        .string()
        .trim()
        .min(6, "Password minimum 6 characters.")
});

export const updateUserSchema = z.object({
    ...baseSchema
});