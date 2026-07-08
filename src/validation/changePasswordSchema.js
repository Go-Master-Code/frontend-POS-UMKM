import { z } from "zod";

export const changePasswordSchema = z.object({
    old_password: z
        .string()
        .trim()
        .min(1, "Current password is required."),

    new_password: z
        .string()
        .trim()
        .min(6, "New password minimum 6 characters."),
    
    confirm_password: z
        .string()
        .trim()
})
.refine(
    data => data.new_password !== data.old_password,
    {
        path: ["new_password"],
        message: "New password must be different from current password."
    }
)
.refine(
    data => data.new_password === data.confirm_password,
    {
        path: ["confirm_password"],
        message: "Password confirmation does not match."
    }
)