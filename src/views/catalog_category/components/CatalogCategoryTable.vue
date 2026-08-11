<script setup>
    import DataTable from "primevue/datatable";
    import Column from "primevue/column";
    import Button from "primevue/button";
    import { formatShortDate } from '@/utils/dateFormatter';

    /*
    |--------------------------------------------------------------------------
    | Props
    |--------------------------------------------------------------------------
    */
    defineProps({
        // data catalog category
        catalog_category: {
            type: Array,
            default: () => [],
        },
        // loading state
        loading: {
            type: Boolean,
            default: false,
        },
        // halaman aktif (1-based)
        page: {
            type: Number,
            default: 1,
        },
        // jumlah row per halaman
        rows: {
            type: Number,
            default: 10,
        },
        // total seluruh data
        totalRecords: {
            type: Number,
            default: 0,
        },
        // field yang sedang di sort
        sortField: {
            type: String,
            default: "created_at",
        },
        // 1 = asc, -1 = desc (format primevue)
        sortOrder: {
            type: Number,
            default: -1,
        },
    });

    /*
    |--------------------------------------------------------------------------
    | Emit
    |--------------------------------------------------------------------------
    */

    const emit = defineEmits([
        "page",
        "sort",
        "edit",
        "delete",
    ]);

    /**
     * Meneruskan event sort ke parent.
     */
    function handleSort(event) {
        emit("sort", event);
    }

    // meneruskan event page ke parent
    function handlePage(event) {
        emit("page", event);
    }
</script>

<template>
    <DataTable
        :value="catalog_category"
        :loading="loading"
        size="small"
        lazy

        :sortField="sortField"
        :sortOrder="sortOrder"
        
        :rows="rows"
        :first="(page - 1) * rows"
        :totalRecords="totalRecords"

        @page="handlePage"
        @sort="handleSort"

        responsiveLayout="scroll"
        stripedRows
        showGridlines
        removableSort
        dataKey="id"

        :rowsPerPageOptions="[10,20,50,100]"

        paginator
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
    >

        <!-- Catalog Category Name -->
        <Column
            field="name"
            header="Category"
            sortable
        />

        <!-- Created at -->
        <Column
            field="created_at"
            header="Created At"
            sortable
        >
            <template #body="{ data }">
                {{ formatShortDate(data.created_at) }}
            </template>
        </Column>

        <!-- Action -->
        <Column
            header="Action"
            style="width: 140px"
        >
            <template #body="{ data }">
                <div class="action-buttons">
                    <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        severity="warning"
                        @click="$emit('edit',data)"
                    />
                    <Button
                        icon="pi pi-trash"
                        text
                        rounded
                        severity="danger"
                        @click="$emit('delete',data)"
                    />
                </div>
            </template>
        </Column>

        <!-- emptymessage jika data search tidak ditemukan -->
        <template #empty>
            <div class="empty-state">
                <i class="pi pi-search empty-icon"></i>
                <div class="empty-title">
                    No categories found
                </div>
                <div class="empty-description">
                    Try changing your search keyword.
                </div>
            </div>
        </template>
    </DataTable>
</template>

<style scoped>

.empty-state{
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:48px 16px;
    color:#6b7280;
}

.empty-icon{
    font-size:2rem;
    margin-bottom:12px;
    color:#9ca3af;
}

.empty-title{
    font-size:16px;
    font-weight:600;
    color:#374151;
}

.empty-description{
    margin-top:4px;
    font-size:14px;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: nowrap;
    white-space: nowrap;
}

</style>