<script setup>
    import { computed, ref, watch } from "vue";

    import Dialog from "primevue/dialog";
    import Button from "primevue/button";
    import Select from "primevue/select";
    import InputNumber from "primevue/inputnumber";

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
        },

        customers: {
            type: Array,
            default: () => [],
        },

        customerLoading: {
            type: Boolean,
            default: false,
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
        "update:visible",
        "complete",
    ])

    // ============================================================
    // STATE
    // ============================================================
    const paymentMethod = ref("CASH");
    const paymentStatus = ref("PAID");

    // jumlah uang yang diterima dari customer
    // hanya digunakan untuk pembayaran CASH.
    const amountReceived = ref(0);

    // const id untuk dimasukkan ke data sales
    const customerID = ref(null);

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
    // PAYMENT METHODS
    // ============================================================
    const paymentStatuses = [
        {
            label: "PAID",
            value: "PAID",
        },
        {
            label: "UNPAID",
            value: "UNPAID",
        },
    ]
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

        // UNPAID TIDAK MEMBUTUHKAN PEMBAYARAN SEKARANG
        if (paymentStatus.value === 'UNPAID') {
            return customerID.value !== null; // bisa disubmit jika customer sudah dipilih
        }

        // PAID + CASH
        if (paymentMethod.value === "CASH") {
            return amountReceived.value >= props.grandTotal;
        }

        // PAID + QRIS / TRANSFER
        return true
    })

    // ============================================================
    // WATCHERS
    // ============================================================
    /*
        Ketika dialog dibuka, reset state pembayaran dan status
        Ini penting supaya transaksi baru tidak mewarisi nilai pembayaran dari transaksi sebelumnya
    */
    watch(
        () => props.visible,
        (visible) => {
            if (visible) {
                paymentMethod.value="CASH";
                paymentStatus.value="PAID";
                amountReceived.value=0;
                customerID.value=null;
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
            customer_id:
                paymentStatus.value === "UNPAID"
                ? customerID.value
                : null,
                
            payment_method: paymentMethod.value,
            payment_status: paymentStatus.value,
            notes: props.notes, // dikirim dari parent, bukan merupakan komponen lokal POSPaymentDialog

            amount_received:
                paymentMethod.value === "CASH" &&
                paymentStatus.value === "PAID"
                    ? amountReceived.value
                    : 0, // jika unpaid maka amount received = 0
            change:
                paymentStatus.value === "PAID"
                    ? change.value // change sebenarnya tidak diperlukan karena bisa dihitung dari amount_received - grand total di db
                    : 0
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

        <!-- PAYMENT STATUS PAID/UNPAID -->
        <div class="payment-field">
            <label for="payment-status">
                Payment Status
            </label>
            <Select
                id="payment-status"
                v-model="paymentStatus"
                :options="paymentStatuses"
                option-label="label"
                option-value="value"
                class="w-full"
            />
        </div>

        <!-- Combobox customer hanya muncul jika UNPAID -->
        <div
            v-if="paymentStatus === 'UNPAID'"
            class="payment-field"
        >
            <label for="customer">
                Customer
            </label>

            <Select
                id="customer"
                v-model="customerID"
                :options="customers"
                option-label="name"
                option-value="id"
                placeholder="Select customer"
                :loading="customerLoading"
                class="w-full"
            />
        </div>

        <!--CASH PAYMENT-->
        <!-- Amount received akan tampil jika method cash dan status nya paid -->
        <template v-if="paymentStatus === 'PAID' && paymentMethod === 'CASH'">
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

        <!-- PAYMENT INFORMATION -->
        <div v-if="paymentStatus === 'UNPAID'"
            class="non-cash-info"
        >
            <i class="pi pi-clock"></i>
            <span>
                Payment will be recorded as unpaid.
            </span>
        </div>

        <!--PAYMENT VIA QRIS OR TRANSFER-->
        <div
            v-else-if="paymentMethod !== 'CASH'"
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

/* Style untuk non-cash-info */
.non-cash-info {
    display: flex;
    align-items: center;
    gap: 8px;

    margin-top: 10px;

    font-size: 14px;
}

/* payment warning saat amount < total harga */
.payment-warning {
    display: block;
    margin-top: 8px;
    color: #ef4444;
    font-size: 14px;
    font-weight: 600;
}
</style>