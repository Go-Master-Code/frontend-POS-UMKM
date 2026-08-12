<script setup>
    import { ref, computed, onMounted } from 'vue';

    import POSProductGrid from '@/components/sales/pos/POSProductGrid.vue';
    import POSSearchBar from '@/components/sales/pos/POSSearchBar.vue';
    import POSCart from '@/components/sales/pos/POSCart.vue';
    import POSPaymentDialog from '@/components/sales/pos/POSPaymentDialog.vue';
    import POSCategoryFilter from '@/components/sales/pos/POSCategoryFilter.vue';

    // import api untuk mendapatkan category item
    import { getCatalogItems } from '@/api/catalog_items';

    // state
    // catalog item
    const catalogItems = ref([]);
    const catalogLoading = ref(false);
    const catalogError = ref(null);

    const cartItems = ref([]);

    // Discount transaksi dalam nominal Rupiah. // Nanti bisa dikembangkan menjadi percentage atau promo.
    const discountAmount = ref(0);

    // payment dialog
    const paymentDialogVisible = ref(false);
    const paymentLoading = ref(false);

    // Untuk sementara tax kita gunakan 10%.
    // IMPORTANT:
    // Nilai ini sebaiknya nanti berasal dari tenant/settings
    const TAX_RATE = 0.10;

    // ============================================================
    // CART CALCULATION
    // ============================================================

    /**
     * Subtotal seluruh item sebelum discount transaksi.
     *
     * Setiap perubahan qty atau item otomatis menyebabkan
     * computed ini dihitung ulang.
     */
    const subtotal = computed(() => {
        return cartItems.value.reduce((total, item) => {
            return total + (item.qty * item.selling_price);
        }, 0);
    });

    /**
     * Discount tidak boleh:
     * - negatif
     * - lebih besar dari subtotal
     *
     * Kita clamp nilainya supaya state frontend tetap aman.
     */
    const discount = computed(() => {
        return Math.min(
            Math.max(discountAmount.value, 0),
            subtotal.value
        );
    });

    /**
     * Nilai yang dikenakan pajak setelah discount.
     */
    const taxableAmount = computed(() => {
        return subtotal.value - discount.value;
    });

    /**
     * Tax sementara menggunakan rate 10%.
     */
    const tax = computed(() => {
        return taxableAmount.value * TAX_RATE;
    });

    /**
     * Total akhir yang harus dibayar customer.
     */
    const grandTotal = computed(() => {
        return taxableAmount.value + tax.value;
    });

    // functions
    function addToCart(product) {
        console.log("ADD PRODUCT:", product);

        const existingItem = cartItems.value.find(
            item => item.item_variant_id === product.item_variant_id
        );

        // Jika produk sudah ada di cart
        if (existingItem) {
            // Jangan melebihi stock
            if (existingItem.qty >= existingItem.stock) {
                return;
            }

            existingItem.qty += 1;
            return;
        }

        // Item baru selalu dimulai dengan qty 1.
        cartItems.value.push({
            item_variant_id: product.item_variant_id,
            item_name: product.item_name,
            variant_name: product.variant_name,
            sku: product.sku,
            selling_price: product.selling_price,
            stock: product.stock,
            qty: 1,
        });
    }

    function increaseQty(item) {
        // tentukan batas maksimal sesuai stok yang tersedia
        if (item.qty >= item.stock) {
            return;
        }

        item.qty += 1;
    }

    function decreaseQty(item) {
        if (item.qty > 1) { // jika qty item > 1, maka kurangi 1 qty nya
            item.qty -= 1;
            return;
        }

        // jika item.qty = 1 maka hapus item dari cartItems
        cartItems.value = cartItems.value.filter(
            cartItem =>
                cartItem.item_variant_id !== item.item_variant_id
        );
    }

    /**
     * Dipanggil oleh POSCart ketika user mengubah discount.
     */
    function updateDiscount(value) {
        // Pastikan value selalu berupa angka.
        const numericValue = Number(value) || 0;

        // Discount tidak boleh negatif.
        discountAmount.value = Math.max(numericValue, 0);
    }
    
    // function untuk open dialog payment
    function openPaymentDialog() {
        if (cartItems.value.length === 0) {
            return;
        }

        paymentDialogVisible.value=true;
    }

    // function untuk load all category items per tenant
    async function fetchCatalogItems() {
        catalogLoading.value = true;
        catalogError.value = null;

        // coba eksekusi endpoint
        try {
            const response = await getCatalogItems({
                page: 1,
                limit: 100,
            });

            // jika tidak ada data, maka jadikan array kosong biar tidak null
            catalogItems.value = response.data.data ?? [];

            console.log("CATALOG ITEMS:", catalogItems.value);
        } catch (error) {
            console.error("Failed to load catalog items", error);
            catalogError.value="Failed to load catalog items";
        } finally {
            catalogLoading.value = false;
        }
    }

    /*
    * Jalankan request ketika Sales POS pertama kali
    * dibuka.
    */
    onMounted(() => {
        fetchCatalogItems();
    });
</script>

<template>
    <div class="pos-page">
        <!--Header-->
        <!-- <div class="pos-header">
            <div>
                <h1>Sales</h1>
                <p>Point of Sale</p>
            </div>
        </div> -->

        <!--Main POS-->
        <div class="pos-layout">
            <!-- ==========================================
                LEFT : PRODUCT AREA
                ========================================== -->
            <section class="pos-products">
                <div class="products-toolbar">
                    <POSSearchBar />
                </div>

                <!--Filter berdasarkan kategory-->
                <POSCategoryFilter />

                <!--Daftar product cards-->
                <div class="products-content">
                    <POSProductGrid
                        :cart-items="cartItems"
                        @add="addToCart"
                    />
                </div>
            </section>

            <!-- ==========================================
                 RIGHT : CART AREA
                 ========================================== -->
            <aside class="pos-cart">
                <POSCart
                    :items="cartItems"
                    :subtotal="subtotal"
                    :discount="discount"
                    :tax="tax"
                    :grand-total="grandTotal"
                    @increase="increaseQty"
                    @decrease="decreaseQty"
                    @update-discount="updateDiscount"
                    @payment="openPaymentDialog"
                />

                <!-- Empty cart
                <div class="cart-empty">
                    <i class="pi pi-shopping-cart"></i>
                    <h3>Cart is empty</h3>
                    <p>
                        Select a product to add it to the sale
                    </p>
                </div> -->
            </aside>
        </div>
    </div>

    <POSPaymentDialog
        v-model:visible="paymentDialogVisible"
        :grand-total="grandTotal"
    />
</template>

<style scoped>
.pos-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
}


/* ==========================================
   HEADER
   ========================================== */

/* .pos-header {
    flex-shrink: 0;
}

.pos-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
}

.pos-header p {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 14px;
} */


/* ==========================================
   MAIN LAYOUT
   ========================================== */

.pos-layout {
    flex: 1;
    min-height: 0;

    display: grid;
    grid-template-columns: minmax(0, 1fr) 260px;

    gap: 16px;
}


/* ==========================================
   PRODUCT AREA
   ========================================== */

.pos-products {
    min-width: 0;
    min-height: 0;

    display: flex;
    flex-direction: column;

    background: #fff;

    border: 1px solid #e5e7eb;
    border-radius: 10px;

    overflow: hidden;
}

.products-toolbar {
    flex-shrink: 0;

    padding: 16px;

    border-bottom: 1px solid #e5e7eb;
}

.products-content {
    flex: 1;
    min-height: 0;

    overflow-y: auto;

    padding: 16px;
}


/* ==========================================
   CART
   ========================================== */

.pos-cart {
    min-width: 0;
    min-height: 0;

    display: flex;
    flex-direction: column;

    background: #fff;

    border: 1px solid #e5e7eb;
    border-radius: 10px;

    overflow: hidden;
}

.cart-header {
    flex-shrink: 0;

    padding: 16px;

    border-bottom: 1px solid #e5e7eb;
}

.cart-header h2 {
    margin: 0;

    font-size: 18px;
    font-weight: 700;
}

.cart-header span {
    display: block;

    margin-top: 4px;

    font-size: 13px;
    color: #6b7280;
}

.cart-empty {
    flex: 1;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    padding: 32px;

    text-align: center;

    color: #6b7280;
}

.cart-empty i {
    font-size: 40px;

    margin-bottom: 16px;

    color: #9ca3af;
}

.cart-empty h3 {
    margin: 0;

    font-size: 16px;
    font-weight: 600;

    color: #374151;
}

.cart-empty p {
    max-width: 240px;

    margin: 8px 0 0;

    font-size: 14px;

    line-height: 1.5;
}


/* ==========================================
   RESPONSIVE
   ========================================== */

@media (max-width: 1100px) {

    .pos-layout {
        grid-template-columns: minmax(0, 1fr) 320px;
    }

}

@media (max-width: 900px) {

    .pos-layout {
        grid-template-columns: 1fr;
    }

    .pos-cart {
        min-height: 320px;
    }

}
</style>