import { z } from "zod";

export const catalogCategorySchema = z.object({
    name: z.string().trim().min(1, "Category name is required.")
});