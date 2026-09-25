<script setup>
    import {computed} from "vue"
    import Textarea from "primevue/textarea";

    // ============================================================
    // PROPS
    // ============================================================
    const props = defineProps({
        items: {
            type: Array,
            default: () => [],
        },
        // Semua nilai calculation berasal dari SalesPOSView.
        // POSCart hanya bertugas menampilkan hasilnya.
        subtotal: {
            type: Number,
            default: 0,
        },

        discount: {
            type: Number,
            default: 0,
        },

        tax: {
            type: Number,
            default: 0,
        },

        grandTotal: {
            type: Number,
            default: 0,
        },

        notes: {
            type: String,
            default: "",
        },
    });

    // ============================================================
    // EVENTS
    // ============================================================
    const emit = defineEmits([
        "increase",
        "decrease",
        "update-discount",
        "update:notes", // "update:notes" ← event khusus untuk v-model:notes
        "payment",
    ]);

    // ============================================================
    // LOCAL DISCOUNT INPUT
    // ============================================================

    /**
     * Input discount menggunakan local state supaya user
     * dapat mengetik tanpa langsung mengubah parent setiap
     * karakter.
     */
    const discountInput = computed({
        get() {
            return props.discount;
        },

        set(value) {
            emit("update-discount", value);
        },
    });

    const notes = computed({
        get() {
            return props.notes;
        },

        set(value) {
            emit("update:notes", value);
        },
    });

    // subtotal dihitung dari parent SalesPOSView.vue
    // const subtotal = computed(() => {
    //     return props.items.reduce((total, item) => {
    //         return total + item.qty * item.selling_price;
    //     }, 0);
    // });

    // ============================================================
    // FORMAT CURRENCY
    // ============================================================
    function formatCurrency(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);
    }

    function handleDiscountInput(event) {
        let value = Number(event.target.value) || 0;

        // Discount tidak boleh negatif.
        if (value < 0) {
            value = 0;
        }

        // Discount tidak boleh melebihi subtotal.
        if (value > props.subtotal) {
            value = props.subtotal;
        }

        // Update input agar langsung menampilkan
        // nilai yang sudah divalidasi.
        event.target.value = value;

        // Kirim nilai valid ke parent.
        emit("update-discount", value);
    }

    // WATCHER
    // watch(
    //     () => props.notes,
    //     (value) => {
    //         console.log("POSCart NOTES:", value);
    //     }
    // );
</script>

<template>
    <section class="cart">
        <!--Header-->
        <div class="cart-header">
            <div>
                <h2><i class="pi pi-shopping-cart"></i> Current Sale</h2>
                <span class="cart-count">
                    {{ items.length }} item
                    <span v-if="items.length !==1">s</span>
                </span>
            </div>
        </div>

        <!--Cart items-->
        <div class="cart-items">
            <!--Empty state-->
            <div
                v-if="items.length ===0"
                class="cart-empty"
            >
                <i class="pi pi-shopping-cart"></i>
                <div>
                    Cart is empty
                </div>
                <small>
                    Select a product to add it here.
                </small>
            </div>

            <!--Items-->
            <div
                v-for="item in items"
                :key="item.id"
                class="cart-item"
            >
                <div class="cart-item-info">
                    <div class="cart-item-name">
                        {{ item.item_name }}
                    </div>

                    <div
                        v-if="item.variant_name"
                        class="cart-item-variant"
                    >
                        {{ item.variant_name }}
                    </div>

                    <div class="cart-item-price">
                        {{ formatCurrency(item.selling_price) }}
                    </div>
                </div>

                <div class="cart-item-bottom">
                    <!--Quantity-->
                    <div class="quantity-control">
                        <button
                            type="button"
                            @click="emit('decrease', item)"
                        >
                            <i class="pi pi-minus"></i>
                        </button>

                        <span>
                            {{ item.qty }}
                        </span>

                        <button
                            type="button"
                            @click="emit('increase', item)"
                        >
                            <i class="pi pi-plus"></i>
                        </button>
                    </div>

                    <!--Subtotal-->
                    <div class="cart-item-subtotal">
                        {{ formatCurrency(
                            item.qty * item.selling_price
                        ) }}
                    </div>
                </div>
            </div>
        </div>

        <!--Transaction Notes-->
        <div class="cart-notes">
            <label for="sale-notes">
                Notes
            </label>

            <Textarea
                id="sale-notes"
                v-model="notes"
                rows="1"
                maxlength="500"
                :disabled="items.length === 0"
                placeholder="Add a note..."
                class="notes-input"
            />

            <small class="notes-counter">
                {{ notes.length }}/500
            </small>
        </div>

        <!--Summary-->
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal</span>
                <strong>
                    {{ formatCurrency(props.subtotal) }}
                </strong>
            </div>

            <!-- Discount -->
            <div class="summary-row">
                <span>Discount</span>
                <input
                    v-model.number="discountInput"
                    type="number"
                    min="0"
                    :max="props.subtotal"
                    :disabled="items.length === 0"
                    class="discount-input"
                    @input="handleDiscountInput"
                />

            </div>

            <!-- Tax -->
            <div class="summary-row">
                <span>Tax</span>
                <strong>
                    {{ formatCurrency(tax) }}
                </strong>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-grand-total">
                <span>Grand Total</span>
                <strong>
                    {{ formatCurrency(grandTotal) }}
                </strong>
            </div>
        </div>

        <!--Payment button-->
        <div class="cart-footer">
            <button
                type="button"
                class="payment-button"
                :disabled="items.length === 0"
                @click="emit('payment')"
            >
                <i class="pi pi-credit-card"></i>
                Payment
            </button>
        </div>
    </section>

</template>

<style scoped>

.cart {
    height: 100%;
    min-height: 0;
    
    display: flex;
    flex-direction: column;

    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;

    overflow: hidden;
}

/* Header */

.cart-header {
    padding: 12px 16px;

    border-bottom: 1px solid #e5e7eb;

    flex-shrink: 0;
}

.cart-header h2 {
    margin: 0;

    font-size: 16px;
    font-weight: 700;

    color: #111827;
}

.cart-count {
    display: block;

    margin-top: 3px;

    font-size: 12px;
    color: #6b7280;
}

/* Items */

.cart-items {
    flex: 1;
    min-height: 0;

    overflow-y: auto;

    padding: 4px 12px;
}

.cart-item {
    padding: 9px 4px;

    border-bottom: 1px solid #f1f5f9;
}

.cart-item-info {
    min-width: 0;
}

.cart-item-name {
    font-size: 14px;
    font-weight: 600;

    color: #111827;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cart-item-variant {
    margin-top: 2px;

    font-size: 12px;
    color: #17991e;
    font-weight: 600;
}

.cart-item-price {
    margin-top: 4px;

    font-size: 12px;
    color: #6b7280;
}

.cart-item-bottom {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 10px;

    margin-top: 6px;
}

/* Quantity */

.quantity-control {
    display: flex;

    align-items: center;

    border: 1px solid #d1d5db;
    border-radius: 6px;

    overflow: hidden;
}

.quantity-control button {
    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 0;

    background: #f9fafb;
    color: #374151;

    cursor: pointer;
}

.quantity-control button:hover {
    background: #f3f4f6;
}

.quantity-control span {
    min-width: 36px;

    text-align: center;

    font-size: 13px;
    font-weight: 600;
}

/* Item subtotal */

.cart-item-subtotal {
    font-size: 13px;
    font-weight: 700;

    color: #111827;
}

/* Empty */

.cart-empty {
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    text-align: center;

    color: #9ca3af;
}

.cart-empty i {
    margin-bottom: 10px;

    font-size: 28px;
}

.cart-empty small {
    margin-top: 4px;

    font-size: 11px;
}

/* Summary */

.cart-summary {
    padding: 14px 16px;

    border-top: 1px solid #e5e7eb;
}

.summary-row {
    display: flex;

    justify-content: space-between;

    margin-bottom: 8px;

    font-size: 13px;

    color: #6b7280;
}

.summary-row strong {
    color: #111827;
}

.summary-divider {
    margin: 10px 0;

    border-top: 1px dashed #d1d5db;
}

.summary-grand-total {
    display: flex;

    align-items: center;
    justify-content: space-between;

    font-size: 15px;
    font-weight: 700;

    color: #111827;
}

/* Footer */

.cart-footer {
    padding: 12px 16px;

    border-top: 1px solid #e5e7eb;
}

.payment-button {
    width: 100%;

    height: 38px;

    display: flex;

    align-items: center;
    justify-content: center;

    gap: 8px;

    border: 0;
    border-radius: 7px;

    background: #2563eb;
    color: white;

    font-size: 14px;
    font-weight: 600;

    cursor: pointer;
}

.payment-button:hover:not(:disabled) {
    background: #1d4ed8;
}

.payment-button:disabled {
    opacity: 0.5;

    cursor: not-allowed;
}

/*CSS for notes*/
.cart-notes {
    padding: 7px 16px 6px;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;

    flex-shrink: 0;
}

.cart-notes label {
    display: block;

    margin-bottom: 3px;

    font-size: 12px;
    font-weight: 600;
}

.notes-input {
    width: 100%;
    font-size: 0.8rem;
}

.notes-counter {
    display: block;
    margin-top: 2px;
    text-align: right;
    font-size: 0.65rem;
    color: var(--text-color-secondary);
}

</style>