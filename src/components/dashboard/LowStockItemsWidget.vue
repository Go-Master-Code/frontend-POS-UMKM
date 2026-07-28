<script setup>
    import Card from "primevue/card";
    import Skeleton from "primevue/skeleton";

    // props
    const props = defineProps({
        items: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        }
    });

    // status color -> memberikan warna berdasarkan kondisi stock
    function getSeverity(item) {
        if (item.current_stock === 0) {
            return "#DC2626"; // merah
        }
        return "#F59E0B"; // oranye
    }
</script>

<template>
    <Card>
        <template #title>
            ⚠️ Low Stock
        </template>
        <template #content>
            <!--Loading Skeleton-->
            <template v-if="loading">
                <div
                    v-for="n in 3"
                    :key="n"
                    class="stock-row"
                >
                    <div class="stock-info">

                        <Skeleton
                            width="180px"
                            height="18px"
                        />

                        <Skeleton
                            width="120px"
                            height="14px"
                            class="mt-2"
                        />

                    </div>

                    <Skeleton
                        width="42px"
                        height="30px"
                        borderRadius="999px"
                    />

                </div>
            </template>
            <!-- Empty state -->
             <div
                v-else-if="items.length === 0"
                class="empty-state"
            >
                No low stock items.
            </div>

            <div
                v-for="item in items"
                :key="item.item_variant_id"
                class="stock-row"
            >

                <div class="stock-info">
                    <div class="item-name">
                        {{ item.item_name }}
                    </div>
                    <div class="variant-name">
                        {{ item.variant_name }}
                    </div>
                </div>

                <div
                    class="stock-badge"
                    :style="{
                        backgroundColor:getSeverity(item)
                    }"
                >
                    {{ item.current_stock }}
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>

.stock-row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:12px 0;
    border-bottom:1px solid #F3F4F6;
}

.stock-row:last-child{
    border-bottom:none;
}

.stock-info{
    flex:1;
}

.item-name{
    font-weight:600;
}

.variant-name{
    font-size:.85rem;
    color:#6B7280;
}

.stock-badge{
    min-width:42px;
    text-align:center;
    color:white;
    font-weight:700;
    padding:6px 10px;
    border-radius:999px;
}

.empty-state{
    text-align:center;
    color:#9CA3AF;
    padding:24px;
}

</style>