// ==================== Core Data Types ====================

export type Priority = "เขียว" | "เหลือง" | "แดง";

export type Location =
  | "ตึก OPD ใหม่"
  | "ตึก OPD เก่า"
  | "ตึกโภชนาการ"
  | "อื่นๆ";

export type Status = "รอเงิน" | "มีเงินแล้ว" | "เสร็จแล้ว" | "ปฏิเสธ";

// ==================== Main Entry Model ====================

export interface BudgetEntry {
  id: string;
  timestamp: string;
  title: string;
  location: Location;
  budget_requested: number;
  budget_received?: number;
  priority: Priority;
  description: string;
  status: Status;
  admin_remark: string;
}

// ==================== Form Model (for submission) ====================

export interface BudgetEntryForm {
  title: string;
  location: Location | "";
  budget_requested: number | null;
  priority: Priority | "";
  description: string;
}

// ==================== API Payloads ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ReadAllPayload {
  action: "READ_ALL";
}

export interface CreatePayload {
  action: "CREATE";
  data: Omit<BudgetEntry, "id" | "timestamp" | "status" | "admin_remark">;
}

export interface UpdateStatusPayload {
  action: "UPDATE_STATUS";
  adminPassword: string;
  id: string;
  status: Status;
  admin_remark?: string;
}

export interface EditEntryPayload {
  action: "EDIT_ENTRY";
  adminPassword: string;
  id: string;
  data: Partial<Omit<BudgetEntry, "id" | "timestamp">>;
}

export type ApiPayload =
  | ReadAllPayload
  | CreatePayload
  | UpdateStatusPayload
  | EditEntryPayload;

// ==================== Admin ====================

export interface AdminCredentials {
  username: string;
  password: string;
}

// ==================== UI Helpers ====================

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  emoji: string;
}

export interface StatusConfig {
  label: Status;
  color: string;
  bgColor: string;
  textColor: string;
}

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  แดง: {
    label: "เร่งด่วนมาก",
    color: "#EF4444",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-400",
    emoji: "🔴",
  },
  เหลือง: {
    label: "เร่งด่วน",
    color: "#F59E0B",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-400",
    emoji: "🟡",
  },
  เขียว: {
    label: "ทั่วไป",
    color: "#10B981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-400",
    emoji: "🟢",
  },
};

/*
  Unified status UI classes
  All statuses (รอเงิน, มีเงินแล้ว, เสร็จแล้ว, ปฏิเสธ) use the same gray appearance
  so dropdowns and status buttons render with a consistent gray style.
*/
export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  รอเงิน: {
    label: "รอเงิน",
    color: "#9CA3AF",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
  มีเงินแล้ว: {
    label: "มีเงินแล้ว",
    color: "#9CA3AF",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
  เสร็จแล้ว: {
    label: "เสร็จแล้ว",
    color: "#9CA3AF",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
  ปฏิเสธ: {
    label: "ปฏิเสธ",
    color: "#9CA3AF",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
};

export const LOCATION_OPTIONS: Location[] = [
  "ตึก OPD ใหม่",
  "ตึก OPD เก่า",
  "ตึกโภชนาการ",
  "อื่นๆ",
];

export const PRIORITY_OPTIONS: Priority[] = ["แดง", "เหลือง", "เขียว"];

export const STATUS_OPTIONS: Status[] = [
  "รอเงิน",
  "มีเงินแล้ว",
  "เสร็จแล้ว",
  "ปฏิเสธ",
];
