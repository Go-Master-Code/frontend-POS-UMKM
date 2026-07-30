import { z } from "zod";

export const catalogItemSchema = z.object({
    name: z.string().trim().min(1, "Category item is required."),
    category_id: z.string().trim().min(1, "Catalog category is required."),
    is_active: z.boolean()
});