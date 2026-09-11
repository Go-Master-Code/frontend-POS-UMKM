<script setup>
    import { ref } from "vue";

    import Button from "primevue/button";
    import DatePicker from "primevue/datepicker"

    import { generateSalesReportPDF } from "@/api/reports";

    import { useToast } from "primevue/usetoast";

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    // periode laporan
    const startingDate = ref(null);
    const finishDate = ref(null);

    // loading generate report
    const loading = ref(false);

    // untuk menampilkan error backend
    const backendError = ref("");

    // toast
    const toast = useToast();

    /*
    |--------------------------------------------------------------------------
    | Methods
    |--------------------------------------------------------------------------
    */

    // Generate sales report berdasarkan periode
    async function generateReport() {
        // bersihkan error sebelumnya
        backendError.value = "";

        // validasi tanggal
        if (!startingDate.value || !finishDate.value) {
            toast.add({
                severity: "warn",
                summary: "Incomplete Period",
                detail: "Please select starting date and finish date.",
                life: 3000
            });

            return;
        }

        // Pastikan finish date tidak lebih kecil dari starting date
        if (finishDate.value < startingDate.value) {
            toast.add({
                severity: "warn",
                summary: "Invalid Period",
                detail: "Finish date cannot be earlier than starting date.",
                life: 3000
            });

            return;
        }

        loading.value = true;

        try {
            const response = await generateSalesReportPDF({
                start_date: formatDate(startingDate.value),
                end_date: formatDate(finishDate.value),
            });

            const blob = new Blob(
                [response.data],
                { type: "application/pdf" }
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download =
                `sales-report-${formatDate(startingDate.value)}-${formatDate(finishDate.value)}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to generate sales report:", err);

            backendError.value =
                err.response?.data?.error ??
                "Failed to generate sales report.";

            toast.add({
                severity: "error",
                summary: "Failed",
                detail: backendError.value,
                life: 4000
            });
        } finally {
            loading.value = false;
        }
    }

    /**
     * Format Date menjadi YYYY-MM-DD.
     *
     * Contoh:
     * 11 September 2026
     * menjadi:
     * 2026-09-11
     */
    function formatDate(date) {
        if (!date) {
            return null;
        }

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }
</script>

<template>
    <div class="card">
        <!-- Header -->
        <div class="page-header">
            <div>
                <h2>Sales Report</h2>
                <small>
                    View sales report for a selected period.
                </small>
            </div>
        </div>

        <!-- Period Filter -->
        <div class="report-filter">
            <!-- Starting date -->
            <div class="date-field">
                <label for="starting-date">
                    Starting Date
                </label>

                <DatePicker
                    input-id="starting-date"
                    v-model="startingDate"
                    date-format="dd/mm/yy"
                    show-icon
                    placeholder="Select starting date"
                    :max-date="finishDate"
                />
            </div>

            <!-- Finish date -->
            <div class="date-field">
                <label for="finish-date">
                    Finish Date
                </label>

                <DatePicker
                    input-id="finish-date"
                    v-model="finishDate"
                    date-format="dd/mm/yy"
                    show-icon
                    placeholder="Select finish date"
                    :min-date="startingDate"
                />
            </div>

            <!-- Generate button -->
            <div class="report-action">
                <Button
                    label="Generate Report"
                    icon="pi pi-chart-bar"
                    :loading="loading"
                    :disabled="!startingDate || !finishDate"
                    @click="generateReport"
                />
            </div>
        </div>

        <!-- Backend Error -->
        <small
            v-if="backendError"
            class="backend-error"
        >
            {{ backendError }}
        </small>
    </div>
</template>

<style scoped>
.page-header {
    display: flex;

    justify-content: space-between;
    align-items: center;

    margin-bottom: 24px;
}

.page-header h2 {
    margin: 0;

    font-size: 20px;
    font-weight: 700;

    color: #111827;
}

.page-header small {
    display: block;

    margin-top: 4px;

    color: #6b7280;
}

/* Report Filter */

.report-filter {
    display: flex;

    align-items: flex-end;

    gap: 16px;
}

.date-field {
    width: 220px;
}

.date-field label {
    display: block;

    margin-bottom: 6px;

    font-size: 13px;
    font-weight: 600;

    color: #374151;
}

.date-field :deep(.p-datepicker) {
    width: 100%;
}

.date-field :deep(.p-datepicker-input) {
    width: 100%;
}

.report-action {
    flex-shrink: 0;
}

.report-action .p-button {
    height: 36px;
}

/* Backend Error */

.backend-error {
    display: block;

    margin-top: 12px;

    color: #dc2626;
}
</style>