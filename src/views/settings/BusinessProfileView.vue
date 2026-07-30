<script setup>
    /*
    |--------------------------------------------------------------------------
    | Business Profile
    |--------------------------------------------------------------------------
    | Halaman untuk melihat dan mengubah profil bisnis tenant.
    |--------------------------------------------------------------------------
    */

    import { reactive, ref, computed, onMounted } from "vue";

    import { useToast } from "primevue/usetoast";

    // import func api untuk upload logo
    import { uploadLogo, deleteLogo } from "@/api/upload"

    // import schema untuk validasi komponen form
    import { businessProfileSchema } from "@/validation/businessProfileSchema";

    import Card from "primevue/card";
    import InputText from "primevue/inputtext";
    import Textarea from "primevue/textarea";
    // import Select from "primevue/select";
    import Button from "primevue/button";
    import FileUpload from "primevue/fileupload";
    import Image from "primevue/image";

    import Skeleton from "primevue/skeleton";

    import { getTenantProfile,updateTenantProfile } from "@/api/tenant";

    const toast = useToast();

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */
    const loading = ref(false);
    const saving = ref(false);
    
    const uploadingLogo = ref(false); // upload state
    const originalLogo = ref(""); // dipakai untuk menghapus file lama setelah profile berhasil disimpan. 

    const logoUrl = computed(() => {
        if (!form.logo) return "";

        return (
            import.meta.env.VITE_SERVER_URL +
            "/storage/logo/" +
            form.logo
        );
    });
    /*
    |--------------------------------------------------------------------------
    | Dropdown Options
    |--------------------------------------------------------------------------
    */
    const currencies = [
        {
            label: "Indonesian Rupiah (IDR)",
            value: "IDR"
        },
        {
            label: "US Dollar (USD)",
            value: "USD"
        },
        {
            label: "Singapore Dollar (SGD)",
            value: "SGD"
        }
    ];

    const timezones = [
        {
            label: "Asia/Jakarta",
            value: "Asia/Jakarta"
        },
        {
            label: "Asia/Singapore",
            value: "Asia/Singapore"
        },
        {
            label: "UTC",
            value: "UTC"
        }
    ];

    const errors = reactive({
        name: "",
        owner_name: "",
        phone: "",
        email: "",
        address: ""
    });

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const form = reactive({
        name: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
        currency: "IDR",
        time_zone: "Asia/Jakarta",
        receipt_footer: "",
        logo: ""
    });

    // state untuk original data => disable / enable button save changes
    const originalData = ref(
        JSON.parse(JSON.stringify(form))
    );

    /*
    |--------------------------------------------------------------------------
    | Detect Form Changes
    |--------------------------------------------------------------------------
    */
    const isDirty = computed(() => {
        return JSON.stringify(form)
            !==
            JSON.stringify(originalData.value);
    });

    /*
    |--------------------------------------------------------------------------
    | Load Profile
    |--------------------------------------------------------------------------
    */
    async function loadProfile() {
        loading.value = true;

        try {
            const response = await getTenantProfile();
            Object.assign(form, response.data.data); // isi data ke form
            // simpan original logo
            originalLogo.value = response.data.data.logo;

            /*
            |--------------------------------------------------------------------------
            | Simpan data asli
            |--------------------------------------------------------------------------
            | Dipakai untuk mengetahui apakah user mengubah form.
            | Parsing ke JSON karena deep copy, kalau langsung originalData.value = response.data.data; maka dua object akan menunjuk referensi yang sama
            |--------------------------------------------------------------------------
            */
            // Baru setelah form lengkap
            originalData.value = JSON.parse(
                JSON.stringify(form)
            );

            // DEBUG value data form dan orinal data
            // console.log(
            //     "FORM JSON:\n",
            //     JSON.stringify(form, null, 2)
            // );

            // console.log(
            //     "ORIGINAL JSON:\n",
            //     JSON.stringify(originalData.value, null, 2)
            // );

            // console.log(
            //     "Equal?",
            //     JSON.stringify(form) === JSON.stringify(originalData.value)
            // );
        } catch (error) {
            toast.add({
                severity: "error",
                summary: "Error",
                detail: error?.response?.data?.message ?? "Failed to load tenant profile.",
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Save Profile
    |--------------------------------------------------------------------------
    */
    async function saveProfile() {
        // validasi dulu semua komponen input
        if (!validateForm()) {
            return
        }

        // jika validasi berhasil
        saving.value = true;

        try {
            console.log("Payload Update:", JSON.stringify(form, null, 2));

            await updateTenantProfile(form);

            // delete old logo
            if (originalLogo.value && originalLogo.value !== form.logo) {
                try {
                    await deleteLogo(originalLogo.value);
                } catch (err) {
                    console.warn("Failed to delete old logo", err);
                }
            }

            // update original logo
            originalLogo.value = form.logo;

            // Reset dirty state
            originalData.value = JSON.parse(JSON.stringify(form));
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Tenant profile updated successfully.",
                life: 3000
            });
        } catch (error) {
            console.log(form);
            toast.add({
                severity: "error",
                summary: "Error",
                detail: error?.response?.data?.message ?? "Failed to update profile.",
                life: 3000
            });
        } finally {
            saving.value = false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Logo
    |--------------------------------------------------------------------------
    | Upload file ke backend kemudian update preview
    |--------------------------------------------------------------------------
    */

    async function handleLogoUpload(event) {

        /*
        |--------------------------------------------------------------------------
        | Ambil file pertama
        |--------------------------------------------------------------------------
        */

        const file = event.files?.[0];
        if (!file) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi ukuran
        |--------------------------------------------------------------------------
        */

        if (file.size > 2 * 1024 * 1024) {
            toast.add({
                severity: "error",
                summary: "Invalid File",
                detail: "Maximum file size is 2 MB.",
                life: 3000
            });
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi tipe
        |--------------------------------------------------------------------------
        */
        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.add({
                severity: "error",
                summary: "Invalid File",
                detail: "Only JPG and PNG are allowed.",
                life: 3000
            });
            return;
        }

        uploadingLogo.value = true;

        try {
            /*
            |--------------------------------------------------------------------------
            | Multipart FormData
            |--------------------------------------------------------------------------
            */
            const formData = new FormData();
            formData.append("file", file);

            /*
            |--------------------------------------------------------------------------
            | Upload
            |--------------------------------------------------------------------------
            */
            const response = await uploadLogo(formData);

            /*
            |--------------------------------------------------------------------------
            | Simpan nama file ke form
            |--------------------------------------------------------------------------
            */
            form.logo = response.data.data.file_name;

            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Logo uploaded successfully.",
                life: 3000
            });

        } catch (err) {
            toast.add({
                severity: "error",
                summary: "Upload Failed",
                detail:
                    err?.response?.data?.message ??
                    "Failed to upload logo.",
                life: 3000
            });
        } finally {
            uploadingLogo.value = false;
        }
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

        const schema = businessProfileSchema
        const result = schema.safeParse(form); // schema dipilih berdasarkan mode

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

    function onlyPhoneChars(event) {
        const char = event.key;

        if (
            !/[0-9]/.test(char) &&
            !(char === "+" && event.target.selectionStart === 0)
        ) {
            event.preventDefault();
        }
    }

    // load profile saat on mounted
    onMounted(loadProfile);
</script>

<template>
    <Card>
        <template #title>
            Business Profile
        </template>

        <template #content>
            <!-- ============================
                    Loading
            ============================= -->
            <div
                v-if="loading"
                class="section-container"
            >
                <Skeleton
                    v-for="n in 10"
                    :key="n"
                    height="48px"
                />
            </div>

            <!-- ============================
                    FORM
            ============================= -->
            <div
                v-else
                class="section-container"
            >
                <!-- ============================
                        Store Logo
                ============================= -->
                <div class="section">
                    <div class="section-title">
                        Store Logo
                    </div>

                    <div class="logo-container">
                        <!-- Logo Preview -->
                        <div class="logo-preview">
                            <Image
                                v-if="form.logo"
                                :src="logoUrl"
                                width="160"
                                preview
                            />
                            <div
                                v-else
                                class="logo-placeholder"
                            >
                                <i class="pi pi-shop"></i>
                            </div>
                        </div>

                        <!-- Upload Area -->
                        <div class="logo-upload">
                            <div class="upload-title">
                                Current Logo
                            </div>

                            <div class="upload-description">
                                Recommended image:
                                <ul>
                                    <li>JPG or PNG</li>
                                    <li>Maximum 2 MB</li>
                                    <li>Square image (recommended)</li>
                                </ul>
                            </div>

                            <FileUpload
                                mode="basic"
                                accept="image/png,image/jpeg"
                                :maxFileSize="2000000"
                                :customUpload="true"
                                :auto="true"
                                :disabled="uploadingLogo"
                                chooseLabel="Choose Logo"
                                @uploader="handleLogoUpload"
                            />
                        </div>
                    </div>
                </div>
                
                <!-- ============================
                        Business Information
                ============================= -->
                <div class="section">
                    <div class="section-title">
                        Business Information
                    </div>

                    <div class="form-grid">
                        <div class="field">
                            <label>Store Name</label>
                            <InputText
                                v-model="form.name"
                                fluid
                                :invalid="!!errors.name"
                                @input="clearError('name')"
                            />
                            <small
                                v-if="errors.name"
                                class="p-error"
                            >
                                {{ errors.name }}
                            </small>
                        </div>

                        <div class="field">
                            <label>Owner Name</label>
                            <InputText
                                v-model="form.owner_name"
                                fluid
                                :invalid="!!errors.owner_name"
                                @input="clearError('owner_name')"
                            />
                            <small
                                v-if="errors.owner_name"
                                class="p-error"
                            >
                                {{ errors.owner_name }}
                            </small>
                        </div>

                        <div class="field">
                            <label>Phone</label>
                            <InputText
                                v-model="form.phone"
                                fluid
                                :invalid="!!errors.phone"
                                @keypress="onlyPhoneChars"
                                @input="clearError('phone')"
                            />
                            <small
                                v-if="errors.phone"
                                class="p-error"
                            >
                                {{ errors.phone }}
                            </small>
                        </div>

                        <div class="field">
                            <label>Email</label>
                            <InputText
                                v-model="form.email"
                                fluid
                                :invalid="!!errors.email"
                                @input="clearError('email')"
                            />
                            <small
                                v-if="errors.email"
                                class="p-error"
                            >
                                {{ errors.email }}
                            </small>
                        </div>

                        <div class="field full-width">
                            <label>Address</label>
                            <Textarea
                                v-model="form.address"
                                rows="4"
                                fluid
                                :invalid="!!errors.address"
                                @input="clearError('address')"
                            />
                            <small
                                v-if="errors.address"
                                class="p-error"
                            >
                                {{ errors.address }}
                            </small>
                        </div>
                    </div>
                </div>


                <!-- ============================
                    Regional FOR FURTHER DEVELOPMENT
                ============================= -->

                <!-- <div class="section">
                    <div class="section-title">
                        Regional Settings
                    </div>

                    <div class="form-grid">
                        <div class="field">
                            <label>Currency</label>
                            <Select
                                v-model="form.currency"
                                :options="currencies"
                                optionLabel="label"
                                optionValue="value"
                                fluid
                            />
                        </div>

                        <div class="field">
                            <label>Timezone</label>
                            <Select
                                v-model="form.time_zone"
                                :options="timezones"
                                optionLabel="label"
                                optionValue="value"
                                fluid
                            />
                        </div>
                    </div>
                </div> -->

                <!-- ============================
                        Receipt
                ============================= -->
                <div class="section">
                    <div class="section-title">
                        Receipt Settings
                    </div>

                    <div class="field">
                        <label>Receipt Footer</label>
                        <Textarea
                            v-model="form.receipt_footer"
                            rows="5"
                            fluid
                        />
                    </div>
                </div>

                <!-- ============================
                        Save
                ============================= -->
                <div class="button-area">
                    <Button
                        label="Save Changes"
                        icon="pi pi-save"
                        :loading="saving"
                        :disabled="!isDirty || saving"
                        @click="saveProfile"
                    />
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>

.section-container{
    display:flex;
    flex-direction:column;
    gap:28px;
}

.section{
    border:1px solid #E5E7EB;
    border-radius:12px;
    padding:20px;
}

.section-title{
    font-size:1rem;
    font-weight:700;
    margin-bottom:20px;
    color:#374151;
}

.form-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:20px;
}

.field{
    display:flex;
    flex-direction:column;
    gap:8px;
}

.field label{
    font-weight:600;
    color:#374151;
}

.full-width{
    grid-column:1/-1;
}

.button-area{
    display:flex;
    justify-content:flex-end;
}

@media(max-width:768px){
    .form-grid{
        grid-template-columns:1fr;
    }
}

/* css untuk logo, preview, dan keterangan */
.logo-container{
    display:flex;
    align-items:flex-start;
    gap:2rem;
    margin-top:1rem;
}

.logo-preview{
    width:180px;
    display:flex;
    justify-content:center;
    align-items:center;
}

.logo-placeholder{
    width:160px;
    height:160px;

    border:2px dashed #d1d5db;
    border-radius:12px;

    display:flex;
    justify-content:center;
    align-items:center;

    background:#fafafa;
}

.logo-placeholder i{
    font-size:3.5rem;
    color:#9ca3af;
}

.logo-upload{
    flex:1;
}

.upload-title{
    font-weight:600;
    margin-bottom:.5rem;
}

.upload-description{
    color:#6b7280;
    margin-bottom:1rem;
    line-height:1.5;
}

.upload-description ul{
    margin-top:.5rem;
    margin-left:0rem;
}

.upload-description li{
    margin-bottom:.25rem;
}

</style>