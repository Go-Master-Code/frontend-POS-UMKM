import { z } from "zod";

export const businessProfileSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, "Store name is required."),

    owner_name: z
        .string()
        .trim()
        .min(1, "Owner name is required."),

    phone: z
        .string()
        .trim()
        .min(8, "Phone number must be at least 8 characters.")
        .max(30, "Phone number cannot exceed 30 characters.")
        .regex(
            /^\+?[0-9]+$/,
            "Phone number may only contain digits and an optional leading '+'."
        ),

    email: z
        .string()
        .trim()
        .min(1, "Email is required.")
        .email("Invalid email address."),

    address: z
        .string()
        .trim()
        .min(1, "Address is required."),

    currency: z.string(),

    time_zone: z.string(),

    receipt_footer: z.string(),

    logo: z.string().optional(),

    id: z.string().optional()

});