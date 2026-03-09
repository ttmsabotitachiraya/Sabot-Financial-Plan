<template>
    <div
        class="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center px-4"
    >
        <!-- Logo / Branding -->
        <div class="flex flex-col items-center mb-8">
            <div
                class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4"
            >
                <ShieldCheck class="w-10 h-10 text-blue-600" />
            </div>
            <h1 class="text-2xl font-bold text-white tracking-wide">
                Admin Panel
            </h1>
            <p class="text-slate-400 text-sm mt-1">ระบบบริหารจัดการงบประมาณ</p>
        </div>

        <!-- Login Card -->
        <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-5 text-center">
                เข้าสู่ระบบ
            </h2>

            <form @submit.prevent="handleLogin" novalidate>
                <!-- Username -->
                <div class="mb-4">
                    <label
                        class="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                        ชื่อผู้ใช้
                    </label>
                    <div class="relative">
                        <User
                            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <input
                            v-model="credentials.username"
                            type="text"
                            placeholder="กรอกชื่อผู้ใช้"
                            autocomplete="username"
                            class="w-full pl-10 pr-4 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            :class="
                                errors.username
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200'
                            "
                            @input="errors.username = ''"
                        />
                    </div>
                    <p
                        v-if="errors.username"
                        class="text-red-500 text-xs mt-1 flex items-center gap-1"
                    >
                        <AlertCircle class="w-3 h-3" /> {{ errors.username }}
                    </p>
                </div>

                <!-- Password -->
                <div class="mb-5">
                    <label
                        class="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                        รหัสผ่าน
                    </label>
                    <div class="relative">
                        <Lock
                            class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        />
                        <input
                            v-model="credentials.password"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="กรอกรหัสผ่าน"
                            autocomplete="current-password"
                            class="w-full pl-10 pr-11 py-3.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            :class="
                                errors.password
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200'
                            "
                            @input="errors.password = ''"
                        />
                        <button
                            type="button"
                            @click="showPassword = !showPassword"
                            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <EyeOff v-if="showPassword" class="w-4 h-4" />
                            <Eye v-else class="w-4 h-4" />
                        </button>
                    </div>
                    <p
                        v-if="errors.password"
                        class="text-red-500 text-xs mt-1 flex items-center gap-1"
                    >
                        <AlertCircle class="w-3 h-3" /> {{ errors.password }}
                    </p>
                </div>

                <!-- Error Alert -->
                <Transition name="fade">
                    <div
                        v-if="loginError"
                        class="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5"
                    >
                        <ShieldX class="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p class="text-red-600 text-sm font-medium">
                            {{ loginError }}
                        </p>
                    </div>
                </Transition>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <span v-if="isLoading">
                        <div
                            class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                        ></div>
                    </span>
                    <span v-else class="flex items-center gap-2">
                        <LogIn class="w-5 h-5" />
                        เข้าสู่ระบบ
                    </span>
                </button>
            </form>

            <!-- Demo Hint -->
            <div
                v-if="isDevModeFlag"
                class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3"
            >
                <p
                    class="text-xs text-amber-700 font-semibold flex items-center gap-1.5 mb-1"
                >
                    <Info class="w-3.5 h-3.5" />
                    Demo Mode — ข้อมูล Login
                </p>
                <p class="text-xs text-amber-600 font-mono">
                    ชื่อผู้ใช้: <strong>admin</strong> &nbsp;|&nbsp; รหัสผ่าน:
                    <strong>admin1234</strong>
                </p>
            </div>
        </div>

        <!-- Back to Home -->
        <button
            @click="router.push({ name: 'home' })"
            class="mt-6 flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition"
        >
            <ArrowLeft class="w-4 h-4" />
            กลับหน้าหลัก
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    ShieldCheck,
    ShieldX,
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    AlertCircle,
    ArrowLeft,
    Info,
} from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import { isDevMode } from "../services/api";

const router = useRouter();
const store = useAppStore();

// ==================== State ====================

const credentials = ref({
    username: "",
    password: "",
});

const errors = ref({
    username: "",
    password: "",
});

const showPassword = ref(false);
const isLoading = ref(false);
const loginError = ref("");
const isDevModeFlag = isDevMode();
// eslint-disable-next-line @typescript-eslint/no-unused-vars

// ==================== Config ====================

// Hardcoded credentials (in real scenario, validate via App Script)
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin1234";

// ==================== Methods ====================

function validate(): boolean {
    let valid = true;

    errors.value.username = "";
    errors.value.password = "";

    if (!credentials.value.username.trim()) {
        errors.value.username = "กรุณากรอกชื่อผู้ใช้";
        valid = false;
    }

    if (!credentials.value.password) {
        errors.value.password = "กรุณากรอกรหัสผ่าน";
        valid = false;
    }

    return valid;
}

async function handleLogin() {
    if (!validate()) return;

    isLoading.value = true;
    loginError.value = "";

    try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const usernameMatch =
            credentials.value.username.trim() === ADMIN_USERNAME;
        const passwordMatch = credentials.value.password === ADMIN_PASSWORD;

        if (usernameMatch && passwordMatch) {
            store.loginAdmin(credentials.value.username.trim());
            await router.push({ name: "admin-dashboard" });
        } else {
            loginError.value = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
            // Shake animation
            setTimeout(() => {
                loginError.value = "";
            }, 4000);
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
