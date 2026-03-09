<template>
    <nav
        class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg safe-area-bottom"
    >
        <div class="flex items-stretch max-w-lg mx-auto">
            <button
                v-for="item in navItems"
                :key="item.name"
                @click="navigate(item)"
                class="flex-1 flex flex-col items-center justify-center py-2 px-1 gap-0.5 relative transition-all duration-200 active:scale-95"
                :class="isActive(item) ? 'text-blue-600' : 'text-gray-400'"
            >
                <!-- Active indicator pill -->
                <span
                    v-if="isActive(item)"
                    class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"
                ></span>

                <!-- Icon wrapper with active bg -->
                <span
                    class="flex items-center justify-center w-7 h-7 rounded-xl transition-all duration-200"
                    :class="isActive(item) ? 'bg-blue-50' : ''"
                >
                    <component :is="item.icon" class="w-5 h-5" />
                </span>

                <!-- Label -->
                <span
                    class="text-xs font-semibold leading-none tracking-tight"
                    :class="isActive(item) ? 'text-blue-600' : 'text-gray-400'"
                >
                    {{ item.label }}
                </span>
            </button>
        </div>
    </nav>

    <!-- Floating Action Button for Submit -->
    <button
        @click="router.push({ name: 'submit' })"
        class="fixed bottom-16 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-300 flex items-center justify-center transition-all duration-200 active:scale-90"
        :class="isSubmitActive ? 'bg-blue-700 shadow-blue-400' : 'bg-blue-600'"
        aria-label="เสนอโครงการใหม่"
    >
        <Plus class="w-7 h-7" />
    </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LayoutDashboard, Plus } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

// ==================== Nav Items ====================

const navItems = computed(() => [
    {
        name: "home",
        label: "หน้าหลัก",
        icon: LayoutDashboard,
        routeName: "home",
    },
]);

// ==================== Computed ====================

const isSubmitActive = computed(() => route.name === "submit");

// ==================== Methods ====================

function isActive(item: { routeName: string }): boolean {
    return route.name === item.routeName;
}

function navigate(item: { routeName: string }) {
    if (route.name !== item.routeName) {
        router.push({ name: item.routeName });
    }
}
</script>

<style scoped>
.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
