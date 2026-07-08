<script setup>
/*
|--------------------------------------------------------------------------
| PrimeVue
|--------------------------------------------------------------------------
*/
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';

// import vue
import { reactive } from 'vue';

// import validation
import { changePasswordSchema } from '@/validation/changePasswordSchema';

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/
const props = defineProps ({
    visible: Boolean,
    loading: Boolean,
    backendError: {
        type: String,
        default: ""
    }
});

/*
|--------------------------------------------------------------------------
| Emit
|--------------------------------------------------------------------------
*/
const emit = defineEmits ([
    "update:visible",
    "save"
]);

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/
const form = reactive ({
    old_password: "",
    new_password: "",
    confirm_password: ""
});

/*
|--------------------------------------------------------------------------
| Validation Error
|--------------------------------------------------------------------------
*/
const errors = reactive ({
    old_password: "",
    new_password: "",
    confirm_password: ""
});

/*
|--------------------------------------------------------------------------
| Reset Form
|--------------------------------------------------------------------------
*/
function resetForm() {
    form.old_password = "";
    form.new_password = "";
    form.confirm_password = "";

    errors.old_password = "";
    errors.new_password = "";
    errors.confirm_password = "";
}

/*
|--------------------------------------------------------------------------
| Close Dialog
|--------------------------------------------------------------------------
*/
function closeDialog() {
    resetForm();
    emit(
        "update:visible",
        false
    );
}

/*
|--------------------------------------------------------------------------
| Validate Form
|--------------------------------------------------------------------------
| Memvalidasi seluruh input menggunakan schema Zod.
|
| Alur:
| 1. Bersihkan semua pesan error lama.
| 2. Validasi seluruh field terhadap schema.
| 3. Jika valid -> return true.
| 4. Jika tidak valid -> simpan pesan error setiap field.
| 5. Return false agar proses submit dihentikan.
|--------------------------------------------------------------------------
*/
function validateForm() {
    // hapus semua pesan error sebelum validasi baru
    Object.keys(errors).forEach(key => {
        errors[key] = "";
    });

    // validasi object form menggunakan schema Zod
    const result = changePasswordSchema.safeParse(form);
    if (result.success) { // jika semua field valid
        return true
    }

    // simpan pesan error setiap field
    result.error.issues.forEach(issue => {
        const field = issue.path[0];

        // hanya tampilkan pesan pertama pada setiap field
        if (field && errors[field] === "") {
            errors[field] = issue.message;
        }
    });

    // terdapat minimal satu field yang tidak valid
    return false;
}

/*
|--------------------------------------------------------------------------
| Submit Form
|--------------------------------------------------------------------------
| Dipanggil saat tombol Save ditekan.
|
| Alur:
| 1. Jalankan validasi form.
| 2. Jika validasi gagal -> hentikan proses submit.
| 3. Jika valid -> kirim data ke parent component.
|
| Catatan:
| Component ini tidak melakukan request API secara langsung.
| Tugasnya hanya mengirim data yang sudah valid melalui emit.
|--------------------------------------------------------------------------
*/
function submitForm() {
    // hentikan submit jika validasi gagal
    if (!validateForm()) {
        return;
    }

     // kirim data yang sudah valid ke parent component
    emit(
        "save",
        { ...form}
    );
}
</script>

<template>
    <Dialog
        :visible="visible"
        modal
        header="Change Password"
        :style="{ width: '520px' }"
        @update:visible="closeDialog"
    >
        <!-- =========================
             FORM
        ========================== -->
        <div class="form-grid">
            <!-- Current password -->
            <div class="field">
                <label>Current Password</label>
                <Password
                    v-model="form.old_password"
                    toggleMask
                    :feedback="false"
                    fluid
                    :invalid="!!errors.old_password"
                />
                <small class="p-error">
                    {{ errors.old_password }}
                </small>
            </div>

            <!-- New password -->
            <div class="field">
                <label>New Password</label>
                <Password
                    v-model="form.new_password"
                    toggleMask
                    :feedback="false"
                    fluid
                    :invalid="!!errors.new_password"
                />
                <small class="p-error">
                    {{ errors.new_password }}
                </small>
            </div>

            <!-- Confirm password -->
            <div class="field">
                <label>Confirm Password</label>
                <Password
                    v-model="form.confirm_password"
                    toggleMask
                    :feedback="false"
                    fluid
                    :invalid="!!errors.confirm_password"
                />
                <small class="p-error">
                    {{ errors.confirm_password }}
                </small>
            </div>
        </div>

        <div
            v-if="backendError"
            class="footer-error"
        >
            <Message
                severity="error"
                :closable="false"
            >
                {{ backendError }}
            </Message>
        </div>

        <!-- =========================
             FOOTER
        ========================== -->
        <template #footer>
            <Button
                label="Cancel"
                severity="secondary"
                outlined
                :disabled="loading"
                @click="closeDialog"
            />
            <Button
                label="Save"
                icon="pi pi-save"
                :loading="loading"
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

/* backend error */

.footer-error{
    margin-bottom:14px;
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


