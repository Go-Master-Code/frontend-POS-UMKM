<script setup>
import { computed } from "vue";
import { reactive } from "vue";

import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import ToggleSwitch from "primevue/toggleswitch";
import Button from "primevue/button";
import { catalogItemSchema } from "@/validation/catalogItemSchema";

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
    catalog_category: {
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
    name: "",
    category_id: "",
    category_name: "",
    description: "",
    is_active: false,
});

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
        ? "Add Catalog Item"
        : "Edit Catalog Item";
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
    const schema = catalogItemSchema

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
            <!-- Catalog Item -->
            <div class="field">
                <label>Item</label>
                <InputText
                    v-model="form.name"
                    fluid
                    :invalid="!!errors.name"
                    @input="clearError('name')"
                />
                <small class="p-error">
                    {{ errors.name }}
                </small>
            </div>

            <!--Catalog category-->
            <div class="field">
                <label>Category</label>
                <Select
                    v-model="form.category_id"
                    :options="catalog_category"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Category"
                    fluid
                    :invalid="!!errors.category_id"
                    @update:modelValue="clearError('category_id')"
                />
                <small class="p-error">
                    {{ errors.category_id }}
                </small>
            </div>

            <div class="field">
                <label>Description</label>
                <Textarea
                    v-model="form.description"
                    rows="3"
                    fluid
                />
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