<script setup>
/*
|--------------------------------------------------------------------------
| Sales Chart Component
|--------------------------------------------------------------------------
| Komponen ini hanya bertugas MENAMPILKAN chart.
| Komponen ini TIDAK melakukan request API.
| Data dikirim dari DashboardView melalui props.
|--------------------------------------------------------------------------
*/
import { computed } from "vue";

import Chart from "primevue/chart";
import Card from "primevue/card";
import Skeleton from "primevue/skeleton"

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
|
| labels
| contoh:
|
| [
|   "17 Jul",
|   "18 Jul",
|   "19 Jul"
| ]
|
|
| values
|
| contoh:
|
| [
|   250000,
|   350000,
|   180000
| ]
|
|--------------------------------------------------------------------------
*/
const props = defineProps({
    labels: {
        type: Array,
        default: () => []
    },
    values: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
});

/*
|--------------------------------------------------------------------------
| Chart Data
|--------------------------------------------------------------------------
|
| PrimeVue Chart membutuhkan object khusus.
|
| computed digunakan supaya setiap kali props berubah,
| chart otomatis ikut berubah tanpa perlu refresh.
|
|--------------------------------------------------------------------------
*/

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
        {
            label: "Sales",
            data: props.values,
            borderColor: "#16A34A",
            backgroundColor: "rgba(22,163,74,.15)",
            fill: true,
            tension: .35
        }
    ]
}));

/*
|--------------------------------------------------------------------------
| Chart Options
|--------------------------------------------------------------------------
|
| responsive
|     Chart mengikuti ukuran card
|
| maintainAspectRatio
|     false supaya tinggi bisa diatur CSS
|
|--------------------------------------------------------------------------
*/

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true
        }
    }
};
</script>

<template>
    <Card class="chart-card">
        <template #title>
            Sales Last 7 Days
        </template>
        <template #content>
            <!-- ======================================
                    Loading Skeleton
            ======================================= -->
            <div
                v-if="loading"
                class="chart-skeleton"
            >
                <!-- Title -->
                <Skeleton
                    width="180px"
                    height="20px"
                />

                <!-- Fake Chart -->
                <div class="chart-area">
                    <Skeleton
                        width="100%"
                        height="220px"
                    />
                </div>

                <!-- X Axis -->
                <div class="axis-labels">
                    <Skeleton
                        v-for="n in 7"
                        :key="n"
                        width="36px"
                        height="12px"
                    />
                </div>
            </div>
            <!--Chart-->
            <Chart
                v-else
                type="line"
                :data="chartData"
                :options="chartOptions"
                class="chart"
            />
        </template>
    </Card>
</template>

<style scoped>
.chart{
    height:320px;
}

.chart-card{
    width:100%;
    height:100%;
    border-radius:14px;
}

.chart-skeleton{
    display:flex;
    flex-direction:column;
    gap:20px;
}

.chart-area{
    width:100%;
}

.axis-labels{
    display:flex;
    justify-content:space-between;
}
</style>