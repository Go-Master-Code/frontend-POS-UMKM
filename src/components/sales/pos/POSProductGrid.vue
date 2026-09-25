<script setup>
    import Button from "primevue/button";

    // terima properti cartItems dari SalesPOSView
    // jadi, POSProductGrid menerima products dan cartItems dari PARENT
    const props = defineProps({
        cartItems: {
            type: Array,
            default: () => [],
        },
        products: {
            type: Array,
            default: () => [],
        },
    });

    const emit = defineEmits(["add"]);

    function formatPrice(value) {
        return new Intl.NumberFormat("id-ID").format(value);
    }

    // helper untuk mencari apakah produk sudah ada di dalam cart
    function getCartQty(product) {
        const cartItem = props.cartItems.find(
            item => item.id === product.id
        );

        return cartItem?.qty ?? 0;
    }

    // ============================================================================
    // CHECK ADD BUTTON
    // ============================================================================
    //
    // Tombol Add disabled ketika quantity di cart sudah mencapai stock.
    //
    // Contoh:
    //
    // Stock       = 8
    // Cart        = 8
    // Add         = disabled
    //
    // Dengan demikian kasir tidak bisa menambahkan quantity ke-9.
    //
    // ============================================================================

    // helper untuk menentukan apakah tombol harus disabled
    function isAddDisabled(product) {
        return getCartQty(product) >= product.current_stock;
    }
</script>

<template>
    <!-- Jika item variants dari suatu category belum ada -->
    <div
        v-if="props.products.length === 0"
        class="product-empty"
    >
        <i class="pi pi-search"></i>

        <strong>
            No items found.
        </strong>

        <span>
            This category has no products.
        </span>
    </div>
    <div
        v-else
        class="product-grid"
    >
        <div
            v-for="product in props.products"
            :key="product.id"
            class="product-card"
        >
            <!-- <div class="product-icon">
                <i class="pi pi-box"></i>
            </div> -->

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
                        'stock-low': product.current_stock <= 5
                    }"
                >
                    Stock: {{ product.current_stock }}
                </span>
            </div>

            <!-- Add to cart -->
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
    .product-sku {
        display: none; /* SKU tidak perlu tampil di mobile*/
    }
    .product-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/*
@media (max-width: 500px) {
    .product-grid {
        grid-template-columns: 1fr;
    }
}
*/

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
    font-weight: 600;
    margin-top: 2px;

    color: #17991e;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-sku {
    margin-top: 4px;

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
    font-weight: 600;

    color: #6b7280;

    white-space: nowrap;
}

.stock-low {
    color: #dc2626;
}

/* CSS untuk catalog item yang belum mempunyai variants */
.product-empty {
    min-height: 280px;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    gap: 8px;

    text-align: center;

    color: var(--text-color-secondary);
}


.product-empty i {
    font-size: 32px;

    margin-bottom: 6px;

    color: var(--text-color-secondary);
}


.product-empty strong {
    font-size: 15px;

    font-weight: 600;

    color: var(--text-color);
}


.product-empty span {
    font-size: 13px;

    color: var(--text-color-secondary);
}
</style>