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

    // ranking medal (icon medal untuk 3 besar)
    function getRank(index) {
        switch(index) {
            case 0:
                return "🥇";
            case 1:
                return "🥈";
            case 2:
                return "🥉";
            default:
                return `${index + 1}.`;
        }
    }
</script>

<template>
    <Card>
        <template #title>
            🏆 Top Selling Products
        </template>
        <template #content>
            <!--Loading Skeleton-->
            <template v-if="loading">
                <div
                    v-for="n in 3"
                    :key="n"
                    class="product-row"
                >
                    <Skeleton
                        width="30px"
                        height="24px"
                    />
                    <div class="product-info">
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
                        width="40px"
                        height="20px"
                    />
                </div>
            </template>

            <!-- Empty state -->
             <div
                v-else-if="items.length === 0"
                class="empty-state"
            >
                No sales yet.
            </div>
            
            <template v-else>
            <!-- Product List -->
                <div
                    v-for="(item,index) in items"
                    :key="item.item_variant_id"
                    class="product-row"
                >
                    <!-- Ranking -->
                    <div class="rank">
                        {{ getRank(index) }}
                    </div>

                    <!-- Product -->
                    <div class="product-info">
                        <div class="product-name">
                            {{ item.item_name }}
                        </div>
                        <div class="variant-name">
                            {{ item.variant_name }}
                        </div>
                    </div>
                

                    <!-- Qty -->
                    <div class="qty">
                        {{ item.qty_sold }}
                    </div>
                </div>
            </template>
        </template>
    </Card>
</template>

<style scoped>

.product-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:12px 0;
    border-bottom:1px solid #f3f4f6;
}

.product-row:last-child{
    border-bottom:none;
}

.rank{
    width:48px;
    font-size:1.2rem;
}

.product-info{
    flex:1;
}

.product-name{
    font-weight:600;
}

.variant-name{
    color:#6B7280;
    font-size:.85rem;
}

.qty{
    font-weight:700;
    color:#2563EB;
}

.empty-state{
    text-align:center;
    color:#9CA3AF;
    padding:24px;
}
</style>