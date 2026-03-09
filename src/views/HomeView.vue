<template>
    <div class="page-wrapper">
        <!-- MOBILE HEADER -->
        <div class="mobile-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-lg font-bold text-white tracking-wide">
                        🏥 ระบบเสนองบประมาณ
                    </h1>
                    <p class="text-slate-300 text-xs mt-0.5">
                        โรงพยาบาลสระโบสถ์
                    </p>
                </div>
                <div v-if="store.state.isDevMode" class="demo-badge">DEMO</div>
            </div>
        </div>

        <!-- DESKTOP HEADER -->
        <div class="desktop-header">
            <div class="desktop-header-inner">
                <div>
                    <h1 class="desktop-page-title">แดชบอร์ดภาพรวม</h1>
                    <p class="desktop-page-sub">
                        ข้อมูล ณ วันนี้ · โรงพยาบาลสระโบสถ์
                    </p>
                </div>
                <div class="desktop-header-actions">
                    <div
                        v-if="store.state.isDevMode"
                        class="demo-badge-desktop"
                    >
                        DEMO MODE
                    </div>
                    <button
                        @click="store.loadEntries()"
                        class="desktop-refresh-btn"
                        title="รีเฟรชข้อมูล"
                    >
                        <RefreshCw class="w-4 h-4" />
                        <span>รีเฟรช</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- CONTENT -->
        <div class="content-area">
            <!-- PRIMARY KPI CARD (in body, above the KPI grid) -->
            <div
                class="primary-kpi-card"
                role="status"
                aria-label="ยอดรวมงบประมาณรอเงิน"
            >
                <div class="primary-kpi-left">
                    <div class="kpi-icon-wrap kpi-icon-wrap--primary">
                        <Wallet class="w-6 h-6 text-indigo-400" />
                    </div>
                </div>
                <div class="primary-kpi-body">
                    <div class="primary-kpi-line">
                        <span class="primary-kpi-label">{{
                            kpiPrimaryLabel
                        }}</span>
                        <span class="primary-kpi-value"
                            >฿{{ formatCurrency(kpiPrimaryAmount) }}</span
                        >
                        <span class="primary-kpi-count"
                            >({{ kpiPrimaryCount }} โครงการ)</span
                        >
                    </div>
                    <div class="primary-kpi-sub">
                        ยอดรวมโครงการที่สถานะเป็นรอเงิน
                    </div>
                </div>
            </div>

            <!-- KPI GRID (secondary) -->
            <div class="kpi-grid">
                <div class="kpi-card kpi-card--success">
                    <div class="kpi-icon-wrap kpi-icon-wrap--success">
                        <CheckCircle class="w-5 h-5 text-emerald-400" />
                    </div>
                    <div class="kpi-body">
                        <p class="kpi-label">{{ kpiHasFundsLabel }}</p>
                        <p class="kpi-value kpi-value--success">
                            ฿{{ formatCurrency(kpiHasFundsAmount) }}
                        </p>
                        <p class="kpi-sub">{{ kpiHasFundsCount }} โครงการ</p>
                    </div>
                </div>

                <div class="kpi-card kpi-card--warn">
                    <div class="kpi-icon-wrap kpi-icon-wrap--warn">
                        <Clock class="w-5 h-5 text-blue-800" />
                    </div>
                    <div class="kpi-body">
                        <p class="kpi-label">โครงการที่เสร็จแล้ว</p>
                        <p class="kpi-value kpi-value--warn">
                            {{ kpiFinishedCount }}
                        </p>
                        <p class="kpi-sub">จำนวนโครงการที่ดำเนินการเสร็จแล้ว</p>
                    </div>
                </div>

                <div class="kpi-card kpi-card--danger">
                    <div class="kpi-icon-wrap kpi-icon-wrap--danger">
                        <AlertTriangle class="w-5 h-5 text-black" />
                    </div>
                    <div class="kpi-body">
                        <p class="kpi-label">โครงการที่ยังไม่เสร็จ</p>
                        <p class="kpi-value kpi-value--danger">
                            {{ kpiNotFinishedCount }}
                        </p>
                        <p class="kpi-sub">
                            จำนวนโครงการที่รอเงิน + มีเงินแล้ว
                        </p>
                    </div>
                </div>
            </div>

            <!-- MAIN GRID -->
            <div class="main-grid">
                <!-- LEFT COLUMN: LOCATION BUDGET - รอเงิน แยกตามตึก -->
                <div class="main-col-left">
                    <div class="panel">
                        <div class="panel-header">
                            <Building2 class="w-4 h-4 text-indigo-400" />
                            <h3 class="panel-title">
                                งบประมาณรอเงิน แยกตามตึก
                            </h3>
                        </div>

                        <div class="location-list">
                            <div
                                v-for="loc in locationStats"
                                :key="loc.name"
                                class="location-item"
                            >
                                <div class="location-item-top">
                                    <span class="location-name">{{
                                        loc.name
                                    }}</span>
                                    <div class="location-right">
                                        <span class="location-budget"
                                            >฿{{
                                                formatCurrency(loc.budget)
                                            }}</span
                                        >
                                        <span class="location-pct"
                                            >{{ loc.percent }}%</span
                                        >
                                    </div>
                                </div>
                                <div class="progress-track">
                                    <div
                                        class="progress-fill"
                                        :class="loc.barColor"
                                        :style="{ width: loc.percent + '%' }"
                                    ></div>
                                </div>
                                <div class="location-item-bottom">
                                    <span class="text-xs text-slate-400"
                                        >{{ loc.count }} โครงการ</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="main-col-right">
                    <!-- Filter Panel -->
                    <div class="panel filter-panel">
                        <div class="filter-top">
                            <div class="filter-top-left">
                                <SlidersHorizontal
                                    class="w-4 h-4 text-indigo-400"
                                />
                                <h3 class="panel-title">รายการโครงการ</h3>
                                <span class="entry-count-badge"
                                    >({{ displayEntries.length }} โครงการ)</span
                                >
                            </div>
                            <button
                                v-if="hasActiveFilter"
                                @click="clearFilters"
                                class="clear-filter-btn"
                            >
                                <X class="w-3 h-3" /> ล้างตัวกรอง
                            </button>
                        </div>

                        <!-- Search -->
                        <div class="search-wrap">
                            <Search class="search-icon" />
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="ค้นหาโครงการ..."
                                class="search-input"
                                @input="onSearch"
                            />
                        </div>

                        <!-- Priority Quick Filters (kept as chips) -->
                        <div class="filter-chips-row">
                            <button
                                @click="togglePriority(null)"
                                class="filter-chip"
                                :class="
                                    activePriority === null
                                        ? 'filter-chip--active-default'
                                        : 'filter-chip--idle'
                                "
                            >
                                ทั้งหมด
                            </button>
                            <button
                                v-for="p in priorities"
                                :key="p.value"
                                @click="togglePriority(p.value)"
                                class="filter-chip"
                                :class="
                                    activePriority === p.value
                                        ? p.activeClass
                                        : 'filter-chip--idle'
                                "
                            >
                                {{ p.emoji }} {{ p.label }}
                            </button>
                        </div>

                        <!-- Location Filter Chips -->
                        <div class="filter-chips-row mt-1.5">
                            <button
                                @click="toggleLocation(null)"
                                class="filter-chip"
                                :class="
                                    activeLocation === null
                                        ? 'filter-chip--active-loc'
                                        : 'filter-chip--idle'
                                "
                            >
                                ทุกตึก
                            </button>
                            <button
                                v-for="loc in locationFilters"
                                :key="loc"
                                @click="toggleLocation(loc)"
                                class="filter-chip"
                                :class="
                                    activeLocation === loc
                                        ? 'filter-chip--active-loc'
                                        : 'filter-chip--idle'
                                "
                            >
                                {{ loc }}
                            </button>
                        </div>
                    </div>

                    <!-- Loading / Empty / Entries -->
                    <div v-if="store.state.isLoading" class="state-box">
                        <div class="spinner"></div>
                        <p class="state-text">กำลังโหลดข้อมูล...</p>
                    </div>

                    <div
                        v-else-if="displayEntries.length === 0"
                        class="state-box"
                    >
                        <div class="text-4xl mb-2">📋</div>
                        <p class="state-text font-semibold text-slate-600">
                            ไม่พบโครงการที่สถานะเป็น "รอเงิน"
                        </p>
                        <p class="state-text text-sm mt-1">
                            ลองเปลี่ยนตัวกรอง หรือเพิ่มโครงการใหม่
                        </p>
                    </div>

                    <div v-else class="entry-list">
                        <EntryCard
                            v-for="entry in displayEntries"
                            :key="entry.id"
                            :entry="entry"
                            @click="openDetail(entry)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Entry Detail Modal -->
        <EntryDetailModal
            v-if="selectedEntry"
            :entry="selectedEntry"
            @close="selectedEntry = null"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
    Search,
    CheckCircle,
    Clock,
    Building2,
    X,
    Wallet,
    AlertTriangle,
    SlidersHorizontal,
    RefreshCw,
} from "lucide-vue-next";
import { useAppStore } from "../stores/appStore";
import type { Priority, Location, BudgetEntry } from "../types";
import { LOCATION_OPTIONS } from "../types";
import EntryCard from "../components/EntryCard.vue";
import EntryDetailModal from "../components/EntryDetailModal.vue";

const store = useAppStore();

const searchQuery = ref(store.state.searchQuery);
const activePriority = ref<Priority | null>(store.state.filterPriority);
const activeLocation = ref<Location | null>(store.state.filterLocation);
const selectedEntry = ref<BudgetEntry | null>(null);

const locationFilters = LOCATION_OPTIONS;

const priorities = [
    {
        value: "แดง" as Priority,
        emoji: "🔴",
        label: "เร่งด่วนมาก",
        activeClass: "filter-chip--active-red",
    },
    {
        value: "เหลือง" as Priority,
        emoji: "🟡",
        label: "เร่งด่วน",
        activeClass: "filter-chip--active-amber",
    },
    {
        value: "เขียว" as Priority,
        emoji: "🟢",
        label: "ทั่วไป",
        activeClass: "filter-chip--active-green",
    },
];

// Entries with status 'รอเงิน' (used for primary KPI and location percent calc)
const entriesForKpi = computed(() => {
    return store.state.entries.filter((e) => {
        if (e.status !== "รอเงิน") return false;
        if (activePriority.value && e.priority !== activePriority.value)
            return false;
        if (activeLocation.value && e.location !== activeLocation.value)
            return false;
        if (searchQuery.value.trim() !== "") {
            const q = searchQuery.value.trim().toLowerCase();
            const title = (e.title || "").toLowerCase();
            return title.includes(q) || String(e.id).includes(q);
        }
        return true;
    });
});

const kpiPrimaryAmount = computed(() =>
    entriesForKpi.value.reduce(
        (sum, e) => sum + (Number(e.budget_requested) || 0),
        0,
    ),
);
const kpiPrimaryCount = computed(() => entriesForKpi.value.length);
const kpiPrimaryLabel = computed(() => "รอเงิน");

// Has funds KPI (respect filters except status which is fixed here)
const kpiHasFundsEntries = computed(() =>
    store.state.entries.filter((e) => {
        if (e.status !== "มีเงินแล้ว") return false;
        if (activePriority.value && e.priority !== activePriority.value)
            return false;
        if (activeLocation.value && e.location !== activeLocation.value)
            return false;
        if (searchQuery.value.trim() !== "") {
            const q = searchQuery.value.trim().toLowerCase();
            const title = (e.title || "").toLowerCase();
            return title.includes(q) || String(e.id).includes(q);
        }
        return true;
    }),
);
const kpiHasFundsAmount = computed(() =>
    kpiHasFundsEntries.value.reduce(
        (s, e) => s + (Number(e.budget_requested) || 0),
        0,
    ),
);
const kpiHasFundsCount = computed(() => kpiHasFundsEntries.value.length);
const kpiHasFundsLabel = computed(() => "มีเงินแล้ว");

const kpiFinishedCount = computed(
    () =>
        store.state.entries.filter((e) => {
            if (e.status !== "เสร็จแล้ว") return false;
            if (activePriority.value && e.priority !== activePriority.value)
                return false;
            if (activeLocation.value && e.location !== activeLocation.value)
                return false;
            return true;
        }).length,
);

const kpiNotFinishedCount = computed(
    () =>
        store.state.entries.filter((e) => {
            if (!(e.status === "รอเงิน" || e.status === "มีเงินแล้ว"))
                return false;
            if (activePriority.value && e.priority !== activePriority.value)
                return false;
            if (activeLocation.value && e.location !== activeLocation.value)
                return false;
            return true;
        }).length,
);

// Location stats computed from entriesForKpi (ONLY รอเงิน)
// Calculate sum per location, count per location, percent relative to total รอเงิน budget
const locationStats = computed(() => {
    const base = entriesForKpi.value;
    const totalBudget =
        base.reduce((s, e) => s + (Number(e.budget_requested) || 0), 0) || 1;
    const byLoc: Record<string, { budget: number; count: number }> = {};
    for (const loc of LOCATION_OPTIONS) {
        byLoc[loc] = { budget: 0, count: 0 };
    }
    for (const e of base) {
        const loc = e.location || "อื่นๆ";
        if (!byLoc[loc]) byLoc[loc] = { budget: 0, count: 0 };
        byLoc[loc].budget += Number(e.budget_requested) || 0;
        byLoc[loc].count += 1;
    }
    const barColors = [
        "progress-fill--indigo",
        "progress-fill--violet",
        "progress-fill--slate",
        "progress-fill--sky",
    ];
    return Object.keys(byLoc).map((name, idx) => {
        const b = byLoc[name]?.budget ?? 0;
        const c = byLoc[name]?.count ?? 0;
        return {
            name,
            budget: b,
            count: c,
            percent: Math.round((b / totalBudget) * 100),
            barColor: barColors[idx % barColors.length],
        };
    });
});

const hasActiveFilter = computed(
    () =>
        activePriority.value !== null ||
        activeLocation.value !== null ||
        searchQuery.value.trim() !== "",
);

function formatCurrency(val: number): string {
    try {
        const n = Number(val) || 0;
        return n.toLocaleString("en-US");
    } catch {
        return String(val);
    }
}

function togglePriority(p: Priority | null) {
    activePriority.value = activePriority.value === p ? null : p;
    store.setFilterPriority(activePriority.value);
}

function toggleLocation(loc: Location | null) {
    activeLocation.value = activeLocation.value === loc ? null : loc;
    store.setFilterLocation(activeLocation.value);
}

function onSearch() {
    // we set store-level searchQuery so other parts react if needed
    store.setSearchQuery(searchQuery.value);
}

function clearFilters() {
    activePriority.value = null;
    activeLocation.value = null;
    searchQuery.value = "";
    store.clearFilters();
}

function openDetail(entry: BudgetEntry) {
    selectedEntry.value = entry;
}

watch(
    () => store.state.filterPriority,
    (v) => (activePriority.value = v),
);
watch(
    () => store.state.filterLocation,
    (v) => (activeLocation.value = v),
);
watch(
    () => store.state.searchQuery,
    (v) => (searchQuery.value = v),
);

onMounted(() => {
    if (store.state.entries.length === 0) store.loadEntries();
});

// displayEntries: reuse store.filteredEntries if available, then ensure status==='รอเงิน'
const displayEntries = computed(() => {
    const base =
        (store.filteredEntries && store.filteredEntries.value) ||
        store.state.entries ||
        [];
    return base.filter((e: BudgetEntry) => e.status === "รอเงิน");
});
</script>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    background-color: #f1f5f9;
    padding-bottom: 6rem;
}

/* MOBILE HEADER */
.mobile-header {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
    padding: 3rem 1rem 1.25rem;
    display: block;
}
@media (min-width: 1024px) {
    .mobile-header {
        display: none;
    }
}

/* DESKTOP HEADER */
.desktop-header {
    display: none;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 1.25rem 2rem;
    position: sticky;
    top: 0;
    z-index: 10;
}
@media (min-width: 1024px) {
    .desktop-header {
        display: block;
    }
}
.desktop-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.desktop-page-title {
    font-size: 1.375rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
}
.desktop-page-sub {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 2px;
}
.desktop-header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.demo-badge {
    background: #fbbf24;
    color: #78350f;
    font-size: 0.65rem;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 999px;
}
.demo-badge-desktop {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid #fde68a;
}
.desktop-refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem 0.875rem;
    cursor: pointer;
    transition: background 0.15s;
}
.desktop-refresh-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
}

/* PRIMARY KPI CARD */
.primary-kpi-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    /* Darker/more intense tint using the same blue (#0ea5e9) so the card stands out clearly */
    background: rgba(14, 165, 233, 0.2); /* stronger tint of #0ea5e9 */
    border: 1px solid rgba(14, 165, 233, 0.32);
    border-left: 6px solid #0ea5e9; /* blue accent to draw attention for รอเงิน */
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 8px 30px rgba(14, 165, 233, 0.16);
}
.kpi-icon-wrap--primary {
    background: rgba(14, 165, 233, 0.14);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.primary-kpi-body {
    display: flex;
    flex-direction: column;
}
.primary-kpi-line {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
}
.primary-kpi-label {
    font-size: 1rem;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
}
.primary-kpi-value {
    font-size: 1.75rem;
    font-weight: 900;
    color: #000;
}
.primary-kpi-count {
    font-size: 0.85rem;
    font-weight: 400;
    color: #64748b;
    margin-left: 6px;
}
.primary-kpi-sub {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 4px;
}

/* KPI GRID */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
}
@media (min-width: 1024px) {
    .kpi-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.25rem;
    }
}
.kpi-card {
    background: #fff;
    border-radius: 14px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    border: 1px solid #e2e8f0;
    transition: box-shadow 0.15s;
}
.kpi-card:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}
.kpi-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.kpi-icon-wrap--success {
    background: #ecfdf5;
}
.kpi-icon-wrap--warn {
    background: #e0f2fe;
}
.kpi-icon-wrap--danger {
    background: #f1f5f9;
}
.kpi-body {
    flex: 1;
    min-width: 0;
}
.kpi-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 2px;
}
.kpi-value {
    font-size: 1.35rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
}
.kpi-value--success {
    color: #059669;
}
.kpi-value--warn {
    color: #1e3a8a;
}
.kpi-value--danger {
    color: #0f172a;
}
.kpi-sub {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 3px;
}

/* MAIN GRID */
.main-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
@media (min-width: 1024px) {
    .main-grid {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 1.25rem;
        align-items: start;
    }
}
.main-col-left,
.main-col-right {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
@media (min-width: 1024px) {
    .main-col-left,
    .main-col-right {
        gap: 1rem;
    }
}

/* PANEL */
.panel {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1rem;
}
@media (min-width: 1024px) {
    .panel {
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
    }
}
.panel-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.875rem;
}
.panel-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #0f172a;
}

/* LOCATION LIST */
.location-list {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}
.location-item-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
}
.location-name {
    font-size: 0.8rem;
    font-weight: 600;
    color: #334155;
}
.location-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.location-budget {
    font-size: 0.8rem;
    font-weight: 700;
    color: #0f172a;
}
.location-pct {
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    min-width: 32px;
    text-align: right;
}
.progress-track {
    width: 100%;
    height: 7px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
}
.progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.progress-fill--indigo {
    background: #6366f1;
}
.progress-fill--violet {
    background: #8b5cf6;
}
.progress-fill--slate {
    background: #64748b;
}
.progress-fill--sky {
    background: #0ea5e9;
}
.location-item-bottom {
    margin-top: 3px;
}

/* FILTER PANEL */
.filter-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}
.filter-top-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.entry-count-badge {
    background: #eef2ff;
    color: #4f46e5;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 999px;
}

/* Search */
.search-wrap {
    position: relative;
    margin-bottom: 0.625rem;
}
.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: #94a3b8;
}
.search-input {
    width: 100%;
    padding: 0.625rem 1rem 0.625rem 2.375rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    outline: none;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}
.search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    background: #fff;
}

/* Filter chips */
.filter-chips-row {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;
}
.filter-chips-row::-webkit-scrollbar {
    display: none;
}
.filter-chip {
    flex-shrink: 0;
    padding: 0.3rem 0.75rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
}
.filter-chip--idle {
    background: #f8fafc;
    color: #64748b;
    border-color: #e2e8f0;
}
.filter-chip--idle:hover {
    background: #eef2ff;
    color: #4f46e5;
    border-color: #c7d2fe;
}
.filter-chip--active-default,
.filter-chip--active-loc,
.filter-chip--active-red,
.filter-chip--active-amber,
.filter-chip--active-green {
    background: #e5e7eb;
    color: #0f172a;
    border-color: #000;
}

/* STATE BOX */
.state-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 2.5rem 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}
.spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-bottom: 0.5rem;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
.state-text {
    font-size: 0.875rem;
    color: #94a3b8;
}

/* ENTRY LIST */
.entry-list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
}
@media (min-width: 1280px) {
    .entry-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
    }
}
</style>
