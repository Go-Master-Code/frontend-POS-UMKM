<script setup>
import { computed, reactive, ref } from "vue";

import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber"
import ToggleSwitch from "primevue/toggleswitch";
import Button from "primevue/button";
import { createItemVariantSchema,updateItemVariantSchema } from "@/validation/itemVariantSchema";

import Message from "primevue/message"; // untuk tampilkan error backend

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    mode: {
        type: String,
        default: "create", // create atau edit
    },
    form: {
        type: Object,
        required: true,
    },
    item_variant: {
        type: Array,
        default: () => [],
    },
    backendError: {
        type: String,
        default: ""
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

/*
|--------------------------------------------------------------------------
| Object error untuk validasi field
|--------------------------------------------------------------------------
*/
const errors = reactive({
    variant_name: "",
    sku: "",
    barcode: "",
    cost_price: "",
    selling_price: "",
    minimum_stock: "",
    initial_stock: "",
    is_active: false,
});

// mode dialog
const dialogMode = ref("create");

/*
|--------------------------------------------------------------------------
| Emit
|--------------------------------------------------------------------------
*/
const emit = defineEmits([
    "update:visible",
    "save",
    "clear-error"
]);

/*
|--------------------------------------------------------------------------
| Dialog Title
|--------------------------------------------------------------------------
*/
const dialogTitle = computed(() => {
    return props.mode === "create"
        ? "Add Item Variant"
        : "Edit Item Variant";
});

/*
|--------------------------------------------------------------------------
| Close Dialog
|--------------------------------------------------------------------------
*/
function closeDialog() {
    clearErrors();
    emit("update:visible", false);
    emit("clear-error"); // clear backend error saat dialog ditutup
}

/*
|--------------------------------------------------------------------------
| Clear Errors dari form
|--------------------------------------------------------------------------
*/
function clearErrors() {
    Object.keys(errors).forEach(key => {
        errors[key] = "";
    });
}

/*
|--------------------------------------------------------------------------
| Clear Error dari field
|--------------------------------------------------------------------------
*/
function clearError(field) {
    errors[field] = "";
}

/*
|--------------------------------------------------------------------------
| Validasi form
|--------------------------------------------------------------------------
*/
function validateForm() {
    // reset error
    Object.keys(errors).forEach(key => {
        errors[key] = "";
    });

    // pilih skema yang digunakan, create dan edit berbeda.
    const schema =
        props.mode === "create"
            ? createItemVariantSchema
            : updateItemVariantSchema;

    const result = schema.safeParse(props.form); // schema dipilih berdasarkan mode

    if (result.success) {
        return true
    }

    result.error.issues.forEach(issue => {
        const field = issue.path[0];

        if (field && errors[field] === "") {
            errors[field] = issue.message;
        }
    });

    return false
}

/*
|--------------------------------------------------------------------------
| Submit form
|--------------------------------------------------------------------------
*/
function submitForm() {
    // console.log("submit clicked");
    if (!validateForm()) {
        return;
    }
    emit("save");
}

</script>

<template>
    <Dialog
        :visible="visible"
        modal
        :header="dialogTitle"
        :style="{ width: '520px' }"
        @update:visible="closeDialog"
    >
        <div class="form-grid">
            <!-- Item Variant -->
            <div class="field">
                <label>Variant</label>
                <InputText
                    v-model="form.variant_name"
                    fluid
                    :invalid="!!errors.variant_name"
                    @input="clearError('variant_name')"
                />
                <small class="p-error">
                    {{ errors.variant_name }}
                </small>
            </div>

            <!-- SKU -->
            <div class="field">
                <label>SKU</label>
                <InputText
                    v-model="form.sku"
                    fluid
                    :invalid="!!errors.sku"
                    @input="clearError('sku')"
                />
                <small class="p-error">
                    {{ errors.sku }}
                </small>
            </div>

            <!-- Barcode -->
            <div class="field">
                <label>Barcode</label>
                <InputText
                    v-model="form.barcode"
                    fluid
                    :invalid="!!errors.barcode"
                    @input="clearError('barcode')"
                />
                <small class="p-error">
                    {{ errors.barcode }}
                </small>
            </div>

            <!-- Cost Price -->
            <div class="field">
                <label>Cost Price</label>
                <InputNumber
                    v-model="form.cost_price"
                    fluid
                    :invalid="!!errors.cost_price"
                    @input="clearError('cost_price')"
                />
                <small class="p-error">
                    {{ errors.cost_price }}
                </small>
            </div>

            <!-- Selling Price -->
            <div class="field">
                <label>Selling Price</label>
                <InputNumber
                    v-model="form.selling_price"
                    fluid
                    :invalid="!!errors.selling_price"
                    @input="clearError('selling_price')"
                />
                <small class="p-error">
                    {{ errors.selling_price }}
                </small>
            </div>

            <!-- Current Stock -->
            <div 
                v-if="props.mode === 'create'"
                class="field"
            >
                <label>Initial Stock</label>
                <InputNumber
                    v-model="form.initial_stock"
                    fluid
                    :invalid="!!errors.initial_stock"
                    @input="clearError('initial_stock')"
                />
                <small class="p-error">
                    {{ errors.initial_stock }}
                </small>
            </div>

            <!-- Minimum Stock -->
            <div class="field">
                <label>Minimum Stock</label>
                <InputNumber
                    v-model="form.minimum_stock"
                    fluid
                    :invalid="!!errors.minimum_stock"
                    @input="clearError('minimum_stock')"
                />
                <small class="p-error">
                    {{ errors.minimum_stock }}
                </small>
            </div>

            <!--Active-->
            <div class="field active-field">
                <label>Active</label>
                <ToggleSwitch
                    v-model="form.is_active"
                />
            </div>
        </div>

        <!-- backend error sebelum footer -->
        <div 
            v-if="backendError"
            class="dialog-error"
        >
            <!-- untuk menampilkan pesan error -->
            <Message
                severity="error"
                :closable="false"
            >
                {{ backendError }}
            </Message>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                outlined
                @click="closeDialog"
            />

            <Button
                label="Save"
                icon="pi pi-save"
                :loading="props.loading"
                @click="submitForm"
            />
        </template>
    </Dialog>
</template>

<style scoped>

.form-grid{
    display:flex;
    flex-direction:column;
}

.field{
    display:flex;
    flex-direction:column;
}

.field label{
    font-weight:600;
}

.active-field{
    flex-direction:row;
    justify-content:space-between;
    align-items:center;
}

.dialog-error{
    margin-top:16px;
}

.dialog-footer{
    display:flex;
    flex-direction:column;
    gap:12px;
}

.footer-buttons{
    display:flex;
    justify-content:flex-end;
    gap:10px;
}
</style>