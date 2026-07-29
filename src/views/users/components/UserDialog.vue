<script setup>
import { computed } from "vue";
import { reactive } from "vue";

import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Select from "primevue/select";
import ToggleSwitch from "primevue/toggleswitch";
import Button from "primevue/button";
import { createUserSchema, updateUserSchema } from "@/validation/userSchema";

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
    roles: {
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
    full_name: "",
    username: "",
    password: "",
    phone: "",
    role_id: "",
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
        ? "Add User"
        : "Edit User";
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
            ? createUserSchema // ada validasi password
            : updateUserSchema; // tidak ada validasi password

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

/*
|--------------------------------------------------------------------------
| validasi phone number
|--------------------------------------------------------------------------
*/
function onlyPhoneChars(event) {
    const char = event.key;

    if (
        !/[0-9]/.test(char) &&
        !(char === "+" && event.target.selectionStart === 0)
    ) {
        event.preventDefault();
    }
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
            <!-- Full name -->
            <div class="field">
                <label>Full Name</label>
                <InputText
                    v-model="form.full_name"
                    fluid
                    :invalid="!!errors.full_name"
                    @input="clearError('full_name')"
                />
                <small class="p-error">
                    {{ errors.full_name }}
                </small>
            </div>
            <!-- Username -->
            <div class="field">
                <label>Username</label>
                <InputText
                    v-model="form.username"
                    fluid
                    :disabled="mode === 'edit'"
                    :invalid="!!errors.username"
                    @input="clearError('username')"
                />
                <small class="p-error">
                    {{ errors.username  }}
                </small>
            </div>
            <!-- Password -->
            <div class="field" v-if="mode === 'create'">
                <label>Password</label>
                <Password
                    v-model="form.password"
                    :feedback="false"
                    toggleMask
                    fluid
                    :invalid="!!errors.password"
                    @input="clearError('password')"
                />
                <small class="p-error">
                    {{ errors.password }}
                </small>
            </div>
            <!--Phone-->
            <div class="field">
                <label>Phone</label>
                <InputText
                    v-model="form.phone"
                    fluid
                    :invalid="!!errors.phone"
                    @keypress="onlyPhoneChars"
                    @input="clearError('phone')"
                />
                <small class="p-error">
                    {{ errors.phone }}
                </small>
            </div>
            <!--Role-->
            <div class="field">
                <label>Role</label>
                <Select
                    v-model="form.role_id"
                    :options="roles"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Select Role"
                    fluid
                    :invalid="!!errors.role_id"
                    @update:modelValue="clearError('role_id')"
                />
                <small class="p-error">
                    {{ errors.role_id }}
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