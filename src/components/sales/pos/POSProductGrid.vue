<script setup>
    import Button from "primevue/button";

    // terima properti cartItems dari SalesPOSView
    const props = defineProps({
        cartItems: {
            type: Array,
            default: () => [],
        },
    });

    const emit = defineEmits(["add"]);

    const products = [
        {
            item_variant_id: "1",
            item_name: "Keripik Singkong",
            variant_name: "Pedas Balado",
            sku: "KS-PB-500",
            selling_price: 15000,
            stock: 23,
        },
        {
            item_variant_id: "2",
            item_name: "Keripik Singkong",
            variant_name: "Asin Bawang",
            sku: "KS-AB-500",
            selling_price: 15000,
            stock: 18,
        },
        {
            item_variant_id: "3",
            item_name: "Keripik Singkong",
            variant_name: "Pedas Daun Jeruk",
            sku: "KS-PDJ-500",
            selling_price: 16000,
            stock: 12,
        },
        {
            item_variant_id: "4",
            item_name: "Keripik Pisang",
            variant_name: "Coklat",
            sku: "KP-CK-250",
            selling_price: 12000,
            stock: 15,
        },
        {
            item_variant_id: "5",
            item_name: "Keripik Pisang",
            variant_name: "Keju",
            sku: "KP-KJ-250",
            selling_price: 13000,
            stock: 8,
        },
        {
            item_variant_id: "6",
            item_name: "Basreng",
            variant_name: "Pedas",
            sku: "BR-PD-250",
            selling_price: 10000,
            stock: 31,
        },
    ];

    function formatPrice(value) {
        return new Intl.NumberFormat("id-ID").format(value);
    }

    // helper untuk mencari apakah produk sudah ada di dalam cart
    function getCartQty(product) {
        const cartItem = props.cartItems.find(
            item => item.item_variant_id === product.item_variant_id
        );

        return cartItem?.qty ?? 0;
    }

    // helper untuk menentukan apakah tombol harus disabled
    function isAddDisabled(product) {
        return getCartQty(product) >= product.stock;
    }
</script>

<template>
    <div class="product-grid">
        <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
        >
            <div class="product-icon">
                <i class="pi pi-box"></i>
            </div>

            <div class="product-info">
                <div class="product-name">
                    {{ product.item_name }}
                </div>

                <div class="product-variant">
                    {{ product.variant_name }}
                </div>

                <div class="product-sku">
                    SKU: {{ product.sku }}
                </div>
            </div>

            <div class="product-footer">
                <span class="product-price">
                    Rp {{ formatPrice(product.selling_price) }}
                </span>

                <span
                    class="product-stock"
                    :class="{
                        'stock-low': product.stock <= 5
                    }"
                >
                    Stock {{ product.stock }}
                </span>
            </div>

            <Button
                :label="
                    isAddDisabled(product)
                        ? 'Sold'
                        : 'Add'
                "
                :icon="
                    isAddDisabled(product)
                        ? 'pi pi-check'
                        : 'pi pi-plus'
                "
                :severity="
                    isAddDisabled(product)
                        ? 'secondary'
                        : 'primary'
                "
                size="small"
                fluid
                :disabled="isAddDisabled(product)"
                @click="emit('add', product)"
            />
        </div>
    </div>
</template>

<style scoped>
.product-grid {
    display: grid;

    grid-template-columns: repeat(4, minmax(0, 1fr));

    gap: 10px;
}

/* Responsive */
@media (max-width: 1100px) {
    .product-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 800px) {
    .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 500px) {
    .product-grid {
        grid-template-columns: 1fr;
    }
}

/* ==========================================
   PRODUCT CARD
   ========================================== */

.product-card {
    display: flex;
    flex-direction: column;

    padding: 10px;

    border: 1px solid #e5e7eb;
    border-radius: 8px;

    background: #fff;

    transition:
        border-color .15s ease,
        box-shadow .15s ease;

    min-width: 0;
}

.product-card:hover {
    border-color: #cbd5e1;

    box-shadow:
        0 2px 8px rgba(0, 0, 0, .06);
}


/* ==========================================
   ICON
   ========================================== */

.product-icon {
    width: 36px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    margin-bottom: 12px;

    border-radius: 8px;

    background: #eff6ff;

    color: #2563eb;

    font-size: 20px;
}


/* ==========================================
   PRODUCT INFO
   ========================================== */

.product-info {
    min-width: 0;

    flex: 1;
}

.product-name {
    font-size: 14px;
    font-weight: 600;

    color: #111827;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-variant {
    font-size: 13px;
    margin-top: 2px;

    color: #4b5563;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-sku {
    margin-top: 4%;

    font-size: 12px;

    color: #9ca3af;
}


/* ==========================================
   FOOTER
   ========================================== */

.product-footer {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 6px;

    margin: 10px 0;

    padding-top: 8px;

    border-top: 1px solid #f1f5f9;
}

.product-price {
    font-size: 14px;
    font-weight: 700;

    color: #111827;
}

.product-stock {
    font-size: 12px;

    color: #6b7280;

    white-space: nowrap;
}

.stock-low {
    color: #dc2626;
}
</style>