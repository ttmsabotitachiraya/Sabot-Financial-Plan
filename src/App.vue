<template>
    <div class="app-root">
        <!-- ===== DESKTOP LAYOUT ===== -->
        <div v-if="isDesktop" class="desktop-layout">
            <!-- Sidebar -->
            <aside class="sidebar">
                <!-- Logo / Brand -->
                <div class="sidebar-brand">
                    <div class="brand-icon">
                        <span class="text-2xl">🏥</span>
                    </div>
                    <div>
                        <p class="brand-title">ระบบเสนองบประมาณ</p>
                        <p class="brand-sub">เป็นโรงพยาบาลสระโบสถ์</p>
                    </div>
                </div>

                <!-- Nav Items -->
                <nav class="sidebar-nav">
                    <button
                        v-for="item in desktopNavItems"
                        :key="item.name"
                        @click="navigate(item.routeName)"
                        class="sidebar-nav-item"
                        :class="
                            isActiveRoute(item)
                                ? 'sidebar-nav-item--active'
                                : ''
                        "
                    >
                        <span class="sidebar-nav-icon">
                            <component :is="item.icon" class="w-5 h-5" />
                        </span>
                        <span class="sidebar-nav-label">{{ item.label }}</span>
                        <span
                            v-if="isActiveRoute(item)"
                            class="sidebar-nav-indicator"
                        ></span>
                    </button>
                </nav>

                <!-- Submit CTA -->
                <div class="sidebar-cta">
                    <button
                        @click="navigate('submit')"
                        class="sidebar-cta-btn"
                        :class="
                            route.name === 'submit'
                                ? 'sidebar-cta-btn--active'
                                : ''
                        "
                    >
                        <Plus class="w-5 h-5" />
                        <span>เสนอโครงการใหม่</span>
                    </button>
                </div>

                <!-- Footer -->
                <div class="sidebar-footer">
                    <div class="sidebar-footer-tag">
                        <div
                            class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                        ></div>
                        <span>ระบบพร้อมใช้งาน</span>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="desktop-main">
                <RouterView />
            </main>
        </div>

        <!-- ===== MOBILE LAYOUT ===== -->
        <div v-else class="mobile-layout">
            <RouterView />
            <BottomNav v-if="showBottomNav" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LayoutDashboard, ClipboardList, Plus } from "lucide-vue-next";
import BottomNav from "./components/BottomNav.vue";
import { useAppStore } from "./stores/appStore";

const route = useRoute();
const router = useRouter();
const store = useAppStore();

// ==================== Responsive ====================
const windowWidth = ref(window.innerWidth);
const DESKTOP_BREAKPOINT = 1024;

function onResize() {
    windowWidth.value = window.innerWidth;
}

onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));

const isDesktop = computed(() => windowWidth.value >= DESKTOP_BREAKPOINT);

// ==================== Nav ====================
const showBottomNav = computed(() => route.name !== "admin-login");

const desktopNavItems = computed(() => [
    {
        name: "home",
        label: "แดชบอร์ด",
        icon: LayoutDashboard,
        routeName: "home",
    },
    {
        name: "admin",
        label: store.state.isAdminLoggedIn ? "จัดการระบบ" : "ผู้ดูแลระบบ",
        icon: ClipboardList,
        routeName: store.state.isAdminLoggedIn
            ? "admin-dashboard"
            : "admin-login",
    },
]);

function isActiveRoute(item: { routeName: string }): boolean {
    if (
        item.routeName === "admin-dashboard" ||
        item.routeName === "admin-login"
    ) {
        return route.name === "admin-dashboard" || route.name === "admin-login";
    }
    return route.name === item.routeName;
}

function navigate(routeName: string) {
    if (route.name !== routeName) {
        router.push({ name: routeName });
    }
}
</script>

<style scoped>
/* ============================================
   ROOT
   ============================================ */
.app-root {
    min-height: 100vh;
    background-color: #f1f5f9;
}

/* ============================================
   MOBILE
   ============================================ */
.mobile-layout {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    background-color: #f8fafc;
    position: relative;
}

/* ============================================
   DESKTOP
   ============================================ */
.desktop-layout {
    display: flex;
    min-height: 100vh;
}

/* ----- Sidebar ----- */
.sidebar {
    width: 256px;
    flex-shrink: 0;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 50;
    padding: 0 0 1.5rem 0;
    overflow-y: auto;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1.25rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    margin-bottom: 0.5rem;
}

.brand-icon {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.brand-title {
    color: #f1f5f9;
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1.3;
}

.brand-sub {
    color: #64748b;
    font-size: 0.7rem;
    margin-top: 1px;
}

.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0.5rem 0.75rem;
}

.sidebar-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    cursor: pointer;
    border: none;
    background: transparent;
    text-align: left;
    transition: background 0.15s ease;
    color: #94a3b8;
    width: 100%;
}

.sidebar-nav-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
}

.sidebar-nav-item--active {
    background: rgba(99, 102, 241, 0.15) !important;
    color: #818cf8 !important;
}

.sidebar-nav-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.04);
}

.sidebar-nav-item--active .sidebar-nav-icon {
    background: rgba(99, 102, 241, 0.2);
}

.sidebar-nav-label {
    font-size: 0.875rem;
    font-weight: 600;
}

.sidebar-nav-indicator {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 20px;
    background: #818cf8;
    border-radius: 2px 0 0 2px;
}

.sidebar-cta {
    padding: 0.75rem;
    margin-top: 0.5rem;
}

.sidebar-cta-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition:
        background 0.15s ease,
        transform 0.1s ease;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.sidebar-cta-btn:hover {
    background: #4338ca;
    transform: translateY(-1px);
}

.sidebar-cta-btn:active {
    transform: translateY(0);
}

.sidebar-cta-btn--active {
    background: #3730a3 !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-footer {
    padding: 0.75rem 1.25rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: auto;
}

.sidebar-footer-tag {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #475569;
    font-size: 0.7rem;
    font-weight: 500;
}

/* ----- Main ----- */
.desktop-main {
    margin-left: 256px;
    flex: 1;
    min-height: 100vh;
    background-color: #f1f5f9;
}
</style>
