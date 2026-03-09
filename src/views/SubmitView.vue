<template>
    <div class="page-wrapper">
        <!-- Mobile Header -->
        <div class="mobile-header">
            <h1 class="text-lg font-bold text-white">📝 เสนอโครงการใหม่</h1>
            <p class="text-slate-300 text-xs mt-0.5">
                กรอกข้อมูลแล้วกดส่งได้เลย
            </p>
        </div>

        <!-- Desktop Header -->
        <div class="desktop-header">
            <div class="desktop-header-inner">
                <div>
                    <h1 class="desktop-page-title">เสนอโครงการใหม่</h1>
                    <p class="desktop-page-sub">
                        กรอกข้อมูลให้ครบแล้วกดส่งได้เลย
                    </p>
                </div>
            </div>
        </div>

        <!-- Form -->
        <div class="form-area">
            <form @submit.prevent="submitForm" novalidate>
                <div class="form-grid">
                    <!-- ===== LEFT COLUMN ===== -->
                    <div class="form-col">
                        <!-- Title -->
                        <div class="field-group">
                            <label class="field-label">
                                หัวข้อโครงการ
                                <span class="required-star">*</span>
                            </label>
                            <input
                                v-model="form.title"
                                type="text"
                                placeholder="เช่น ติดตั้งระบบแอร์เพิ่มเติม ชั้น 2"
                                class="field-input"
                                :class="{ 'field-input--error': errors.title }"
                                maxlength="100"
                            />
                            <div class="field-footer">
                                <p v-if="errors.title" class="field-error">
                                    <AlertCircle class="w-3 h-3" />
                                    {{ errors.title }}
                                </p>
                                <span v-else></span>
                                <span class="char-count"
                                    >{{ form.title.length }}/100</span
                                >
                            </div>
                        </div>

                        <!-- Location -->
                        <div class="field-group">
                            <label class="field-label">
                                หน่วยงาน / ตึก
                                <span class="required-star">*</span>
                            </label>
                            <div class="location-grid">
                                <button
                                    v-for="loc in locationOptions"
                                    :key="loc.value"
                                    @click.prevent="form.location = loc.value"
                                    type="button"
                                    class="location-btn"
                                    :class="
                                        form.location === loc.value
                                            ? 'location-btn--active'
                                            : ''
                                    "
                                >
                                    <span class="location-icon">{{
                                        loc.icon
                                    }}</span>
                                    <span class="location-name">{{
                                        loc.value
                                    }}</span>
                                </button>
                            </div>
                            <p v-if="errors.location" class="field-error mt-1">
                                <AlertCircle class="w-3 h-3" />
                                {{ errors.location }}
                            </p>
                        </div>

                        <!-- Budget -->
                        <div class="field-group">
                            <label class="field-label">
                                งบประมาณที่ขอ (บาท)
                                <span class="required-star">*</span>
                            </label>
                            <div class="budget-wrap">
                                <span class="budget-prefix">฿</span>
                                <input
                                    v-model="budgetInput"
                                    type="number"
                                    inputmode="numeric"
                                    placeholder="0"
                                    min="0"
                                    class="budget-input"
                                    :class="{
                                        'field-input--error':
                                            errors.budget_requested,
                                    }"
                                    @input="onBudgetInput"
                                />
                            </div>
                            <p
                                v-if="budgetFormatted"
                                class="budget-formatted-hint"
                            >
                                = {{ budgetFormatted }} บาท
                            </p>
                            <p
                                v-if="errors.budget_requested"
                                class="field-error mt-1"
                            >
                                <AlertCircle class="w-3 h-3" />
                                {{ errors.budget_requested }}
                            </p>
                            <!-- Quick Amounts -->
                            <div class="quick-amounts">
                                <button
                                    v-for="quick in quickAmounts"
                                    :key="quick.value"
                                    @click.prevent="setQuickAmount(quick.value)"
                                    type="button"
                                    class="quick-btn"
                                >
                                    {{ quick.label }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ===== RIGHT COLUMN ===== -->
                    <div class="form-col">
                        <!-- Priority -->
                        <div class="field-group">
                            <label class="field-label">
                                ระดับความเร่งด่วน
                                <span class="required-star">*</span>
                            </label>
                            <div class="priority-list">
                                <button
                                    v-for="p in priorityOptions"
                                    :key="p.value"
                                    @click.prevent="form.priority = p.value"
                                    type="button"
                                    class="priority-btn"
                                    :class="
                                        form.priority === p.value
                                            ? p.activeClass
                                            : 'priority-btn--idle'
                                    "
                                >
                                    <div
                                        class="priority-emoji-wrap"
                                        :class="
                                            form.priority === p.value
                                                ? p.dotBg
                                                : 'priority-emoji-wrap--idle'
                                        "
                                    >
                                        {{ p.emoji }}
                                    </div>
                                    <div class="priority-text">
                                        <p
                                            class="priority-label"
                                            :class="
                                                form.priority === p.value
                                                    ? p.textActive
                                                    : 'text-slate-700'
                                            "
                                        >
                                            {{ p.label }}
                                        </p>
                                        <p class="priority-desc">
                                            {{ p.description }}
                                        </p>
                                    </div>
                                    <div class="priority-radio-wrap">
                                        <div
                                            class="priority-radio"
                                            :class="
                                                form.priority === p.value
                                                    ? p.radioActive
                                                    : 'priority-radio--idle'
                                            "
                                        >
                                            <div
                                                v-if="form.priority === p.value"
                                                class="priority-radio-dot"
                                            ></div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            <p v-if="errors.priority" class="field-error mt-1">
                                <AlertCircle class="w-3 h-3" />
                                {{ errors.priority }}
                            </p>
                        </div>

                        <!-- Description -->
                        <div class="field-group">
                            <label class="field-label">
                                คำอธิบายโครงการ
                                <span class="required-star">*</span>
                            </label>
                            <textarea
                                v-model="form.description"
                                rows="6"
                                placeholder="อธิบายถึงปัญหาที่พบ, วัตถุประสงค์ของโครงการ, และผลลัพธ์ที่คาดหวัง..."
                                class="field-input field-textarea"
                                :class="{
                                    'field-input--error': errors.description,
                                }"
                                maxlength="1000"
                            ></textarea>
                            <div class="field-footer">
                                <p
                                    v-if="errors.description"
                                    class="field-error"
                                >
                                    <AlertCircle class="w-3 h-3" />
                                    {{ errors.description }}
                                </p>
                                <span v-else class="field-hint"
                                    >อธิบายให้ละเอียดเพื่อช่วยในการพิจารณา</span
                                >
                                <span class="char-count"
                                    >{{ form.description.length }}/1000</span
                                >
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== SUBMIT BAR ===== -->
                <div class="submit-bar">
                    <div class="submit-bar-inner">
                        <!-- Preview Summary -->
                        <div class="submit-preview" v-if="formHasContent">
                            <div v-if="form.title" class="submit-preview-item">
                                <span class="preview-label">โครงการ:</span>
                                <span class="preview-value">{{
                                    form.title
                                }}</span>
                            </div>
                            <div
                                v-if="form.budget_requested"
                                class="submit-preview-item"
                            >
                                <span class="preview-label">งบ:</span>
                                <span
                                    class="preview-value preview-value--budget"
                                    >฿{{
                                        Number(
                                            form.budget_requested,
                                        ).toLocaleString("th-TH")
                                    }}</span
                                >
                            </div>
                            <div
                                v-if="form.priority"
                                class="submit-preview-item"
                            >
                                <span class="preview-label">ความเร่งด่วน:</span>
                                <span class="preview-value"
                                    >{{
                                        getPriorityConfig(form.priority as any)
                                            ?.emoji
                                    }}
                                    {{
                                        getPriorityConfig(form.priority as any)
                                            ?.label
                                    }}</span
                                >
                            </div>
                        </div>
                        <div v-else class="submit-preview-empty">
                            กรอกข้อมูลด้านบนให้ครบแล้วกดส่ง
                        </div>

                        <!-- Submit Button -->
                        <button
                            type="submit"
                            :disabled="isSubmitting"
                            class="submit-btn"
                            :class="{ 'submit-btn--loading': isSubmitting }"
                        >
                            <span v-if="isSubmitting" class="submit-spinner">
                                <div class="spinner-ring"></div>
                            </span>
                            <span v-else class="submit-btn-content">
                                <Send class="w-5 h-5" />
                                ส่งข้อเสนอโครงการ
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Success Toast -->
        <Transition name="slide-up">
            <div v-if="showSuccess" class="toast toast--success">
                <CheckCircle class="w-5 h-5 flex-shrink-0" />
                <div>
                    <p class="toast-title">ส่งข้อเสนอสำเร็จ! 🎉</p>
                    <p class="toast-sub">
                        โครงการของคุณถูกบันทึกแล้ว รอการพิจารณา
                    </p>
                </div>
            </div>
        </Transition>

        <!-- Error Toast -->
        <Transition name="slide-up">
            <div v-if="submitError" class="toast toast--error">
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
                <div>
                    <p class="toast-title">เกิดข้อผิดพลาด</p>
                    <p class="toast-sub">{{ submitError }}</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { AlertCircle, Send, CheckCircle } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/appStore";
import type { Priority, Location } from "../types";
import { PRIORITY_CONFIG } from "../types";

const router = useRouter();
const store = useAppStore();

// ==================== State ====================

const isSubmitting = ref(false);
const showSuccess = ref(false);
const submitError = ref("");

const form = ref({
    title: "",
    location: "" as Location | "",
    budget_requested: null as number | null,
    priority: "" as Priority | "",
    description: "",
});

const errors = ref({
    title: "",
    location: "",
    budget_requested: "",
    priority: "",
    description: "",
});

const budgetInput = ref("");

// ==================== Config ====================

const locationOptions = [
    { value: "ตึก OPD ใหม่" as Location, icon: "🏥" },
    { value: "ตึก OPD เก่า" as Location, icon: "🏨" },
    { value: "ตึกโภชนาการ" as Location, icon: "🍽️" },
    { value: "อื่นๆ" as Location, icon: "📍" },
];

const priorityOptions = [
    {
        value: "แดง" as Priority,
        emoji: "🔴",
        label: "เร่งด่วนมาก",
        description: "ส่งผลต่อการรักษาผู้ป่วยโดยตรง",
        activeClass: "priority-btn--red",
        dotBg: "priority-emoji-wrap--red",
        textActive: "text-red-700",
        radioActive: "priority-radio--red",
    },
    {
        value: "เหลือง" as Priority,
        emoji: "🟡",
        label: "เร่งด่วน",
        description: "ควรดำเนินการโดยเร็ว",
        activeClass: "priority-btn--amber",
        dotBg: "priority-emoji-wrap--amber",
        textActive: "text-amber-700",
        radioActive: "priority-radio--amber",
    },
    {
        value: "เขียว" as Priority,
        emoji: "🟢",
        label: "ทั่วไป",
        description: "ดำเนินการได้ตามปกติ",
        activeClass: "priority-btn--green",
        dotBg: "priority-emoji-wrap--green",
        textActive: "text-emerald-700",
        radioActive: "priority-radio--green",
    },
];

const quickAmounts = [
    { label: "5K", value: 5_000 },
    { label: "10K", value: 10_000 },
    { label: "50K", value: 50_000 },
    { label: "100K", value: 100_000 },
    { label: "500K", value: 500_000 },
];

// ==================== Computed ====================

const budgetFormatted = computed(() => {
    const val = form.value.budget_requested;
    if (!val || val <= 0) return "";
    return val.toLocaleString("th-TH");
});

const formHasContent = computed(() => {
    return (
        form.value.title.trim() ||
        form.value.budget_requested ||
        form.value.priority
    );
});

// ==================== Methods ====================

function getPriorityConfig(priority: Priority) {
    return PRIORITY_CONFIG[priority];
}

function onBudgetInput() {
    const val = parseFloat(budgetInput.value);
    form.value.budget_requested = isNaN(val) ? null : val;
}

function setQuickAmount(val: number) {
    budgetInput.value = val.toString();
    form.value.budget_requested = val;
}

function validateForm(): boolean {
    let valid = true;
    errors.value = {
        title: "",
        location: "",
        budget_requested: "",
        priority: "",
        description: "",
    };

    if (!form.value.title.trim()) {
        errors.value.title = "กรุณากรอกหัวข้อโครงการ";
        valid = false;
    } else if (form.value.title.trim().length < 5) {
        errors.value.title = "หัวข้อควรมีอย่างน้อย 5 ตัวอักษร";
        valid = false;
    }

    if (!form.value.location) {
        errors.value.location = "กรุณาเลือกหน่วยงาน / ตึก";
        valid = false;
    }

    if (!form.value.budget_requested || form.value.budget_requested <= 0) {
        errors.value.budget_requested = "กรุณากรอกงบประมาณที่ขอ";
        valid = false;
    }

    if (!form.value.priority) {
        errors.value.priority = "กรุณาเลือกระดับความเร่งด่วน";
        valid = false;
    }

    if (!form.value.description.trim()) {
        errors.value.description = "กรุณากรอกคำอธิบายโครงการ";
        valid = false;
    } else if (form.value.description.trim().length < 10) {
        errors.value.description = "คำอธิบายควรมีอย่างน้อย 10 ตัวอักษร";
        valid = false;
    }

    return valid;
}

async function submitForm() {
    if (!validateForm()) {
        // Scroll to first error
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    isSubmitting.value = true;
    submitError.value = "";

    try {
        const payload = {
            title: form.value.title.trim(),
            location: form.value.location as Location,
            budget_requested: form.value.budget_requested!,
            priority: form.value.priority as Priority,
            description: form.value.description.trim(),
        };

        const result = await store.submitEntry(payload);

        if (result.success) {
            // Use the server-returned entry (if provided) so the client store
            // has the authoritative id and status from the backend.
            const serverEntry =
                result.data ||
                ({
                    ...payload,
                    id: `entry_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    status: "เสนอใหม่" as const,
                    admin_remark: "",
                } as any);

            store.addEntry(serverEntry);
            showSuccess.value = true;

            setTimeout(() => {
                showSuccess.value = false;
                resetForm();
                router.push({ name: "home" });
            }, 2200);
        } else {
            submitError.value =
                result.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
            setTimeout(() => {
                submitError.value = "";
            }, 4000);
        }
    } catch (err) {
        submitError.value = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
        setTimeout(() => {
            submitError.value = "";
        }, 4000);
    } finally {
        isSubmitting.value = false;
    }
}

function resetForm() {
    form.value = {
        title: "",
        location: "",
        budget_requested: null,
        priority: "",
        description: "",
    };
    budgetInput.value = "";
    errors.value = {
        title: "",
        location: "",
        budget_requested: "",
        priority: "",
        description: "",
    };
}
</script>

<style scoped>
/* =====================================================
   PAGE WRAPPER
   ===================================================== */
.page-wrapper {
    min-height: 100vh;
    background-color: #f1f5f9;
    padding-bottom: 8rem;
}

/* =====================================================
   MOBILE HEADER
   ===================================================== */
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

/* =====================================================
   DESKTOP HEADER
   ===================================================== */
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

/* =====================================================
   FORM AREA
   ===================================================== */
.form-area {
    padding: 1rem;
}

@media (min-width: 1024px) {
    .form-area {
        padding: 1.5rem 2rem 2rem;
        max-width: 1200px;
    }
}

/* =====================================================
   FORM GRID (2 columns on desktop)
   ===================================================== */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
}

@media (min-width: 1024px) {
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
        align-items: start;
    }
}

.form-col {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* =====================================================
   FIELD GROUPS
   ===================================================== */
.field-group {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.125rem 1rem;
    margin-bottom: 0.75rem;
}

@media (min-width: 1024px) {
    .field-group {
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        margin-bottom: 1rem;
    }
}

.field-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.625rem;
}

.required-star {
    color: #ef4444;
    margin-left: 2px;
}

/* Input */
.field-input {
    width: 100%;
    padding: 0.625rem 0.875rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    outline: none;
    transition:
        border-color 0.15s,
        box-shadow 0.15s,
        background 0.15s;
}

.field-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    background: #ffffff;
}

.field-input--error {
    border-color: #ef4444 !important;
    background: #fef2f2 !important;
}

.field-textarea {
    resize: none;
    line-height: 1.65;
}

.field-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.375rem;
}

.field-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: #ef4444;
    font-weight: 500;
}

.field-hint {
    font-size: 0.75rem;
    color: #94a3b8;
}

.char-count {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-left: auto;
}

/* =====================================================
   LOCATION GRID
   ===================================================== */
.location-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.location-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
}

.location-btn:hover {
    border-color: #c7d2fe;
    background: #eef2ff;
}

.location-btn--active {
    border-color: #6366f1;
    background: #eef2ff;
}

.location-icon {
    font-size: 1.1rem;
    line-height: 1;
}

.location-name {
    font-size: 0.78rem;
    font-weight: 600;
    color: #334155;
}

.location-btn--active .location-name {
    color: #4f46e5;
}

/* =====================================================
   BUDGET
   ===================================================== */
.budget-wrap {
    position: relative;
}

.budget-prefix {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9rem;
    font-weight: 700;
    color: #64748b;
    pointer-events: none;
}

.budget-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    outline: none;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}

.budget-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
    background: #ffffff;
}

.budget-formatted-hint {
    font-size: 0.78rem;
    color: #64748b;
    font-weight: 500;
    margin-top: 0.375rem;
}

.quick-amounts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.625rem;
}

.quick-btn {
    padding: 0.3rem 0.75rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s;
}

.quick-btn:hover {
    background: #eef2ff;
    color: #4f46e5;
    border-color: #c7d2fe;
}

/* =====================================================
   PRIORITY
   ===================================================== */
.priority-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.priority-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
}

.priority-btn--idle:hover {
    border-color: #c7d2fe;
    background: #f8fafc;
}

.priority-btn--red {
    border-color: #fca5a5;
    background: #fef2f2;
}

.priority-btn--amber {
    border-color: #fcd34d;
    background: #fffbeb;
}

.priority-btn--green {
    border-color: #6ee7b7;
    background: #ecfdf5;
}

.priority-emoji-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.priority-emoji-wrap--idle {
    background: #f1f5f9;
}

.priority-emoji-wrap--red {
    background: #fee2e2;
}

.priority-emoji-wrap--amber {
    background: #fef3c7;
}

.priority-emoji-wrap--green {
    background: #d1fae5;
}

.priority-text {
    flex: 1;
    text-align: left;
}

.priority-label {
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.3;
}

.priority-desc {
    font-size: 0.72rem;
    color: #94a3b8;
    margin-top: 2px;
}

.priority-radio-wrap {
    flex-shrink: 0;
}

.priority-radio {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}

.priority-radio--idle {
    border-color: #cbd5e1;
}

.priority-radio--red {
    border-color: #ef4444;
    background: #ef4444;
}

.priority-radio--amber {
    border-color: #f59e0b;
    background: #f59e0b;
}

.priority-radio--green {
    border-color: #10b981;
    background: #10b981;
}

.priority-radio-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
}

/* =====================================================
   SUBMIT BAR
   ===================================================== */
.submit-bar {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 1rem;
    margin-top: 0.75rem;
}

@media (min-width: 1024px) {
    .submit-bar {
        padding: 1.25rem 1.5rem;
        margin-top: 1rem;
        border-radius: 18px;
        background: linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%);
        border: 1.5px solid #e2e8f0;
    }
}

.submit-bar-inner {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
}

@media (min-width: 768px) {
    .submit-bar-inner {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
}

.submit-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    flex: 1;
}

.submit-preview-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.preview-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
}

.preview-value {
    font-size: 0.8rem;
    font-weight: 700;
    color: #334155;
}

.preview-value--budget {
    color: #4f46e5;
}

.submit-preview-empty {
    font-size: 0.8rem;
    color: #94a3b8;
    font-style: italic;
    flex: 1;
}

.submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition:
        background 0.15s,
        transform 0.1s,
        box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
    width: 100%;
    flex-shrink: 0;
}

@media (min-width: 768px) {
    .submit-btn {
        width: auto;
        min-width: 180px;
    }
}

.submit-btn:hover:not(:disabled) {
    background: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(79, 70, 229, 0.4);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn:disabled,
.submit-btn--loading {
    opacity: 0.65;
    cursor: not-allowed;
}

.submit-btn-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.submit-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner-ring {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* =====================================================
   TOASTS
   ===================================================== */
.toast {
    position: fixed;
    bottom: 5.5rem;
    left: 1rem;
    right: 1rem;
    border-radius: 14px;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    max-width: 480px;
}

@media (min-width: 1024px) {
    .toast {
        left: auto;
        right: 2rem;
        bottom: 2rem;
        max-width: 360px;
    }
}

.toast--success {
    background: #059669;
    color: white;
}

.toast--error {
    background: #dc2626;
    color: white;
}

.toast-title {
    font-size: 0.875rem;
    font-weight: 700;
}

.toast-sub {
    font-size: 0.75rem;
    opacity: 0.85;
    margin-top: 2px;
}

/* =====================================================
   TRANSITIONS
   ===================================================== */
.slide-up-enter-active,
.slide-up-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(12px);
}
</style>
