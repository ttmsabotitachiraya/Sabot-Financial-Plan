<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="entry"
                class="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
            >
                <!-- Backdrop -->
                <div
                    class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    @click="$emit('close')"
                ></div>

                <!-- Bottom Sheet -->
                <div
                    class="relative w-full max-w-lg lg:max-w-xl lg:w-[80vw] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl max-h-[90vh] lg:max-h-[92vh] overflow-y-auto"
                >
                    <!-- Drag Handle -->
                    <div
                        class="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10"
                    >
                        <div class="w-10 h-1 bg-gray-200 rounded-full"></div>
                    </div>

                    <!-- Priority Stripe -->
                    <div
                        class="h-1.5 w-full mx-0"
                        :style="{ backgroundColor: priorityConfig.color }"
                    ></div>

                    <div class="px-5 pt-4 pb-10">
                        <!-- Header Row -->
                        <div
                            class="flex items-start justify-between gap-3 mb-4"
                        >
                            <div class="flex-1">
                                <h2
                                    class="text-base font-bold text-gray-800 leading-snug"
                                >
                                    {{ entry.title }}
                                </h2>
                                <div
                                    class="flex items-center gap-2 mt-1.5 flex-wrap"
                                >
                                    <span
                                        class="px-2.5 py-1 rounded-full text-xs font-bold"
                                        :class="
                                            statusConfig.bgColor +
                                            ' ' +
                                            statusConfig.textColor
                                        "
                                    >
                                        {{ entry.status }}
                                    </span>
                                    <span
                                        class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                                        :class="
                                            priorityConfig.bgColor +
                                            ' ' +
                                            priorityConfig.textColor +
                                            ' ' +
                                            priorityConfig.borderColor
                                        "
                                    >
                                        {{ priorityConfig.emoji }}
                                        {{ priorityConfig.label }}
                                    </span>
                                </div>
                            </div>
                            <button
                                @click="$emit('close')"
                                class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                            >
                                <X class="w-4 h-4" />
                            </button>
                        </div>

                        <!-- Info Grid -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <!-- Location -->
                            <div class="bg-gray-50 rounded-xl p-3">
                                <div class="flex items-center gap-1.5 mb-1">
                                    <Building2
                                        class="w-3.5 h-3.5 text-gray-400"
                                    />
                                    <p
                                        class="text-xs text-gray-400 font-medium"
                                    >
                                        ตึก / หน่วยงาน
                                    </p>
                                </div>
                                <p class="text-sm font-semibold text-gray-800">
                                    {{ entry.location }}
                                </p>
                            </div>

                            <!-- Date -->
                            <div class="bg-gray-50 rounded-xl p-3">
                                <div class="flex items-center gap-1.5 mb-1">
                                    <Calendar
                                        class="w-3.5 h-3.5 text-gray-400"
                                    />
                                    <p
                                        class="text-xs text-gray-400 font-medium"
                                    >
                                        วันที่เสนอ
                                    </p>
                                </div>
                                <p class="text-sm font-semibold text-gray-800">
                                    {{ formattedDate }}
                                </p>
                            </div>
                        </div>

                        <!-- Budget Card -->
                        <div
                            class="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4"
                        >
                            <div class="flex items-center gap-1.5 mb-1">
                                <Banknote class="w-4 h-4 text-blue-500" />
                                <p
                                    class="text-xs text-blue-500 font-semibold uppercase tracking-wide"
                                >
                                    งบประมาณที่ขอ
                                </p>
                            </div>
                            <p class="text-2xl font-bold text-blue-700">
                                ฿{{
                                    Number(
                                        entry.budget_requested,
                                    ).toLocaleString("th-TH")
                                }}
                            </p>
                            <p class="text-xs text-blue-400 mt-0.5">บาท</p>
                        </div>

                        <!-- Budget Received & Progress (shown when status is 'มีเงินแล้ว') -->
                        <div
                            v-if="entry.status === 'มีเงินแล้ว'"
                            class="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-4"
                        >
                            <div class="flex items-center gap-1.5 mb-1">
                                <Wallet class="w-4 h-4 text-emerald-500" />
                                <p
                                    class="text-xs text-emerald-500 font-semibold uppercase tracking-wide"
                                >
                                    งบประมาณที่ได้รับ
                                </p>
                            </div>
                            <p class="text-2xl font-bold text-emerald-700">
                                ฿{{
                                    Number(
                                        entry.budget_received || 0,
                                    ).toLocaleString("th-TH")
                                }}
                            </p>
                            <p class="text-xs text-emerald-400 mt-0.5">บาท</p>

                            <!-- Progress Bar -->
                            <div class="mt-3">
                                <div
                                    class="w-full bg-gray-100 rounded-full h-2 overflow-hidden"
                                >
                                    <div
                                        class="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                                        :style="{
                                            width: entry.budget_requested
                                                ? Math.min(
                                                      100,
                                                      Math.round(
                                                          (Number(
                                                              entry.budget_received ||
                                                                  0,
                                                          ) /
                                                              Number(
                                                                  entry.budget_requested,
                                                              )) *
                                                              100,
                                                      ),
                                                  )
                                                : 0 + '%',
                                        }"
                                    ></div>
                                </div>

                                <div
                                    class="flex justify-between mt-1 text-xs items-center"
                                >
                                    <span class="text-gray-400">0%</span>
                                    <span
                                        class="font-bold"
                                        :class="
                                            Number(
                                                entry.budget_received || 0,
                                            ) >= Number(entry.budget_requested)
                                                ? 'text-emerald-600'
                                                : 'text-blue-500'
                                        "
                                    >
                                        {{
                                            entry.budget_requested
                                                ? Math.min(
                                                      100,
                                                      Math.round(
                                                          (Number(
                                                              entry.budget_received ||
                                                                  0,
                                                          ) /
                                                              Number(
                                                                  entry.budget_requested,
                                                              )) *
                                                              100,
                                                      ),
                                                  )
                                                : 0
                                        }}%
                                    </span>
                                    <span class="text-gray-400">
                                        เป้าหมาย ฿{{
                                            Number(
                                                entry.budget_requested,
                                            ).toLocaleString("th-TH")
                                        }}
                                    </span>
                                </div>

                                <div class="mt-2 text-sm text-gray-600">
                                    <template
                                        v-if="
                                            Number(
                                                entry.budget_received || 0,
                                            ) >= Number(entry.budget_requested)
                                        "
                                    >
                                        ได้รับงบครบตามที่ขอแล้ว
                                    </template>
                                    <template v-else>
                                        ขาดอีก ฿{{
                                            Math.max(
                                                0,
                                                Number(entry.budget_requested) -
                                                    Number(
                                                        entry.budget_received ||
                                                            0,
                                                    ),
                                            ).toLocaleString("th-TH")
                                        }}
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-4">
                            <div class="flex items-center gap-1.5 mb-2">
                                <AlignLeft class="w-3.5 h-3.5 text-gray-400" />
                                <h3
                                    class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                >
                                    รายละเอียดโครงการ
                                </h3>
                            </div>
                            <div class="bg-gray-50 rounded-xl p-3.5">
                                <p
                                    class="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                                >
                                    {{ entry.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Status Timeline (horizontal on md+) -->
                        <div class="mb-4">
                            <div class="flex items-center gap-1.5 mb-3">
                                <GitBranch class="w-3.5 h-3.5 text-gray-400" />
                                <h3
                                    class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                >
                                    ความคืบหน้า
                                </h3>
                            </div>

                            <div class="relative">
                                <!-- Vertical line for small screens -->
                                <div
                                    class="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-100 md:hidden"
                                ></div>

                                <!-- Horizontal line for medium+ screens -->
                                <div
                                    class="hidden md:block absolute top-8 left-6 right-6 h-0.5 bg-gray-100 z-0"
                                ></div>

                                <div
                                    class="space-y-3 md:space-y-0 md:flex md:items-center md:gap-6 md:justify-between"
                                >
                                    <div
                                        v-for="(step, idx) in timelineSteps"
                                        :key="idx"
                                        class="flex items-start gap-3 relative md:flex-col md:items-center md:flex-1"
                                    >
                                        <!-- Step Circle -->
                                        <div
                                            class="w-7 h-7 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 transition-all md:mb-2"
                                            :class="step.circleClass"
                                        >
                                            <CheckIcon
                                                v-if="step.completed"
                                                class="w-3.5 h-3.5"
                                            />
                                            <div
                                                v-else-if="step.active"
                                                class="w-2.5 h-2.5 rounded-full"
                                                :class="step.dotClass"
                                            ></div>
                                        </div>

                                        <!-- Step Content -->
                                        <div
                                            class="flex-1 pb-1 md:pb-0 md:text-center"
                                            :class="
                                                idx < timelineSteps.length - 1
                                                    ? 'mb-1 md:mb-0'
                                                    : ''
                                            "
                                        >
                                            <p
                                                class="text-sm font-semibold"
                                                :class="step.labelClass"
                                            >
                                                {{ step.label }}
                                            </p>
                                            <p
                                                v-if="
                                                    step.active &&
                                                    entry.status !== 'ปฏิเสธ'
                                                "
                                                class="text-xs text-gray-400 mt-0.5 md:mt-1"
                                            >
                                                สถานะปัจจุบัน
                                            </p>
                                            <p
                                                v-if="
                                                    step.active &&
                                                    entry.status === 'ปฏิเสธ'
                                                "
                                                class="text-xs text-red-400 mt-0.5 md:mt-1"
                                            >
                                                ถูกปฏิเสธ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Admin Remark -->
                        <div v-if="entry.admin_remark" class="mb-4">
                            <div class="flex items-center gap-1.5 mb-2">
                                <MessageSquare
                                    class="w-3.5 h-3.5 text-amber-500"
                                />
                                <h3
                                    class="text-xs font-semibold text-amber-600 uppercase tracking-wide"
                                >
                                    หมายเหตุจากที่ประชุม
                                </h3>
                            </div>
                            <div
                                class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
                            >
                                <p
                                    class="text-sm text-amber-800 leading-relaxed"
                                >
                                    {{ entry.admin_remark }}
                                </p>
                            </div>
                        </div>

                        <!-- Entry ID -->
                        <div
                            class="flex items-center justify-between text-xs text-gray-300 pt-3 border-t border-gray-50"
                        >
                            <span>รหัสโครงการ: #{{ entry.id }}</span>
                            <span>{{ formattedDateFull }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
    X,
    Building2,
    Calendar,
    Banknote,
    Wallet,
    AlignLeft,
    GitBranch,
    MessageSquare,
    CheckIcon,
} from "lucide-vue-next";
import type { BudgetEntry, Status } from "../types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../types";

// ==================== Props ====================

const props = defineProps<{
    entry: BudgetEntry | null;
}>();

defineEmits<{
    (e: "close"): void;
}>();

// ==================== Timeline Config ====================

type TimelineStep = {
    status: Status;
    label: string;
    completed: boolean;
    active: boolean;
    circleClass: string;
    dotClass: string;
    labelClass: string;
};

const STATUS_ORDER: Status[] = ["รอเงิน", "มีเงินแล้ว", "เสร็จแล้ว"];

const STATUS_ORDER_MAP: Record<Status, number> = {
    รอเงิน: 0,
    มีเงินแล้ว: 1,
    เสร็จแล้ว: 2,
    ปฏิเสธ: -1,
};

// ==================== Computed ====================

const priorityConfig = computed(() => {
    if (!props.entry)
        return {
            color: "#9CA3AF",
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
            borderColor: "border-gray-200",
            emoji: "⚪",
            label: "",
        };
    return (
        PRIORITY_CONFIG[props.entry.priority] || {
            color: "#9CA3AF",
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
            borderColor: "border-gray-200",
            emoji: "⚪",
            label: props.entry.priority,
        }
    );
});

const statusConfig = computed(() => {
    if (!props.entry)
        return { bgColor: "bg-gray-100", textColor: "text-gray-600" };
    return (
        STATUS_CONFIG[props.entry.status] || {
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
        }
    );
});

const timelineSteps = computed((): TimelineStep[] => {
    if (!props.entry) return [];

    // Map legacy statuses from sheet/backend into the simplified 4-status model used in UI.
    // Preserve already-unified statuses so status and timeline stay in sync.
    const rawStatus = props.entry.status as string;
    const mapToFour = (s: string | undefined): Status => {
        if (!s) return "รอเงิน";
        const t = String(s).trim();
        // If already one of the unified statuses, return as-is
        if (
            t === "รอเงิน" ||
            t === "มีเงินแล้ว" ||
            t === "เสร็จแล้ว" ||
            t === "ปฏิเสธ"
        ) {
            return t as Status;
        }
        // Map legacy/alternate values into the unified set
        if (t === "อนุมัติ") return "มีเงินแล้ว";
        if (t === "ดำเนินการแล้ว") return "เสร็จแล้ว";
        if (t === "ปฏิเสธ") return "ปฏิเสธ";
        // Fallback: treat unknown / earlier statuses as waiting for funds
        return "รอเงิน";
    };

    const currentStatus = mapToFour(rawStatus);
    const isRejected = currentStatus === "ปฏิเสธ";
    const currentOrder =
        STATUS_ORDER_MAP[currentStatus] ?? (isRejected ? -1 : 0);

    const labelMap: Record<Status, string> = {
        รอเงิน: "รอเงิน",
        มีเงินแล้ว: "มีเงินแล้ว",
        เสร็จแล้ว: "เสร็จแล้ว",
        ปฏิเสธ: "ปฏิเสธ",
    };

    // Only show the normal 3-step timeline by default.
    // Include the 'ปฏิเสธ' step in the timeline only when the entry is actually rejected.
    const statusesToShow: Status[] = isRejected
        ? [...STATUS_ORDER, "ปฏิเสธ"]
        : STATUS_ORDER;

    const steps: TimelineStep[] = statusesToShow.map((status) => {
        const stepOrder = STATUS_ORDER_MAP[status] ?? 0;

        // If rejected, make the 'ปฏิเสธ' step active and show the normal steps as completed for context.
        let completed = false;
        let active = false;

        if (isRejected) {
            active = status === "ปฏิเสธ";
            // mark the normal steps (non-negative orders) as completed for context
            completed = stepOrder >= 0 && status !== "ปฏิเสธ";
        } else {
            // normal flow: earlier steps (with smaller order) are completed
            completed = currentOrder > stepOrder;
            active = currentStatus === status;
        }

        let circleClass = "border-gray-200 bg-white";
        let dotClass = "bg-gray-500";
        // default label color should be muted gray so 'รอเงิน' appears gray by default
        let labelClass = "text-gray-400";

        if (completed) {
            // completed color depends on the step
            if (status === "มีเงินแล้ว") {
                circleClass = "border-emerald-500 bg-emerald-500 text-white";
                labelClass = "text-emerald-600";
            } else if (status === "เสร็จแล้ว") {
                circleClass = "border-blue-500 bg-blue-500 text-white";
                labelClass = "text-indigo-600";
            } else {
                circleClass = "border-gray-500 bg-gray-500 text-white";
                labelClass = "text-gray-400";
            }
        } else if (active) {
            // active step outlined
            if (status === "มีเงินแล้ว") {
                circleClass = "border-emerald-500 bg-white";
                dotClass = "bg-emerald-500";
                labelClass = "text-emerald-700";
            } else if (status === "เสร็จแล้ว") {
                circleClass = "border-blue-500 bg-white";
                dotClass = "bg-blue-500";
                labelClass = "text-blue-700";
            } else if (status === "ปฏิเสธ") {
                circleClass = "border-gray-300 bg-white";
                dotClass = "bg-gray-500";
                labelClass = "text-gray-700";
            } else if (status === "รอเงิน") {
                // ensure 'รอเงิน' label remains muted gray when active
                circleClass = "border-gray-300 bg-white";
                dotClass = "bg-gray-400";
                labelClass = "text-gray-400";
            } else {
                circleClass = "border-gray-300 bg-white";
                labelClass = "text-gray-400";
            }
        }

        return {
            status,
            label: labelMap[status],
            completed,
            active,
            circleClass,
            dotClass,
            labelClass,
        };
    });

    return steps;
});

const formattedDate = computed(() => {
    if (!props.entry) return "";
    try {
        const d = new Date(props.entry.timestamp);
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
        return props.entry.timestamp;
    }
});

const formattedDateFull = computed(() => {
    if (!props.entry) return "";
    try {
        const d = new Date(props.entry.timestamp);
        const date = d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        const time = d.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${date} ${time}`;
    } catch {
        return props.entry.timestamp;
    }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
    transform: translateY(100%);
}
</style>
