import { z } from "zod";

// =======================================
// Base schema
// Digunakan oleh Create dan Update
// =======================================

const itemVariantBaseSchema = z.object({

    // Variant
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
        .optional(),

    cost_price: z
        .number({
            required_error: "Cost price is required.",
        })
        .min(0, "Cost price cannot be negative."),

    selling_price: z
        .number({
            required_error: "Selling price is required.",
        })
        .min(0, "Selling price cannot be negative."),

    minimum_stock: z
        .number({
            required_error: "Minimum stock is required.",
        })
        .int("Minimum stock must be an integer.")
        .min(0, "Minimum stock cannot be negative."),

    is_active: z.boolean(),

});

// =======================================
// Create Schema
// Tambahan Initial Stock
// =======================================

export const createItemVariantSchema = itemVariantBaseSchema
    .extend({
        initial_stock: z
            .number({
                required_error: "Initial stock is required.",
            })
            .int("Initial stock must be an integer.")
            .min(0, "Initial stock cannot be negative."),

    })
    .refine(
        (data) => data.selling_price >= data.cost_price,
        {
            path: ["selling_price"],
            message: "Selling price must be greater than or equal to cost price.",
        }
    );

// =======================================
// Update Schema
// Tidak memiliki Initial Stock
// =======================================

export const updateItemVariantSchema = itemVariantBaseSchema
    .refine(
        (data) => data.selling_price >= data.cost_price,
        {
            path: ["selling_price"],
            message: "Selling price must be greater than or equal to cost price.",
        }
    );