<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

defineOptions({
    name: "AppMenuItem",
});

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const router = useRouter();
const route = useRoute();

/*
|--------------------------------------------------------------------------
| Status expand lokal
|--------------------------------------------------------------------------
*/
const expanded = ref(false);

/*
|--------------------------------------------------------------------------
| Mengecek apakah ada child yang sedang aktif
|--------------------------------------------------------------------------
*/
function hasActiveChild(children) {
    return children.some((child) => {
        if (child.route === route.path) {
            return true;
        }

        if (child.items) {
            return hasActiveChild(child.items);
        }

        return false;
    });
}

/*
|--------------------------------------------------------------------------
| Parent akan terbuka jika:
| - dibuka manual
| - ada child aktif
|--------------------------------------------------------------------------
*/
const isExpanded = computed(() => {
    if (!props.item.items) return false;

    return expanded.value || hasActiveChild(props.item.items);
});

/*
|--------------------------------------------------------------------------
| Menu aktif
|--------------------------------------------------------------------------
*/
const isActive = computed(() => route.path === props.item.route);

/*
|--------------------------------------------------------------------------
| Klik menu
|--------------------------------------------------------------------------
*/
function handleClick() {

    // Parent menu
    if (props.item.items) {
        expanded.value = !expanded.value;
        return;
    }

    // Menu biasa
    if (props.item.route) {
        router.push(props.item.route);
    }

}
</script>

<template>
    <div class="menu-wrapper">
        <!-- Menu -->
        <div
            class="menu-item"
            :class="{
                active: isActive
            }"
            @click="handleClick"
        >

            <!-- Icon -->
            <i
                :class="item.icon"
                class="menu-icon"
            />

            <!-- Label -->
            <span class="menu-label">
                {{ item.label }}
            </span>

            <!-- Arrow -->
            <i
                v-if="item.items"
                class="pi pi-angle-down expand-icon"
                :class="{ rotate:isExpanded }"
            />

        </div>

        <!-- Child -->
        <Transition name="submenu">

            <div
                v-if="item.items && isExpanded"
                class="submenu"
            >

                <AppMenuItem
                    v-for="child in item.items"
                    :key="child.key"
                    :item="child"
                />

            </div>

        </Transition>

    </div>
</template>

<style scoped>
.menu-wrapper{
    position:relative;
}

.menu-item{
    height:46px;
    display:flex;
    align-items:center;
    gap:14px;
    padding:0 20px;
    transition:.2s;
}

.sidebar{
    width:260px;
    height:100vh;

    display:flex;
    flex-direction:column;

    background:#fff;

    border-right:1px solid #e5e7eb;
}

.menu-item:hover{
    background:#f5f5f5;
}

.active{
    background:#eff6ff;
    color:#2563eb;
    font-weight:600;
}

.menu-icon{
    width:18px;
    text-align:center;
}

.menu-label{
    flex:1;
}

.expand-icon{
    transition:.25s;
}

.rotate{
    transform:rotate(180deg);
}

.submenu{
    margin-left:20px;
}

/* Animasi buka/tutup submenu */
.submenu-enter-active,
.submenu-leave-active{
    transition:all .2s ease;
    overflow:hidden;
}

.submenu-enter-from,
.submenu-leave-to{
    opacity:0;
    transform:translateY(-4px);
}
</style>