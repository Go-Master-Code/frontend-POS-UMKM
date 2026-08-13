<script setup>
    import Dialog from "primevue/dialog";
    import Button from "primevue/button";

    const props = defineProps({
        visible: {
            type: Boolean,
            default: false,
        },
        sale: {
            type: Object,
            default: null,
        },
    });

    const emit = defineEmits([
        "update:visible",
    ]);

    function close() {
        emit("update:visible", false);
    }

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
        header="Transaction Successful"
        :style="{width: '420px'}"
        @update:visible="emit('update:visible', $event)"
    >
        <div class="success-content">
            <div class="success-icon">
                <i class="pi pi-check"></i>
            </div>
            <h3>
                Payment Successful
            </h3>
            <p>
                Transaction has been recorded successfully.
            </p>

            <div
                v-if="sale"
                class="transaction-summary"
            >
                <div>
                    <span>Invoice</span>
                    <strong>
                        {{ sale.invoice_number }}
                    </strong>
                </div>

                <div>
                    <span>Total</span>
                    <strong>
                        {{ formatCurrency(sale.grand_total) }}
                    </strong>
                </div>

                <div>
                    <span>Payment</span>
                    <strong>
                        {{ sale.payment_method }}
                    </strong>
                </div>
            </div>
        </div>

        <template #footer>
            <Button
                label="Done"
                icon="pi pi-check"
                @click="close"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.success-content {
    text-align: center;
}

.success-icon {
    width: 64px;
    height: 64px;

    margin: 8px auto 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: var(--p-green-100);
    color: var(--p-green-600);

    font-size: 28px;
}

.success-content h3 {
    margin: 0 0 6px;
}

.success-content p {
    margin: 0 0 20px;
    color: var(--text-color-secondary);
}

.transaction-summary {
    display: flex;
    flex-direction: column;
    gap: 10px;

    padding: 14px;

    border-radius: 8px;
    background: var(--surface-ground);

    text-align: left;
}

.transaction-summary > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
}

.transaction-summary span {
    color: var(--text-color-secondary);
}
</style>