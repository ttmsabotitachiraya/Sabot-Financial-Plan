<template>
    <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
        @click="$emit('click', entry)"
    >
        <div class="p-4">
            <!-- Top Row: Title + Status Badge -->
            <div class="flex items-start justify-between gap-2 mb-2">
                <h3
                    class="text-sm font-bold text-gray-800 leading-snug flex-1 line-clamp-2"
                >
                    {{ entry.title }}
                </h3>
                <span
                    class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                    :class="statusConfig.bgColor + ' ' + statusConfig.textColor"
                >
                    {{ entry.status }}
                </span>
            </div>

            <!-- Meta Row -->
            <div class="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span class="flex items-center gap-1">
                    <Building2 class="w-3 h-3" />
                    {{ entry.location }}
                </span>
                <span class="flex items-center gap-1">
                    <Calendar class="w-3 h-3" />
                    {{ formattedDateTime }}
                </span>
            </div>

            <!-- Description Preview -->
            <p class="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                {{ entry.description }}
            </p>

            <!-- Bottom Row: Budget + Priority -->
            <div
                class="flex items-center justify-between pt-3 border-t border-gray-50"
            >
                <!-- Budget -->
                <div class="flex items-center gap-1.5">
                    <Banknote class="w-4 h-4 text-gray-400" />
                    <span class="text-base font-bold text-gray-800">
                        ฿{{ formattedBudget }}
                    </span>
                </div>

                <!-- Priority Badge -->
                <span
                    class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
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

            <!-- Admin Remark (if any) -->
            <div
                v-if="entry.admin_remark"
                class="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 flex items-start gap-2"
            >
                <MessageSquare
                    class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p class="text-xs text-amber-700 leading-relaxed line-clamp-2">
                    {{ entry.admin_remark }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Building2, Calendar, Banknote, MessageSquare } from "lucide-vue-next";
import type { BudgetEntry } from "../types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../types";

// ==================== Props ====================

const props = defineProps<{
    entry: BudgetEntry;
}>();

defineEmits<{
    (e: "click", entry: BudgetEntry): void;
}>();

// ==================== Computed ====================

const priorityConfig = computed(() => {
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
    return (
        STATUS_CONFIG[props.entry.status] || {
            bgColor: "bg-gray-100",
            textColor: "text-gray-600",
        }
    );
});

const formattedBudget = computed(() => {
    const val = Number(props.entry.budget_requested);
    if (isNaN(val)) return "0";
    try {
        // Format with thousand separators like 500,000
        return new Intl.NumberFormat("en-US").format(val);
    } catch {
        return String(val);
    }
});

const formattedDateTime = computed(() => {
    if (!props.entry) return "";
    try {
        const d = new Date(props.entry.timestamp);

        // Format date (ไทย) with short month and 2-digit year
        const date = d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "2-digit",
        });

        // Format time (ไทย) with hours and minutes (24-hour like "14:30")
        const time = d.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        // Return combined date + time (time shown after date)
        return `${date} ${time}`;
    } catch {
        return props.entry?.timestamp ?? "";
    }
});
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
