<script setup>
    /*
    |--------------------------------------------------------------------------
    | Dashboard Card Component
    |--------------------------------------------------------------------------
    |
    | Komponen reusable untuk menampilkan statistik pada halaman Dashboard.
    |
    | Contoh penggunaan:
    |
    | <DashboardCard
    |     title="Sales Today"
    |     :value="2500000"
    |     icon="pi pi-shopping-cart"
    |     iconBg="#DCFCE7"
    |     iconColor="#16A34A"
    | />
    |
    |--------------------------------------------------------------------------
    */

   import Card from "primevue/card";
   /*
    |--------------------------------------------------------------------------
    | Props
    |--------------------------------------------------------------------------
    |
    | title      : Judul card
    | value      : Nilai statistik
    | icon       : PrimeIcons
    | iconBg     : Background icon
    | iconColor  : Warna icon
    |
    |--------------------------------------------------------------------------
    */

    import Skeleton  from "primevue/skeleton";

    // import function formatNumber dari src/utils/formatter
    import { formatCurrency, formatNumber } from "@/utils/formatter";

    import { computed } from "vue";

    const props = defineProps({
        title: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number],
            required: true,
        },
        format: {
            type: String,
            default: "number", // number | currency | text
        },
        icon: {
            type: String,
            default: "pi pi-chart-bar",
        },
        iconBg: {
            type: String,
            default: "#EFF6FF",
        },
        iconColor: {
            type: String,
            default: "#2563EB",
        },
        loading: {
            type: Boolean,
            default: false,
        }
    });

    // menampilkan nilai yang sudah diformat sesuai dengan tipe var nya:
    // currency, number, atau text
    const displayValue = computed(() => {
        switch (props.format) {
            case "currency":
                return formatCurrency(props.value);
            
            case "number":
                return formatNumber(props.value);

            default:
                return props.value;
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Format nilai statistik
    |--------------------------------------------------------------------------
    |
    | number   -> 12.500
    | currency -> Rp 12.500
    | text     -> tampil apa adanya
    |
    |--------------------------------------------------------------------------
    */
</script>

<template>
    <Card class="dashboard-card">
        <template #content>
            <div class="card-container">
                <!-- ==========================
                    Informasi Statistik
                =========================== -->
                <div class="card-info">
                    <!-- Judul -->
                    <div class="card-title">
                        <Skeleton
                            v-if="props.loading"
                            width="120px"
                            height="18px"
                        />
                        <template v-else>
                            {{ props.title }}
                        </template>
                    </div>

                    <!-- Nilai -->
                    <div class="card-value">
                        <Skeleton
                            v-if="props.loading"
                            width="170px"
                            height="34px"
                        />
                        <template v-else>
                            {{ displayValue }}
                        </template>
                    </div>
                </div>
                <!-- ==========================
                    Icon
                =========================== -->
                <div
                    v-if="!props.loading"
                    class="card-icon"
                    :style="{
                        backgroundColor: props.iconBg,
                        color: props.iconColor
                    }"
                    >
                    <i :class="props.icon"></i>
                </div>
                <Skeleton
                    v-else
                    shape="circle"
                    size="56px"
                />
            </div>
        </template>
    </Card>
</template>

<style scoped>
/* Card utama */

.dashboard-card{
    border:none;
    border-radius:14px;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
}

/* Layout */

.card-container{
    display:flex;
    justify-content:space-between;
    align-items:center;
}

/* Informasi */

.card-info{
    display:flex;
    flex-direction:column;
    gap:8px;
}

/* Judul */

.card-title{
    font-size:.9rem;
    color:#6B7280;
    font-weight:500;
}

/* Nilai */

.card-value{
    font-size:1.8rem;
    font-weight:700;
    color:#111827;
}

/* Icon */

.card-icon{
    width:56px;
    height:56px;
    border-radius:50%;
    display:flex;
    justify-content:center;
    align-items:center;
    font-size:1.5rem;
}
</style>