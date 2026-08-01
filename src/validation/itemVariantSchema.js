import { z } from "zod";

export const itemVariantSchema = z.object({
    // variant
    variant_name: z
        .string()
        .trim()
        .min(1, "Variant name is required.")
        .max(150, "Maximum 150 characters."),

    sku: z
        .string()
        .trim()
        .min(1, "SKU is required.")
        .max(100, "Maximum 100 characters."),

    barcode: z
        .string()
        .trim()
        .max(100, "Maximum 100 characters.")
        .optional(), // artinya tidak harus diisi, di db pun allow null

    // Cost Price
    cost_price: z
        .number({
            required_error: "Cost price is required.",
        })
        .min(0, "Cost price cannot be negative."),

     // Selling Price
    selling_price: z
        .number({
            required_error: "Selling price is required.",
        })
        .min(0, "Selling price cannot be negative."),

     // Current Stock
    initial_stock: z
        .number({
            required_error: "Initial stock is required.",
        })
        .int("Current stock must be an integer.")
        .min(0, "Initial stock cannot be negative."),

    // Minimum Stock
    minimum_stock: z
        .number({
            required_error: "Minimum stock is required.",
        })
        .int("Minimum stock must be an integer.")
        .min(0, "Minimum stock cannot be negative."),

    // Status
    is_active: z.boolean(),

})
.refine( // validasi membandingkan selling price dengan cost price
    (data) => data.selling_price >= data.cost_price,
    {
        path: ["selling_price"],
        message: "Selling price must be greater than or equal to cost price.",
    }
);