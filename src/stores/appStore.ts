import { reactive, computed } from "vue";
import type { BudgetEntry, Priority, Location, Status } from "../types";
import {
  fetchAllEntries,
  createEntry,
  MOCK_ENTRIES,
  isDevMode,
} from "../services/api";

// ==================== State ====================

const state = reactive({
  entries: [] as BudgetEntry[],
  isLoading: false,
  error: null as string | null,
  lastFetched: null as Date | null,

  // Filters
  filterPriority: null as Priority | null,
  filterLocation: null as Location | null,
  filterStatus: null as Status | null,
  searchQuery: "",

  // Admin
  // Initialize admin state from localStorage so admin remains logged in until they explicitly log out.
  // Stored under key "sabot_admin" as JSON: { isAdminLoggedIn: boolean, adminUsername: string }
  isAdminLoggedIn: (() => {
    try {
      const raw = localStorage.getItem("sabot_admin");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed && parsed.isAdminLoggedIn === true;
    } catch {
      return false;
    }
  })(),
  adminUsername: (() => {
    try {
      const raw = localStorage.getItem("sabot_admin");
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed.adminUsername === "string"
        ? parsed.adminUsername
        : "";
    } catch {
      return "";
    }
  })(),

  // UI
  isDevMode: isDevMode(),
});

// ==================== Computed / Getters ====================

const filteredEntries = computed(() => {
  let result = [...state.entries];

  if (state.filterPriority) {
    result = result.filter((e) => e.priority === state.filterPriority);
  }

  if (state.filterLocation) {
    result = result.filter((e) => e.location === state.filterLocation);
  }

  if (state.filterStatus) {
    result = result.filter((e) => e.status === state.filterStatus);
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.trim().toLowerCase();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }

  // Sort: แดง > เหลือง > เขียว, then by timestamp desc
  const priorityOrder: Record<string, number> = { แดง: 0, เหลือง: 1, เขียว: 2 };
  result.sort((a, b) => {
    const pDiff =
      (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    if (pDiff !== 0) return pDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return result;
});

/**
 * Map legacy statuses to the simplified 4-status model used in the UI/store:
 * - เสนอใหม่, รอเข้าที่ประชุม, ... -> รอเงิน
 * - อนุมัติ -> มีเงินแล้ว
 * - ดำเนินการแล้ว -> เสร็จแล้ว
 * - ปฏิเสธ -> ปฏิเสธ
 */
function mapToFourStatus(
  s: string | undefined,
): "รอเงิน" | "มีเงินแล้ว" | "เสร็จแล้ว" | "ปฏิเสธ" {
  if (!s) return "รอเงิน";
  const t = String(s).trim();
  // If already one of the new statuses, return as-is
  if (
    t === "รอเงิน" ||
    t === "มีเงินแล้ว" ||
    t === "เสร็จแล้ว" ||
    t === "ปฏิเสธ"
  ) {
    return t as "รอเงิน" | "มีเงินแล้ว" | "เสร็จแล้ว" | "ปฏิเสธ";
  }
  if (t === "อนุมัติ") return "มีเงินแล้ว";
  if (t === "ดำเนินการแล้ว") return "เสร็จแล้ว";
  if (t === "ปฏิเสธ") return "ปฏิเสธ";
  // Default fallback: treat other / earlier statuses as waiting for funds
  return "รอเงิน";
}

/**
 * Normalize an entry object so the store works with the unified 4-status values
 * and normalized numeric budget.
 */
function normalizeEntry(e: any): BudgetEntry {
  return {
    ...e,
    status: mapToFourStatus(e.status as string),
    budget_requested: Number(e.budget_requested) || 0,
  } as BudgetEntry;
}

const summaryStats = computed(() => {
  // Attach displayStatus (mapped) so all stats reflect the simplified 4-status model
  const entries = state.entries.map((e) => ({
    ...e,
    displayStatus: mapToFourStatus(e.status as string),
  }));

  const totalBudget = entries.reduce(
    (sum, e) => sum + (Number(e.budget_requested) || 0),
    0,
  );

  // Budget for entries that are mapped to 'มีเงินแล้ว'
  const approvedBudget = entries
    .filter((e) => e.displayStatus === "มีเงินแล้ว")
    .reduce((sum, e) => sum + (Number(e.budget_requested) || 0), 0);

  // Pending budget considered as entries mapped to 'รอเงิน'
  const pendingBudget = entries
    .filter((e) => e.displayStatus === "รอเงิน")
    .reduce((sum, e) => sum + (Number(e.budget_requested) || 0), 0);

  const byLocation: Record<string, number> = {};
  entries.forEach((e) => {
    byLocation[e.location] =
      (byLocation[e.location] || 0) + (Number(e.budget_requested) || 0);
  });

  // Count by the mapped display status (รอเงิน, มีเงินแล้ว, เสร็จแล้ว, ปฏิเสธ)
  const byStatus: Record<string, number> = {};
  entries.forEach((e) => {
    const s = e.displayStatus;
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  const byPriority: Record<string, number> = {};
  entries.forEach((e) => {
    byPriority[e.priority] = (byPriority[e.priority] || 0) + 1;
  });

  return {
    totalEntries: entries.length,
    totalBudget,
    approvedBudget,
    pendingBudget,
    byLocation,
    byStatus,
    byPriority,
  };
});

// ==================== Actions ====================

async function loadEntries() {
  state.isLoading = true;
  state.error = null;
  try {
    if (state.isDevMode) {
      // Use mock data in dev mode
      await new Promise((resolve) => setTimeout(resolve, 600)); // simulate network
      // Normalize mock entries so UI/store always uses unified statuses
      state.entries = [...MOCK_ENTRIES].map((e) => normalizeEntry(e));
    } else {
      const data = await fetchAllEntries();
      // Normalize incoming data: map legacy statuses -> unified 4 statuses
      state.entries = data.map((e) => normalizeEntry(e));
    }
    state.lastFetched = new Date();
  } catch (err: unknown) {
    state.error = err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ";
    // Fallback to mock in case of error
    if (state.entries.length === 0) {
      state.entries = [...MOCK_ENTRIES].map((e) => normalizeEntry(e));
    }
  } finally {
    state.isLoading = false;
  }
}

function addEntry(entry: BudgetEntry) {
  // normalize before adding to store so counts are accurate
  state.entries.unshift(normalizeEntry(entry as any));
}

function addEntryOptimistic(entry: BudgetEntry) {
  // Add immediately for responsive UI (normalize entry)
  state.entries.unshift(normalizeEntry(entry as any));
}

async function submitEntry(
  data: Omit<BudgetEntry, "id" | "timestamp" | "status" | "admin_remark">,
): Promise<{ success: boolean; message?: string; data?: BudgetEntry }> {
  if (state.isDevMode) {
    // Simulate network delay in demo mode
    await new Promise((resolve) => setTimeout(resolve, 900));
    const newEntry: BudgetEntry = {
      ...data,
      id: `mock_${Date.now()}`,
      timestamp: new Date().toISOString(),
      // Use unified new status for mock entries
      status: "รอเงิน",
      admin_remark: "",
    };
    MOCK_ENTRIES.unshift(newEntry);
    return { success: true, data: newEntry };
  }

  const result = await createEntry(data);
  if (result.success && result.data) {
    // Normalize incoming server entry before returning to caller
    return { success: true, data: normalizeEntry(result.data) };
  }
  return {
    success: false,
    message: result.error || "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  };
}

function updateEntryInStore(updated: BudgetEntry) {
  const normalized = normalizeEntry(updated as any);
  const idx = state.entries.findIndex((e) => e.id === normalized.id);
  if (idx !== -1) {
    state.entries[idx] = { ...normalized };
  }
}

function setFilterPriority(priority: Priority | null) {
  state.filterPriority = priority;
}

function setFilterLocation(location: Location | null) {
  state.filterLocation = location;
}

function setFilterStatus(status: Status | null) {
  state.filterStatus = status;
}

function setSearchQuery(query: string) {
  state.searchQuery = query;
}

function clearFilters() {
  state.filterPriority = null;
  state.filterLocation = null;
  state.filterStatus = null;
  state.searchQuery = "";
}

function loginAdmin(username: string) {
  state.isAdminLoggedIn = true;
  state.adminUsername = username;
  try {
    localStorage.setItem(
      "sabot_admin",
      JSON.stringify({ isAdminLoggedIn: true, adminUsername: username }),
    );
  } catch {
    // ignore localStorage errors (e.g., private mode)
  }
}

function logoutAdmin() {
  state.isAdminLoggedIn = false;
  state.adminUsername = "";
  try {
    localStorage.removeItem("sabot_admin");
  } catch {
    // ignore localStorage errors
  }
}

function setDevMode(val: boolean) {
  state.isDevMode = val;
}

// ==================== Export Store ====================

export const useAppStore = () => ({
  // State (reactive refs)
  state,

  // Computed
  filteredEntries,
  summaryStats,

  // Actions
  loadEntries,
  addEntry,
  addEntryOptimistic,
  submitEntry,
  updateEntryInStore,
  setFilterPriority,
  setFilterLocation,
  setFilterStatus,
  setSearchQuery,
  clearFilters,
  loginAdmin,
  logoutAdmin,
  setDevMode,
});
