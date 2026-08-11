<script setup>
    import { computed, ref, watch } from "vue";

    import Dialog from "primevue/dialog";
    import Button from "primevue/button";
    import Select from "primevue/select";
    import InputNumber from "primevue/inputnumber";
import { meta } from "zod/v4/core";

    // ============================================================
    // PROPS
    // ============================================================
    const props = defineProps({
        visible: {
            type: Boolean,
            default: false,
        },

        // Grand total transaksi yang harus dibayar
        grandTotal: {
            type: Number,
            default: 0,
        }
    })

    // ============================================================
    // EVENTS
    // ============================================================
    const emit = defineEmits([
        "update:visible",
        "complete",
    ])

    // ============================================================
    // STATE
    // ============================================================
    const paymentMethod = ref("CASH");

    // jumlah uang yang diterima dari customer
    // hanya digunakan untuk pembayaran CASH.
    const amountReceived = ref(0);

    // ============================================================
    // PAYMENT METHODS
    // ============================================================
    const paymentMethods = [
        {
            label: "Cash",
            value: "CASH",
        },
        {
            label: "QRIS",
            value: "QRIS",
        },
        {
            label: "Transfer",
            value: "TRANSFER",
        },
    ];

    // ============================================================
    // COMPUTED
    // ============================================================
    /*
        Kembalian customer.

        Untuk Cash:
            amountReceived - grandTotal

        Untuk QRIS/Transfer:
            tidak membutuhkan amount received,
            sehingga dianggap 0
    */
    const change = computed(() => {
        if (paymentMethod.value !== "CASH") {
            return 0;
        }

        return Math.max(
            amountReceived.value - props.grandTotal,
            0
        );
    });

    /*
        Validasi apakah pembayaran sudah cukup.
        CASH:
            uang diterima harus >= grandTotal.
        QRIS / Transfer:
            dianggap langsung sesuai nominal transaksi.
    */
    const canComplete = computed(() => {
        if (props.grandTotal <= 0) {
            return false;
        }

        if (paymentMethod.value === "CASH") {
            return amountReceived.value >= props.grandTotal;
        }

        return true
    })

    // ============================================================
    // WATCHERS
    // ============================================================
    /*
        Ketika dialog dibuka, reset state pembayaran
        Ini penting supaya transaksi baru tidak mewarisi nilai pembayaran dari transaksi sebelumnya
    */
    watch(
        () => props.visible,
        (visible) => {
            if (visible) {
                paymentMethod.value="CASH";
                amountReceived.value = 0;
            }
        }
    );

    /*
        Jika user mengganti metode pembayaran dari CASH
        ke QRIS / Transfer, amount received tidak diperlukan
    */
    watch(
        paymentMethod,
        (method) => {
            if (method !== "CASH") {
                amountReceived.value = 0;
            }
        }
    );

    // ============================================================
    // FUNCTIONS
    // ============================================================
    function closeDialog() {
        emit("update:visible", false);
    }

    /*
        Complete payment.
        Baru memanggil API.
        Kita hanya mengirim data pembayaran ke parent
    */
    function completePayment() {
        if (!canComplete.value) {
            return;
        }
        emit("complete", {
            payment_menthod: paymentMethod.value,
            amount_received:
                paymentMethod.value === "CASH"
                    ? amountReceived.value
                    : props.grandTotal,
            change: change.value,
        });
    }

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
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header="Payment"
        :style="{ width: '420px' }"
        @update:visible="emit('update:visible', $event)"
    >
        <!-- PAYMENT SUMMARY -->
        <div class="payment-result grand-total">
            <span>
                Grand Total
            </span>

            <strong>
                {{ formatCurrency(grandTotal) }}
            </strong>
        </div>

        <!-- PAYMENT METHOD -->
        <div class="payment-field">
            <label for="payment-method">
                Payment Method
            </label>
            <Select
                id="payment-method"
                v-model="paymentMethod"
                :options="paymentMethods"
                option-label="label"
                option-value="value"
                class="w-full"
            />
        </div>

        <!--CASH PAYMENT-->
        <template v-if="paymentMethod === 'CASH'">
            <div class="payment-field">
                <label for="amount-received">
                    Amount received
                </label>
                <InputNumber
                    id="amount-received"
                    v-model="amountReceived"
                    mode="currency"
                    currency="IDR"
                    locale="id-ID"
                    :min="0"
                    class="w-full"
                    input-class="w-full"
                />
            </div>
        
            <!--Change-->
            <div class="payment-result change-section">
                <span>
                    Change
                </span>
                <strong>
                    {{ 
                        new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                        }).format(change)
                    }}
                </strong>
            </div>

            <!--Insufficient payment warning-->
            <small
                v-if="amountReceived > 0 && amountReceived < grandTotal"
                class="payment-warning"
            >
                Amount received is less than the grand total.
            </small>
        </template>

        <!--QRIS/TRANSFER-->
        <div
            v-else
            class="non-cash-info"
        >
            <i class="pi pi-check-circle"></i>
            <span>
                Customer payment will be recorded as
                {{ paymentMethod === "QRIS" ? "QRIS" : "Transfer" }}.
            </span>
        </div>

        <!--FOOTER-->
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                outlined
                @click="closeDialog"
            />

            <Button
                label="Submit"
                icon="pi pi-check"
                :disabled="!canComplete"
                @click="completePayment"
            />
        </template>
    </Dialog>
</template>

<style scoped>
/* ============================================================
   PAYMENT SUMMARY
   ============================================================ */

.payment-total-card {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 16px;

    padding: 12px 16px;
    margin-bottom: 0px;

    border-radius: 10px;

    background: var(--surface-ground);
}

.payment-total-label {
    font-size: 14px;
    font-weight: 600;

    color: var(--text-color-secondary);
}

.payment-total-value {
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;

    color: var(--text-color);
}


/* ============================================================
   PAYMENT SECTION
   ============================================================ */

.payment-section {
    margin-bottom: 20px;
}

.section-label {
    display: block;

    margin-bottom: 8px;

    font-size: 13px;
    font-weight: 600;
}


/* ============================================================
   PAYMENT METHOD
   ============================================================ */

.payment-methods {
    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 8px;
}


/* ============================================================
   PAYMENT STATUS
   ============================================================ */

.payment-status {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 8px;

    margin-top: 10px;
    padding: 10px 12px;

    border-radius: 8px;

    font-size: 13px;
}

.payment-status-warning {
    background: var(--yellow-50);
    color: var(--yellow-700);
}

.payment-status-success {
    background: var(--green-50);
    color: var(--green-700);
}


/* ============================================================
   NON-CASH PAYMENT INFORMATION
   ============================================================ */

.payment-info {
    display: flex;
    align-items: flex-start;

    gap: 8px;

    padding: 12px;
    margin-bottom: 20px;

    border-radius: 8px;

    background: var(--surface-ground);

    color: var(--text-color-secondary);

    font-size: 13px;
    line-height: 1.5;
}

.payment-field {
    margin-top: 20px;
}

/* payment-result untuk grandTotal dan change */
.payment-result {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 15px;
}

.payment-result strong {
    font-size: 18px;
    font-weight: 700;
}

/* Jarak khusus Grand Total dari bagian sebelumnya */
.grand-total {
    margin-bottom: 12px;
}

/* Jarak khusus Change dari Amount Received */
.change-section {
    margin-top: 16px;
}
</style>