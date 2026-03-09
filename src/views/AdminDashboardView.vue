<template>
    <div class="admin-page-wrapper">
        <!-- Mobile Header -->
        <div class="admin-mobile-header">
            <div class="flex items-center justify-between">
                <div>
                    <h1
                        class="text-lg font-bold text-white flex items-center gap-2"
                    >
                        <ClipboardList class="w-5 h-5 text-indigo-300" />
                        ติดตามสถานะโครงการ
                    </h1>
                    <p class="text-slate-400 text-xs mt-0.5">
                        โรงพยาบาลสระโบสถ์
                    </p>
                </div>
            </div>

            <!-- Summary Row -->
            <div class="grid grid-cols-4 gap-2 mt-4">
                <div
                    v-for="s in quickStats"
                    :key="s.label"
                    class="bg-white/8 border border-white/10 rounded-xl p-2.5 text-center"
                >
                    <p class="text-lg font-bold text-white">{{ s.value }}</p>
                    <p class="text-xs text-slate-400 leading-tight">
                        {{ s.label }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Desktop Header -->
        <div class="admin-desktop-header">
            <div class="admin-desktop-header-inner">
                <div>
                    <h1 class="admin-desktop-title">
                        <ClipboardList class="w-5 h-5 text-indigo-500" />
                        ติดตามสถานะโครงการ
                    </h1>
                    <p class="admin-desktop-sub">โรงพยาบาลสระโบสถ์</p>
                </div>
            </div>
        </div>

        <!-- Desktop KPI Strip -->
        <div class="admin-kpi-strip">
            <div v-for="s in quickStats" :key="s.label" class="admin-kpi-item">
                <p class="admin-kpi-value">{{ s.value }}</p>
                <p class="admin-kpi-label">{{ s.label }}</p>
            </div>
        </div>

        <!-- Toolbar -->
        <div class="admin-toolbar">
            <!-- Search -->
            <div class="admin-search-wrap">
                <Search class="admin-search-icon" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="ค้นหาโครงการ..."
                    class="admin-search-input"
                />
            </div>

            <!-- Filter Row -->
            <div class="admin-filter-row">
                <!-- Status Filter -->
                <select
                    v-model="filterStatus"
                    :class="[
                        'admin-select',
                        getStatusSelectClass(filterStatus),
                    ]"
                >
                    <option value="">ทุกสถานะ</option>
                    <option v-for="s in statusOptions" :key="s" :value="s">
                        {{ s }}
                    </option>
                </select>

                <!-- Location Filter -->
                <select v-model="filterLocation" class="admin-select">
                    <option value="">ทุกตึก</option>
                    <option v-for="l in locationOptions" :key="l" :value="l">
                        {{ l }}
                    </option>
                </select>

                <!-- Priority Filter -->
                <select v-model="filterPriority" class="admin-select">
                    <option value="">ทุกระดับ</option>
                    <option v-for="p in priorityOptions" :key="p" :value="p">
                        {{ p }}
                    </option>
                </select>

                <!-- Refresh -->
                <button
                    @click="refreshData"
                    :disabled="store.state.isLoading"
                    class="admin-refresh-btn"
                >
                    <RefreshCw
                        class="w-3.5 h-3.5"
                        :class="store.state.isLoading ? 'animate-spin' : ''"
                    />
                    รีเฟรช
                </button>
            </div>

            <!-- Result count + clear -->
            <div class="admin-result-row">
                <p class="admin-result-text">
                    แสดง
                    <span class="font-bold text-slate-700">{{
                        filteredEntries.length
                    }}</span>
                    / {{ store.state.entries.length }} รายการ
                </p>
                <button
                    v-if="
                        filterStatus ||
                        filterLocation ||
                        filterPriority ||
                        searchQuery
                    "
                    @click="clearFilters"
                    class="admin-clear-btn"
                >
                    <X class="w-3 h-3" /> ล้างตัวกรอง
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="store.state.isLoading" class="admin-loading">
            <div class="admin-spinner"></div>
            <p class="text-slate-400 text-sm">กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Entry Cards for Admin -->
        <div v-else class="admin-cards-grid">
            <div
                v-for="entry in filteredEntries"
                :key="entry.id"
                class="admin-card"
            >
                <div class="p-4">
                    <!-- Top Row -->
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <h3
                            class="text-sm font-bold text-gray-800 leading-snug flex-1"
                        >
                            {{ entry.title }}
                        </h3>
                    </div>

                    <!-- Meta Row -->
                    <div class="flex flex-col text-xs text-gray-400 mb-2.5">
                        <!-- First line: Building and Date on same line -->
                        <div class="flex items-center gap-3">
                            <span class="flex items-center gap-1">
                                <Building2 class="w-3 h-3" />
                                {{ entry.location }}
                            </span>

                            <span class="flex items-center gap-1">
                                <Calendar class="w-3 h-3" />
                                {{ formatDate(entry.timestamp) }}
                            </span>
                        </div>

                        <!-- Second line: priority and financial status under building -->
                        <div class="mt-2 flex items-center gap-2">
                            <span
                                class="flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border text-xs"
                                :class="getPriorityClass(entry.priority)"
                            >
                                {{ getPriorityEmoji(entry.priority) }}
                                {{ entry.priority }}
                            </span>

                            <button
                                class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                                :class="getStatusClass(entry.status)"
                            >
                                {{ entry.status }}
                            </button>
                        </div>
                    </div>

                    <!-- Budget -->
                    <div class="flex items-center justify-between mb-3">
                        <div>
                            <p class="text-xs text-gray-400">งบประมาณที่เสนอ</p>
                            <p class="text-lg font-bold text-gray-800">
                                ฿{{
                                    Number(
                                        entry.budget_requested,
                                    ).toLocaleString("th-TH")
                                }}
                            </p>
                        </div>
                        <!-- Quick Status Change -->
                        <select
                            :value="entry.status"
                            @change="
                                quickStatusChange(
                                    entry,
                                    ($event.target as HTMLSelectElement)
                                        .value as Status,
                                )
                            "
                            class="text-xs font-semibold border-2 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                            :class="getStatusSelectClass(entry.status)"
                        >
                            <option
                                v-for="s in statusOptions"
                                :key="s"
                                :value="s"
                            >
                                {{ s }}
                            </option>
                        </select>
                    </div>

                    <!-- Description preview -->
                    <p
                        class="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3"
                    >
                        {{ entry.description }}
                    </p>

                    <!-- Admin Remark -->
                    <div
                        v-if="entry.admin_remark"
                        class="mb-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-start gap-2"
                    >
                        <MessageSquare
                            class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"
                        />
                        <p class="text-xs text-amber-700 leading-relaxed">
                            {{ entry.admin_remark }}
                        </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-2">
                        <button
                            @click="openEditModal(entry)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-100 active:scale-95 transition-all"
                        >
                            <Pencil class="w-3.5 h-3.5" />
                            แก้ไขข้อมูล
                        </button>
                        <button
                            @click="openRemarkModal(entry)"
                            class="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold border border-amber-100 active:scale-95 transition-all"
                        >
                            <MessageSquare class="w-3.5 h-3.5 text-amber-500" />
                            หมายเหตุ
                        </button>
                    </div>
                </div>
            </div>

            <div
                v-if="filteredEntries.length === 0"
                class="flex flex-col items-center justify-center py-16"
            >
                <div class="text-5xl mb-3">📂</div>
                <p class="text-gray-500 font-semibold">ไม่พบรายการ</p>
                <p class="text-gray-400 text-sm mt-1">
                    ลองเปลี่ยนตัวกรองหรือคำค้นหา
                </p>
            </div>
        </div>

        <!-- ===================== EDIT MODAL ===================== -->
        <Transition name="modal">
            <div
                v-if="editModal.open"
                class="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
                @click.self="editModal.open = false"
            >
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    @click="editModal.open = false"
                ></div>
                <div
                    class="relative w-full max-w-lg lg:max-w-[92vw] lg:w-[92vw] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[92vh] lg:max-h-[92vh] overflow-y-auto"
                >
                    <!-- Handle -->
                    <div class="flex justify-center pt-3 pb-1">
                        <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
                    </div>

                    <div class="px-5 pb-8">
                        <div class="flex items-center justify-between mb-4">
                            <h2
                                class="text-base font-bold text-gray-800 flex items-center gap-2"
                            >
                                <Pencil class="w-4 h-4 text-blue-500" />
                                แก้ไขข้อมูลโครงการ
                            </h2>
                            <button
                                @click="editModal.open = false"
                                class="text-gray-400 hover:text-gray-600"
                            >
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Edit Form (PC: grid layout, larger inputs, nicer spacing) -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <!-- Title (full width) -->
                            <div class="col-span-1 lg:col-span-2">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-2"
                                    >หัวข้อโครงการ</label
                                >
                                <input
                                    v-model="editForm.title"
                                    type="text"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100"
                                />
                            </div>

                            <!-- Location -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >ตึก / หน่วยงาน</label
                                >
                                <select
                                    v-model="editForm.location"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100"
                                >
                                    <option
                                        v-for="l in locationOptions"
                                        :key="l"
                                        :value="l"
                                    >
                                        {{ l }}
                                    </option>
                                </select>
                            </div>

                            <!-- Budget -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >งบประมาณที่เสนอ (บาท)</label
                                >
                                <div class="relative">
                                    <span
                                        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm"
                                        >฿</span
                                    >
                                    <input
                                        v-model="editForm.budget_requested"
                                        type="number"
                                        inputmode="numeric"
                                        min="0"
                                        class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <!-- Priority -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >ระดับความเร่งด่วน</label
                                >
                                <div class="flex gap-2">
                                    <button
                                        v-for="p in priorityOptions"
                                        :key="p"
                                        @click="editForm.priority = p"
                                        type="button"
                                        class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                                        :class="
                                            editForm.priority === p
                                                ? getPriorityActiveClass(p)
                                                : 'border border-gray-200 text-gray-600 bg-white'
                                        "
                                    >
                                        {{ getPriorityEmoji(p) }} {{ p }}
                                    </button>
                                </div>
                            </div>

                            <!-- Status -->
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >สถานะ</label
                                >
                                <select
                                    v-model="editForm.status"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100"
                                    :class="
                                        getStatusSelectClass(editForm.status)
                                    "
                                >
                                    <option
                                        v-for="s in statusOptions"
                                        :key="s"
                                        :value="s"
                                    >
                                        {{ s }}
                                    </option>
                                </select>
                            </div>

                            <!-- Description (full width) -->
                            <div class="col-span-1 lg:col-span-2">
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >รายละเอียด</label
                                >
                                <textarea
                                    v-model="editForm.description"
                                    rows="5"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none leading-relaxed"
                                ></textarea>
                            </div>

                            <!-- Admin Remark (full width) -->
                            <div class="col-span-1 lg:col-span-2">
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >หมายเหตุจากที่ประชุม</label
                                >
                                <textarea
                                    v-model="editForm.admin_remark"
                                    rows="4"
                                    placeholder="กรอกหมายเหตุ เช่น เหตุผลที่อนุมัติ/ปฏิเสธ วงเงินที่ปรับ ฯลฯ"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-amber-100 resize-none leading-relaxed"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Error -->
                        <p
                            v-if="editModal.error"
                            class="text-red-500 text-xs mt-2 flex items-center gap-1"
                        >
                            <AlertCircle class="w-3 h-3" />
                            {{ editModal.error }}
                        </p>

                        <!-- Buttons -->
                        <div class="flex gap-3 mt-5">
                            <button
                                @click="editModal.open = false"
                                class="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-sm"
                            >
                                ยกเลิก
                            </button>
                            <button
                                @click="saveEdit"
                                :disabled="editModal.loading"
                                class="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
                            >
                                <span v-if="editModal.loading">
                                    <div
                                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    ></div>
                                </span>
                                <span v-else class="flex items-center gap-1.5">
                                    <Save class="w-4 h-4" /> บันทึก
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- ===================== REMARK MODAL ===================== -->
        <Transition name="modal">
            <div
                v-if="remarkModal.open"
                class="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
                @click.self="remarkModal.open = false"
            >
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    @click="remarkModal.open = false"
                ></div>
                <div
                    class="relative w-full max-w-lg lg:max-w-[92vw] lg:w-[92vw] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
                >
                    <div class="flex justify-center pt-3 pb-1">
                        <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
                    </div>

                    <div class="px-5 pb-8">
                        <div class="flex items-center justify-between mb-4">
                            <h2
                                class="text-base font-bold text-gray-800 flex items-center gap-2"
                            >
                                <MessageSquarePlus
                                    class="w-4 h-4 text-amber-500"
                                />
                                เพิ่ม / แก้ไขหมายเหตุ
                            </h2>
                            <button
                                @click="remarkModal.open = false"
                                class="text-gray-400 hover:text-gray-600"
                            >
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <p class="text-xs text-gray-500 mb-3 leading-relaxed">
                            โครงการ:
                            <span class="font-semibold text-gray-700">{{
                                remarkModal.entry?.title
                            }}</span>
                        </p>

                        <!-- Remark modal: side-by-side on PC, stacked on mobile -->
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                            <!-- Left: status controls (stacked) -->
                            <div class="lg:col-span-1">
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >อัปเดตสถานะ</label
                                >
                                <div class="flex flex-col gap-3">
                                    <button
                                        v-for="s in statusOptions"
                                        :key="s"
                                        @click="remarkModal.status = s"
                                        class="py-3 px-4 rounded-xl text-sm font-semibold text-left w-full transition-all"
                                        :class="
                                            remarkModal.status === s
                                                ? getStatusActiveClass(s)
                                                : 'border border-gray-200 text-gray-600 bg-white'
                                        "
                                    >
                                        {{ s }}
                                    </button>
                                </div>
                            </div>

                            <!-- Right: remark textarea, larger on PC -->
                            <div class="lg:col-span-2">
                                <label
                                    class="block text-sm font-medium text-gray-700 mb-2"
                                    >หมายเหตุจากที่ประชุม</label
                                >
                                <textarea
                                    v-model="remarkModal.remark"
                                    rows="6"
                                    placeholder="กรอกหมายเหตุ เช่น เหตุผลที่อนุมัติ/ปฏิเสธ วงเงินที่ปรับ ฯลฯ"
                                    class="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-amber-100 resize-none leading-relaxed"
                                ></textarea>
                            </div>
                        </div>

                        <p
                            v-if="remarkModal.error"
                            class="text-red-500 text-xs mb-2 flex items-center gap-1"
                        >
                            <AlertCircle class="w-3 h-3" />
                            {{ remarkModal.error }}
                        </p>

                        <div class="flex gap-3">
                            <button
                                @click="remarkModal.open = false"
                                class="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-sm"
                            >
                                ยกเลิก
                            </button>
                            <button
                                @click="saveRemark"
                                :disabled="remarkModal.loading"
                                class="flex-1 py-3.5 bg-amber-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all"
                            >
                                <span v-if="remarkModal.loading">
                                    <div
                                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    ></div>
                                </span>
                                <span v-else class="flex items-center gap-1.5">
                                    <Save class="w-4 h-4" /> บันทึก
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Toast Notification -->
        <Transition name="slide-up">
            <div
                v-if="toast.show"
                class="fixed bottom-6 left-4 right-4 rounded-2xl p-4 shadow-xl z-[60] flex items-center gap-3"
                :class="
                    toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                "
            >
                <CheckCircle
                    v-if="toast.type === 'success'"
                    class="w-5 h-5 text-white flex-shrink-0"
                />
                <AlertCircle v-else class="w-5 h-5 text-white flex-shrink-0" />
                <p class="text-white font-semibold text-sm">
                    {{ toast.message }}
                </p>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import {
    ClipboardList,
    Search,
    RefreshCw,
    Pencil,
    MessageSquarePlus,
    MessageSquare,
    Building2,
    Calendar,
    X,
    Save,
    AlertCircle,
    CheckCircle,
    Info as _Info,
} from "lucide-vue-next";
import { useAppStore } from "../stores/appStore";
import type { BudgetEntry, Priority, Location, Status } from "../types";
import {
    PRIORITY_CONFIG,
    STATUS_CONFIG,
    LOCATION_OPTIONS,
    PRIORITY_OPTIONS,
    STATUS_OPTIONS,
} from "../types";
import {
    updateStatus,
    editEntry,
    MOCK_ENTRIES,
    isDevMode,
} from "../services/api";

const store = useAppStore();

// ==================== State ====================

const searchQuery = ref("");
const filterStatus = ref<Status | "">("");
const filterLocation = ref<Location | "">("");
const filterPriority = ref<Priority | "">("");

const locationOptions = LOCATION_OPTIONS;
const priorityOptions = PRIORITY_OPTIONS;
const statusOptions = STATUS_OPTIONS;

// ==================== Edit Modal ====================

const editModal = reactive({
    open: false,
    loading: false,
    error: "",
    entry: null as BudgetEntry | null,
});

const editForm = reactive({
    title: "",
    location: "" as Location,
    budget_requested: 0,
    priority: "" as Priority,
    status: "" as Status,
    description: "",
    admin_remark: "",
});

// ==================== Remark Modal ====================

const remarkModal = reactive({
    open: false,
    loading: false,
    error: "",
    entry: null as BudgetEntry | null,
    status: "" as Status,
    remark: "",
});

// ==================== Toast ====================

const toast = reactive({
    show: false,
    type: "success" as "success" | "error",
    message: "",
});

function showToast(message: string, type: "success" | "error" = "success") {
    toast.message = message;
    toast.type = type;
    toast.show = true;
    setTimeout(() => {
        toast.show = false;
    }, 3000);
}

// ==================== Computed ====================

const filteredEntries = computed(() => {
    let result = [...store.state.entries];

    if (filterStatus.value) {
        result = result.filter((e) => e.status === filterStatus.value);
    }
    if (filterLocation.value) {
        result = result.filter((e) => e.location === filterLocation.value);
    }
    if (filterPriority.value) {
        result = result.filter((e) => e.priority === filterPriority.value);
    }
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase();
        result = result.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q) ||
                e.description.toLowerCase().includes(q),
        );
    }

    // Sort by priority then timestamp
    const priorityOrder: Record<string, number> = {
        แดง: 0,
        เหลือง: 1,
        เขียว: 2,
    };
    result.sort((a, b) => {
        const pDiff =
            (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
        if (pDiff !== 0) return pDiff;
        return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    });

    return result;
});

const quickStats = computed(() => {
    const stats = store.summaryStats.value;
    return [
        { label: "ทั้งหมด", value: stats.totalEntries },
        { label: "รอเงิน", value: stats.byStatus["รอเงิน"] || 0 },
        { label: "มีเงินแล้ว", value: stats.byStatus["มีเงินแล้ว"] || 0 },
        { label: "เสร็จสิ้น", value: stats.byStatus["เสร็จแล้ว"] || 0 },
    ];
});

// ==================== Methods ====================

function clearFilters() {
    searchQuery.value = "";
    filterStatus.value = "";
    filterLocation.value = "";
    filterPriority.value = "";
}

async function refreshData() {
    await store.loadEntries();
    showToast("รีเฟรชข้อมูลเรียบร้อย");
}

function formatDate(ts: string): string {
    try {
        const d = new Date(ts);
        const date = d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "2-digit",
        });
        const time = d.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${date} ${time}`;
    } catch {
        return ts;
    }
}

function getPriorityEmoji(priority: Priority | string): string {
    return PRIORITY_CONFIG[priority as Priority]?.emoji || "⚪";
}

function getPriorityClass(priority: Priority): string {
    const cfg = PRIORITY_CONFIG[priority];
    if (!cfg) return "bg-gray-50 text-gray-500 border-gray-200";
    return `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`;
}

function getPriorityActiveClass(priority: Priority | string): string {
    const map: Record<string, string> = {
        แดง: "border-black bg-red-50 text-red-700",
        เหลือง: "border-black bg-amber-50 text-amber-700",
        เขียว: "border-black bg-emerald-50 text-emerald-700",
    };
    return map[priority] || "border-black bg-blue-50 text-blue-700";
}

function getStatusClass(status: Status): string {
    const cfg = STATUS_CONFIG[status];
    if (!cfg) return "bg-gray-100 text-gray-600";
    return `${cfg.bgColor} ${cfg.textColor}`;
}

function getStatusSelectClass(status: Status | ""): string {
    // Accept empty string (no filter) and return a neutral select appearance.
    if (!status) return "border-gray-200 bg-white text-gray-700";
    // Unified gray appearance for all statuses in dropdown/select controls
    // so the select for status always appears gray regardless of the current value.
    return "border-gray-300 bg-gray-50 text-gray-700";
}

function getStatusActiveClass(status: Status): string {
    const map: Record<Status, string> = {
        รอเงิน: "border-gray-500 bg-gray-50 text-gray-700",
        มีเงินแล้ว: "border-emerald-500 bg-emerald-50 text-emerald-700",
        เสร็จแล้ว: "border-gray-500 bg-gray-50 text-gray-700",
        ปฏิเสธ: "border-red-500 bg-red-50 text-red-600",
    };
    return map[status] || "border-gray-300";
}

// ==================== Quick Status Change ====================

async function quickStatusChange(entry: BudgetEntry, newStatus: Status) {
    if (entry.status === newStatus) return;

    const originalStatus = entry.status;

    // Optimistic update (display side uses simplified statuses)
    const updatedEntry = { ...entry, status: newStatus };
    store.updateEntryInStore(updatedEntry);
    updateMockEntry(updatedEntry);

    try {
        let result;
        if (!isDevMode()) {
            // Send the unified new status string directly to the backend
            result = await updateStatus(entry.id, newStatus as any);
            if (!result.success) {
                // Revert on failure
                store.updateEntryInStore({ ...entry, status: originalStatus });
                updateMockEntry({ ...entry, status: originalStatus });
                showToast("อัปเดตสถานะไม่สำเร็จ", "error");
                return;
            }
        } else {
            // In dev mode simulate server reply matching the updatedEntry
            await new Promise((r) => setTimeout(r, 400));
            result = { success: true, data: updatedEntry };
        }

        // Use server-returned entry if available (authoritative)
        const serverEntry = result && result.data ? result.data : updatedEntry;
        store.updateEntryInStore(serverEntry);
        updateMockEntry(serverEntry);
        // Refresh authoritative data from server to update counts across the app
        if (!isDevMode()) {
            await store.loadEntries();
        }

        showToast(`อัปเดตสถานะเป็น "${newStatus}" เรียบร้อย`);
    } catch {
        store.updateEntryInStore({ ...entry, status: originalStatus });
        updateMockEntry({ ...entry, status: originalStatus });
        showToast("เกิดข้อผิดพลาด กรุณาลองใหม่", "error");
    }
}

// ==================== Edit Modal ====================

function openEditModal(entry: BudgetEntry) {
    editModal.entry = entry;
    editModal.error = "";

    editForm.title = entry.title;
    editForm.location = entry.location;
    editForm.budget_requested = Number(entry.budget_requested);
    editForm.priority = entry.priority;
    editForm.status = entry.status;
    editForm.description = entry.description;
    editForm.admin_remark = entry.admin_remark || "";

    editModal.open = true;
}

async function saveEdit() {
    if (!editModal.entry) return;

    if (!editForm.title.trim()) {
        editModal.error = "กรุณากรอกหัวข้อโครงการ";
        return;
    }
    if (!editForm.budget_requested || editForm.budget_requested <= 0) {
        editModal.error = "กรุณากรอกงบประมาณที่ถูกต้อง";
        return;
    }

    editModal.loading = true;
    editModal.error = "";

    const updatedData = {
        title: editForm.title.trim(),
        location: editForm.location,
        budget_requested: Number(editForm.budget_requested),
        priority: editForm.priority,
        status: editForm.status,
        description: editForm.description.trim(),
        admin_remark: editForm.admin_remark.trim(),
    };

    const updatedEntry: BudgetEntry = {
        ...editModal.entry,
        ...updatedData,
    };

    try {
        let result;
        if (!isDevMode()) {
            result = await editEntry(editModal.entry.id, updatedData);
            if (!result.success) {
                editModal.error = result.error || "บันทึกข้อมูลไม่สำเร็จ";
                return;
            }
        } else {
            await new Promise((r) => setTimeout(r, 600));
            result = { success: true, data: updatedEntry };
        }

        // Prefer server-returned data to keep store authoritative
        const serverEntry = result && result.data ? result.data : updatedEntry;
        store.updateEntryInStore(serverEntry);
        updateMockEntry(serverEntry);
        // Refresh authoritative data from server to update counts across the app
        if (!isDevMode()) {
            await store.loadEntries();
        }
        editModal.open = false;
        showToast("แก้ไขข้อมูลเรียบร้อยแล้ว");
    } catch {
        editModal.error = "เกิดข้อผิดพลาด กรุณาลองใหม่";
    } finally {
        editModal.loading = false;
    }
}

// ==================== Remark Modal ====================

function openRemarkModal(entry: BudgetEntry) {
    remarkModal.entry = entry;
    remarkModal.status = entry.status;
    remarkModal.remark = entry.admin_remark || "";
    remarkModal.error = "";
    remarkModal.open = true;
}

async function saveRemark() {
    if (!remarkModal.entry) return;

    remarkModal.loading = true;
    remarkModal.error = "";

    const updatedEntry: BudgetEntry = {
        ...remarkModal.entry,
        status: remarkModal.status,
        admin_remark: remarkModal.remark.trim(),
    };

    try {
        let result;
        if (!isDevMode()) {
            // Send the unified new status string directly to backend
            result = await updateStatus(
                remarkModal.entry.id,
                remarkModal.status as any,
                remarkModal.remark.trim(),
            );
            if (!result.success) {
                remarkModal.error = result.error || "บันทึกข้อมูลไม่สำเร็จ";
                return;
            }
        } else {
            await new Promise((r) => setTimeout(r, 500));
            result = { success: true, data: updatedEntry };
        }

        // Use server-returned entry when available
        const serverEntry = result && result.data ? result.data : updatedEntry;
        store.updateEntryInStore(serverEntry);
        updateMockEntry(serverEntry);
        // Refresh authoritative data from server to update counts across the app
        if (!isDevMode()) {
            await store.loadEntries();
        }
        remarkModal.open = false;
        showToast("บันทึกหมายเหตุเรียบร้อยแล้ว");
    } catch {
        remarkModal.error = "เกิดข้อผิดพลาด กรุณาลองใหม่";
    } finally {
        remarkModal.loading = false;
    }
}

// ==================== Helpers ====================

function updateMockEntry(updated: BudgetEntry) {
    const idx = MOCK_ENTRIES.findIndex((e) => e.id === updated.id);
    if (idx !== -1) {
        MOCK_ENTRIES[idx] = { ...updated };
    }
}

// ==================== Lifecycle ====================

onMounted(() => {
    if (store.state.entries.length === 0) {
        store.loadEntries();
    }
});
</script>

<style scoped>
/* =====================================================
   PAGE WRAPPER
   ===================================================== */
.admin-page-wrapper {
    min-height: 100vh;
    background-color: #f1f5f9;
    padding-bottom: 6rem;
}

/* =====================================================
   MOBILE HEADER
   ===================================================== */
.admin-mobile-header {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    padding: 3rem 1rem 1.25rem;
    display: block;
}

@media (min-width: 1024px) {
    .admin-mobile-header {
        display: none;
    }
}

/* =====================================================
   DESKTOP HEADER
   ===================================================== */
.admin-desktop-header {
    display: none;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 1.25rem 2rem;
    position: sticky;
    top: 0;
    z-index: 10;
}

@media (min-width: 1024px) {
    .admin-desktop-header {
        display: block;
    }
}

.admin-desktop-header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.admin-desktop-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.375rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
}

.admin-desktop-sub {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 3px;
}

.admin-logout-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
}

.admin-logout-btn:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #fecaca;
}

/* =====================================================
   KPI STRIP
   ===================================================== */
.admin-kpi-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    padding: 1rem;
    background: #f1f5f9;
}

@media (min-width: 1024px) {
    .admin-kpi-strip {
        padding: 1rem 2rem;
        gap: 1rem;
    }
}

.admin-kpi-item {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 0.875rem 1rem;
    text-align: center;
}

.admin-kpi-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
}

.admin-kpi-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #94a3b8;
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* =====================================================
   TOOLBAR
   ===================================================== */
.admin-toolbar {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-bottom: 0.75rem;
}

@media (min-width: 1024px) {
    .admin-toolbar {
        padding: 0 2rem;
        flex-direction: row;
        align-items: center;
        gap: 0.75rem;
    }
}

.admin-search-wrap {
    position: relative;
    flex: 1;
}

.admin-search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
    color: #94a3b8;
}

.admin-search-input {
    width: 100%;
    padding: 0.625rem 1rem 0.625rem 2.375rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    outline: none;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}

.admin-search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.admin-filter-row {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    flex-shrink: 0;
}

.admin-select {
    flex-shrink: 0;
    padding: 0.5rem 0.75rem;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #334155;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s;
}

.admin-select:focus {
    border-color: #6366f1;
}

.admin-refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.875rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s;
}

.admin-refresh-btn:hover:not(:disabled) {
    background: #4338ca;
}

.admin-refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.admin-result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

@media (min-width: 1024px) {
    .admin-result-row {
        flex-shrink: 0;
        min-width: 200px;
    }
}

.admin-result-text {
    font-size: 0.75rem;
    color: #94a3b8;
}

.admin-clear-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

/* =====================================================
   LOADING
   ===================================================== */
.admin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem;
    gap: 0.75rem;
}

.admin-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #e2e8f0;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: admin-spin 0.75s linear infinite;
}

@keyframes admin-spin {
    to {
        transform: rotate(360deg);
    }
}

/* =====================================================
   CARDS GRID
   ===================================================== */
.admin-cards-grid {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

@media (min-width: 1024px) {
    .admin-cards-grid {
        padding: 0 2rem;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}

@media (min-width: 1400px) {
    .admin-cards-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.admin-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: box-shadow 0.15s;
}

.admin-card:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}

/* =====================================================
   MODALS & TRANSITIONS
   ===================================================== */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
