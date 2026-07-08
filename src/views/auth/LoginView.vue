<script setup>
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import { useToast } from "primevue/usetoast";
    import { useAuthStore } from "@/stores/auth";

    import Card from "primevue/card";
    import InputText from "primevue/inputtext";
    import Password from "primevue/password";
    import Button from "primevue/button";

    const router = useRouter();
    const toast = useToast();

    const authStore = useAuthStore();

    // initial value untuk const username dan password
    const username = ref("");
    const password = ref("");

    async function handleLogin() {
        try {
            await authStore.login(username.value, password.value);

            router.push("/");
        } catch (err) {
            toast.add({
                severity: "error",
                summary: "Login Failed",
                detail: err.response?.data?.message ?? "Unknown error",
                life: 3000,
            });
        }
    }
</script>

<template>
    <div class="login-page">
        <Card class="login-card">
            <template #title>
                Login
            </template>
            <template #content>
                <div class="field">
                    <label>Username</label>
                    <InputText v-model="username" fluid />
                </div>
                <div class="field">
                    <label>Password</label>
                    <Password
                        v-model="password"
                        :feedback="false"
                        toggleMask
                        fluid
                    />
                </div>
                <Button
                    label="Login"
                    icon="pi pi-sign-in"
                    class="login-button"
                    :loading="authStore.loading"
                    @click="handleLogin"
                />
            </template>
        </Card>
    </div>
</template>

<style scoped>
.login-page{
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fb;
}
.login-card{
    width: 380px;
}
.field{
    margin-bottom: 18px;
}
.field label{
    display: block;
    margin-bottom: 6px;
}
.login-button{
    width: 100%;
}
</style>