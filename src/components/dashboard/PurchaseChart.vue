<script setup>

import { computed } from "vue";

import Chart from "primevue/chart";
import Card from "primevue/card";
import Skeleton from "primevue/skeleton"

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

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
        {
            label: "Purchase",
            data: props.values,
            borderColor: "#16A34A",
            backgroundColor: "rgba(22,163,74,.15)",
            fill: true,
            tension: .35
        }
    ]
}));

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
            Purchase Last 7 Days
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