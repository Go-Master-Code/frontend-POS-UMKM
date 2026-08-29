<script setup>
    import { ref, computed, onMounted } from 'vue';

    import POSProductGrid from '@/components/sales/pos/POSProductGrid.vue';
    import POSSearchBar from '@/components/sales/pos/POSSearchBar.vue';
    import POSCart from '@/components/sales/pos/POSCart.vue';
    import POSPaymentDialog from '@/components/sales/pos/POSPaymentDialog.vue';
    import POSCategoryFilter from '@/components/sales/pos/POSCategoryFilter.vue';
    // import Dialog for successful payment
    import POSPaymentSuccess from '@/components/sales/pos/POSPaymentSuccess.vue';
    
    // import api untuk mendapatkan category item
    import { getCatalogItems } from '@/api/catalog_items';
    // import api untuk mendapatkan item variants
    import { getItemVariants } from '@/api/item_variant';
    // import api untuk create sales
    import { createSale } from '@/api/sales';
    // import api customer untuk payment
    import { getCustomers } from '@/api/customer';

    // state
    // ============================================================
    // CATALOG ITEMS
    // ============================================================
    const catalogItems = ref([]);
    const catalogLoading = ref(false);
    const catalogError = ref(null);
    const searchKeyword = ref("");

    // transaction success
    const completedSale = ref(null);
    const transactionSuccessVisible = ref(false);

    // ref ke search bar di POSSearchBar.vue
    const searchBarRef = ref(null);

    // state feedback barcode
    const barcodeFeedback = ref({
        type: "",
        message: "",
        // akan menggunakan success, error, warning
    })

    // fungsi suara untuk scan barcode
    function playBarcodeSound(type) {
        const audioContext =
            new(window.AudioContext || window.webkitAudioContext) ();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type==="success") {
            oscillator.frequency.value = 880;
        } else if (type==="warning") {
            oscillator.frequency.value = 520;
        } else {
            oscillator.frequency.value = 220;
        }

        gainNode.gain.value = 0.08;

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + 0.12
        );
    }

    // HELPER FEEDBACK
    function showBarcodeFeedback(type, message) {
        barcodeFeedback.value = {
            type,
            message,
        };

        playBarcodeSound(type);

        setTimeout(() => {
            barcodeFeedback.value = {
                type: "",
                message: "",
            };
        }, 2000); // pesan hanya muncul sekitar 2 detik
    }

    // ============================================================================
    // CATEGORY FILTER
    // ============================================================================
    //
    // "all" berarti seluruh produk ditampilkan.
    //
    // Jika berisi category ID tertentu,
    // hanya variant dari category tersebut yang ditampilkan.
    //
    // ============================================================================
    const selectedCategory = ref("all"); // default value

    // ============================================================================
    // CATEGORY LIST
    // ============================================================================

    /**
     * Membentuk daftar category unik dari catalog items.
     *
     * Beberapa catalog item dapat berada dalam category yang sama.
     *
     * Contoh:
     *
     * Keripik Singkong → Snack
     * Keripik Pisang   → Snack
     * Kerupuk Kulit    → Makanan Kering
     * Nagasari         → Kue Basah
     *
     * Hasil:
     *
     * All
     * Snack
     * Kue Basah
     */
    const categories = computed(() => {
        const categoryMap = new Map();

        // catalogItems sudah berisi data setelah function fetchCatalogItems() dieksekusi
        catalogItems.value.forEach(item => {
            if(!item.category_id) {
                return;
            }

            if(!categoryMap.has(item.category_id)) { // jika category id belum ada, tambahkan ke dalam Map
                categoryMap.set(
                    item.category_id,
                    {
                        id: item.category_id,
                        name: item.category_name,
                    }
                );
            }
        });

        return [
            {
                id: "all",
                name: "All",
            },
            ...Array.from(categoryMap.values()),
        ];
    });

    // ============================================================================
    // FILTERED PRODUCTS
    // ============================================================================

    /**
     * Menentukan variant yang ditampilkan pada Product Grid.
     *
     * "all":
     * → tampilkan seluruh variant.
     *
     * category ID:
     * → hanya tampilkan variant dari category tersebut.
     */

    const filteredProducts = computed(() => {
        const keyword = searchKeyword.value
            .trim()
            .toLowerCase();
        
        return products.value.filter(product => {
            // CATEGORY
            const matchesCategory =
                selectedCategory.value === "all" ||
                product.category_id === selectedCategory.value;
            
            // SEARCH by: item_name or variant_name or sku or barcode
            const matchesSearch =
                keyword === "" ||
                product.item_name
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.variant_name
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.sku
                    ?.toLowerCase()
                    .includes(keyword) ||
                product.barcode
                    ?.toLowerCase()
                    .includes(keyword);
                
            // FINAL
            return matchesCategory && matchesSearch
        });
    });

    // ============================================================================
    // CATEGORY CHANGE
    // ============================================================================

    /**
     * Dipanggil oleh POSCategoryFilter ketika kasir
     * memilih category.
     */
    function handleCategoryChange(category) {
        selectedCategory.value = category.id;
    }

    // ============================================================
    // STATE CUSTOMER
    // ============================================================
    const customers = ref([]);
    const customerLoading = ref(false);
    const customerError = ref(null);

    // ============================================================
    // ITEM VARIANTS
    // ============================================================
    //
    // Data inilah yang nantinya ditampilkan oleh POSProductGrid.
    //
    // Satu product card = satu item variant.
    //
    // ============================================================
    const products = ref([])
    const variantLoading = ref(false);
    const variantError = ref(null);

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
        console.log("=== ADD TO CART ===");
        console.log("Product:", product);
        console.log("Product variant ID:", product.id);
        console.log("Current cart:", cartItems.value);

        const existingItem = cartItems.value.find(
            item => item.id === product.id
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
            id: product.id,
            item_name: product.item_name,
            variant_name: product.variant_name,
            sku: product.sku,
            selling_price: product.selling_price,
            current_stock: product.current_stock,
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
                cartItem.id !== item.id
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

    /**
     * Mengambil seluruh item variant milik tenant
     * untuk ditampilkan pada Product Grid.
     *
     * Cek Response Backend dengan variable di POSProductGrid
     * bisa disamakan atau jika berbeda harus di mapping dulu disini
     */
    async function fetchItemVariants() {
        variantLoading.value = true;
        variantError.value = null;

        try {
            const response = await getItemVariants({
                page: 1,
                limit: 100,
            });

            products.value = response.data.data ?? [];
            console.log("ITEM VARIANTS:",products.value);
        } catch(error) {
            console.error("Failed to load item variants",error);
            variantError.value = "Failed to load item variants";
        } finally {
            variantLoading.value = false;
        }
    }

    // mengambil data customer
    async function fetchCustomers() {
        customerLoading.value = true;
        customerError.value = null;

        try {
            const response = await getCustomers({
                page: 1,
                limit: 100,
            });

            customers.value = response.data.data ?? [];
            console.log("CUSTOMERS:",customers.value);
        } catch(error) {
            console.error("Failed to load customers",error);
            customerError.value = "Failed to load customers";
        } finally {
            customerLoading.value = false;
        }
    }

    // handler search
    function handleSearch(keyword) {
        searchKeyword.value = keyword;
    }

    // handler barcode
    function handleBarcode(barcode) {
        const normalizedBarcode = String(barcode).trim();

        if (!normalizedBarcode) {
            return;
        }

        // cek apakah barcode yang diinput ditemukan di array products
        const product = products.value.find( // find dilakukan pada products bukan ke filtered products agar sistem tetap dapat mencari barcode tertentu pada seluruh list product yang dimiliki
            product =>
                String(product.barcode).trim() === normalizedBarcode
        );

        // ================================================================
        // BARCODE TIDAK DITEMUKAN
        // ================================================================
        if (!product) {
            showBarcodeFeedback(
                "error",
                `Barcode ${normalizedBarcode} tidak ditemukan.`
            );

            return;
        }

        // ================================================================
        // CEK STOCK
        // ================================================================
        const existingItem = cartItems.value.find(
            item =>
                item.id === product.id
        );

        const currentQty = existingItem?.qty ?? 0; // ambil qty yang ada di sales cart

        // ================================================================
        // STOCK HABIS / MAX QTY
        // ================================================================
        if (currentQty >= product.current_stock) { // bandingkan qty yang ada di sales cart dengan current_stock (stok yang tersedia dari db)
            showBarcodeFeedback(
                "warning",
                `${product.item_name} - ${product.variant_name} exceeding stock.`
            );

            return;
        }

        // ================================================================
        // ADD TO CART
        // ================================================================
        addToCart(product)

        // ================================================================
        // CLEAR SEARCH
        // ================================================================
        searchKeyword.value = ""; // state di parent
        searchBarRef.value?.clearSearchInput(); // state internal POSSearchBar

        // ================================================================
        // SUCCESS FEEDBACK
        // ================================================================
        showBarcodeFeedback(
            "success",
            `${product.item_name} - ${product.variant_name} has been added.`
        );
    }

    // FUNCTION UNTUK CREATE NEW SALE
    async function submitSale(paymentData) {
        const payload = {
            // customer_name: paymentData.customer_name || "",
            customer_id: paymentData.customer_id || null,
            discount_amount: discount.value,
            payment_method: paymentData.payment_method,
            payment_status : paymentData.payment_status,
            amount_received: paymentData.amount_received,
            notes: paymentData.notes || "",

            items: cartItems.value.map(item => ({
                item_variant_id: item.id,
                qty: item.qty,
                discount_amount: 0, // sementara diskon sale item = 0
            })),
        };

        console.log("CREATE SALE PAYLOAD:", payload);

        try {
            const response = await createSale(payload);

            // DEBUG
            console.log("CREATE SALE RESPONSE:", response);
            console.log("API DATA:",response.data);
            console.log("SALES DATA:",response.data.data);

            // masukkan data response.data.data yang berhasil disimpan ke completed sale
            completedSale.value = response.data.data;
            
            // tutup payment dialog
            paymentDialogVisible.value = false;

            // kosongkan cart
            cartItems.value = []; // array kosong

            // reset discount
            discountAmount.value = 0;

            // tampilkan success feedback
            transactionSuccessVisible.value = true;

            // refresh data item variants untuk reload stock
            await fetchItemVariants();
        } catch (error) {
            console.error("Failed to submit sale", error);

            console.error(
                "BACKEND ERROR:",
                error.response?.data
            );
        }
    }

    /*
    * Jalankan request ketika Sales POS pertama kali
    * dibuka.
    */
    onMounted(() => {
        fetchCatalogItems();
        fetchItemVariants();
        fetchCustomers();
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

                <!-- Search -->
                <div class="products-toolbar">
                    <POSSearchBar
                        ref="searchBarRef"
                        @search="handleSearch"
                        @barcode="handleBarcode"
                    />
                    <div
                        v-if="barcodeFeedback.message"
                        class="barcode-feedback"
                        :class="`barcode-feedback--${barcodeFeedback.type}`"
                    >
                        <i
                            :class="
                                barcodeFeedback.type === 'success'
                                    ? 'pi pi-check-circle'
                                    : barcodeFeedback.type === 'warning'
                                        ? 'pi pi-exclamation-triangle'
                                        : 'pi pi-times-circle'
                            "
                        ></i>

                        <span>
                            {{ barcodeFeedback.message }}
                        </span>
                    </div>
                </div>

                <!--Filter berdasarkan kategory-->
                <POSCategoryFilter 
                    :categories="categories"
                    :selected-category="selectedCategory"
                    @change="handleCategoryChange"
                />

                <!--Daftar product cards-->
                <div class="products-content">
                    <POSProductGrid
                        :products="filteredProducts"
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
        :customers="customers"
        :customer-loading="customerLoading"
        @complete="submitSale"
    />

    <POSPaymentSuccess
        v-model:visible="transactionSuccessVisible"
        :sale="completedSale"
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

.barcode-feedback {
    display: flex;
    align-items: center;

    gap: 8px;

    margin-top: 8px;
    padding: 7px 10px;

    border-radius: 6px;

    font-size: 13px;
    font-weight: 500;
}


.barcode-feedback--success {
    color: #166534;
    background: #dcfce7;
    border: 1px solid #86efac;
}


.barcode-feedback--warning {
    color: #92400e;
    background: #fef3c7;
    border: 1px solid #fcd34d;
}


.barcode-feedback--error {
    color: #991b1b;
    background: #fee2e2;
    border: 1px solid #fca5a5;
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