<script setup>
    import Card from 'primevue/card';
    import Skeleton from "primevue/skeleton";

    import { formatCurrency } from '@/utils/formatter';
    import { formatShortDate } from '@/utils/dateFormatter';

    // props
    defineProps({
        items: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    });
</script>

<template>
    <Card>
        <template #title>
            <i class="pi pi-receipt mr-2"></i>Recent Sales
        </template>
        <template #content>
            <!-- ==========================================
                    Loading Skeleton
            =========================================== -->

            <template v-if="loading">

                <div
                    v-for="n in 5"
                    :key="n"
                    class="sale-row"
                >
                    <!-- Avatar -->
                    <Skeleton
                        shape="circle"
                        size="42px"
                    />
                    <!-- Invoice + Cashier -->
                    <div class="sale-info">

                        <Skeleton
                            width="150px"
                            height="18px"
                        />

                        <Skeleton
                            width="100px"
                            height="14px"
                            class="mt-2"
                        />

                    </div>
                    <!-- Grand Total -->
                    <Skeleton
                        width="80px"
                        height="18px"
                    />
                </div>
            </template>

            <!--Empty state-->
            <div
                v-if="items.length === 0"
                class="empty-state"
            >
                No recent sales.
            </div>

            <!--List-->
            <div
                v-for="sale in items"
                :key="sale.sale_id"
                class="sale-row"
            >
                <!--Left-->
                <div class="sale-info">
                    <div class="invoice">
                        <i class="pi pi-file mr-2"></i>{{ sale.invoice_number }}
                    </div>
                    <div class="customer">
                        👤 {{ sale.customer_name }}
                    </div>
                    <div class="cashier">
                        🧑 {{ sale.cashier_name }}
                    </div>
                </div>

                <!--Right-->
                <div class="sale-summary">
                    <div class="amount">
                        {{ formatCurrency(sale.grand_total) }}
                    </div>
                    <div class="date">
                        {{ formatShortDate(sale.created_at) }}
                    </div>
                </div>
            </div>
        </template>
    </Card>

</template>

<style scoped>

.sale-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:14px 0;
    border-bottom:1px solid #F3F4F6;
}

.sale-row:last-child{
    border-bottom:none;
}

.sale-info{
    display:flex;
    flex-direction:column;
    gap:4px;
}

.invoice{
    font-weight:700;
}

.customer{
    color:#374151;
}

.cashier{
    font-size:.8rem;
    color:#9CA3AF;
}

.sale-summary{
    text-align:right;
}

.amount{
    font-weight:700;
    color:#16A34A;
}

.date{
    font-size:.8rem;
    color:#9CA3AF;
}

.empty-state{
    text-align:center;
    color:#9CA3AF;
    padding:24px;
}

/* =====================================
                Avatar
===================================== */

.avatar{
    width:42px;
    height:42px;
    border-radius:50%;
    background:#DBEAFE;
    color:#2563EB;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:700;
}
</style>