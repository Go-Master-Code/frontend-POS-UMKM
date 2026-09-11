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
        sale: {
            type: Object,
            default: null,
        },

        loading: {
            type: Boolean,
            default: false,
        },

        backendError: {
            type: String,
            default: "",
        }
    })

    // ============================================================
    // EVENTS
    // ============================================================
    const emit = defineEmits([
        "update:visible",
        "pay",
        "clear-error",
    ])

    // ============================================================
    // STATE
    // ============================================================
    const amountReceived = ref(null);

    // ============================================================
    // COMPUTED
    // ============================================================
    // grand total
    const grandTotal = computed(() => {
        return Number(props.sale?.grand_total ?? 0);
    });

    const change = computed(() => {
        const received = Number(amountReceived.value ?? 0);

        if (received <= grandTotal.value) {
            return 0
        }

        return received - grandTotal.value
    });

    /*
        Validasi apakah pembayaran sudah cukup.
    */
    const isPaymentValid = computed(() => {
        const received = Number(amountReceived.value ?? 0);

        return received >= grandTotal.value && grandTotal.value > 0;
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
                amountReceived.value=null;
                emit("clear-error")
            }
        }
    );

    // ============================================================
    // FUNCTIONS
    // ============================================================
    function closeDialog() {
        if (props.loading) return;
        emit("update:visible", false);
    }

    /*
        Submit payment
        Baru memanggil API untuk update payment status dan amount received
        Kita hanya mengirim data pembayaran ke parent
    */
    function submitPayment() {
        if (!isPaymentValid.value) {
            return;
        }
        emit("pay", {
            amount_received: amountReceived.value,
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
        header="Pay Transaction"
        :style="{ width: '420px' }"
        @update:visible="emit('update:visible', $event)"
    >
        <!-- SALE INFORMATION -->
        <div
            v-if="sale"
            class="sale-information"
        >
            <!--Invoice-->
            <div class="info-row">
                <span>Invoice</span>
                <strong>
                    {{ sale.invoice_number }}
                </strong>
            </div>

            <!--Customer-->
            <div class="info-row">
                <span>Customer</span>
                <strong>
                    {{ sale.customer_name || "Walk-in Customer" }}
                </strong>
            </div>

            <!--Grand Total-->
            <div class="info-row total-row">
                <span>Total</span>
                <strong>
                    {{ formatCurrency(grandTotal) }}
                </strong>
            </div>
        </div>

        <!--Payment Form-->
        <div class="payment-form">
            <label for="amount-received">
                Amount received
            </label>
            <InputNumber
                id="amountReceived"
                v-model="amountReceived"
                mode="currency"
                currency="IDR"
                locale="id-ID"
                :min="0"
                :disabled="loading"
                class="w-full"
                input-class="w-full"
                autofocus
            />

            <!--Validation-->
            <small
                v-if="amountReceived !==null & !isPaymentValid"
                class="validation-error"
            >
                Amount received must be at least
                {{ formatCurrency(grandTotal) }}
            </small>

            <!--Change-->
            <div class="change-row">
                <span>Change</span>
                <strong>
                    {{ formatCurrency(change) }}
                </strong>
            </div>

            <!--Backend error-->
            <div
                v-if="backendError"
                class="backend-error"
            >
                <i class="pi pi-exclamation-circle"></i>
                <span>
                    {{ backendError }}
                </span>
            </div>
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
                severity="success"
                :loading="loading"
                :disabled="!isPaymentValid || loading"
                @click="submitPayment"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.sale-information {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 0 20px;
    border-bottom: 1px solid #e5e7eb;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.info-row span {
    color: #6b7280;
}

.info-row strong {
    color: #111827;
    text-align: right;
}

.total-row {
    margin-top: 6px;
    padding-top: 12px;
    border-top: 1px dashed #d1d5db;
}

.total-row strong {
    font-size: 18px;
}

.payment-form {
    padding-top: 20px;
}

.payment-form label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
}

.validation-error {
    display: block;
    margin-top: 6px;
    color: #dc2626;
}

.change-row {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 20px;
    padding: 14px 16px;

    background: #f9fafb;
    border-radius: 8px;
}

.change-row span {
    color: #6b7280;
}

.change-row strong {
    font-size: 18px;
    color: #16a34a;
}

.backend-error {
    display: flex;
    align-items: center;
    gap: 8px;

    margin-top: 16px;
    padding: 10px 12px;

    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
}

</style>