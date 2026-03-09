import axios from "axios";
import type {
  BudgetEntry,
  ApiPayload,
  ApiResponse,
  UpdateStatusPayload,
  EditEntryPayload,
} from "../types";

// ==================== Config ====================

// Replace this with your actual Google App Script Web App URL
const GAS_URL =
  (import.meta.env.VITE_GAS_URL as string) ||
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string) || "admin1234";

// ==================== Axios Instance ====================

const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "text/plain", // GAS requires text/plain to avoid CORS preflight
  },
});

// ==================== Helper ====================

async function postToGAS<T>(payload: ApiPayload): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.post<ApiResponse<T>>(
      GAS_URL,
      JSON.stringify(payload),
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      };
    }
    return {
      success: false,
      error: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    };
  }
}

// ==================== API Functions ====================

/**
 * Fetch all budget entries from Google Sheets
 */
export async function fetchAllEntries(): Promise<BudgetEntry[]> {
  const result = await postToGAS<BudgetEntry[]>({ action: "READ_ALL" });
  if (result.success && result.data) {
    return result.data;
  }
  console.error("[API] fetchAllEntries failed:", result.error);
  return [];
}

/**
 * Create a new budget proposal entry
 */
export async function createEntry(
  data: Omit<BudgetEntry, "id" | "timestamp" | "status" | "admin_remark">,
): Promise<ApiResponse<BudgetEntry>> {
  return postToGAS<BudgetEntry>({
    action: "CREATE",
    data,
  });
}

/**
 * Update the status (and optional remark) of an entry — Admin only
 */
export async function updateStatus(
  id: string,
  status: UpdateStatusPayload["status"],
  admin_remark?: string,
): Promise<ApiResponse<BudgetEntry>> {
  return postToGAS<BudgetEntry>({
    action: "UPDATE_STATUS",
    adminPassword: ADMIN_PASSWORD,
    id,
    status,
    admin_remark,
  });
}

/**
 * Edit any field of an existing entry — Admin only
 */
export async function editEntry(
  id: string,
  data: EditEntryPayload["data"],
): Promise<ApiResponse<BudgetEntry>> {
  return postToGAS<BudgetEntry>({
    action: "EDIT_ENTRY",
    adminPassword: ADMIN_PASSWORD,
    id,
    data,
  });
}

// ==================== Mock Data (for development / demo) ====================

export const MOCK_ENTRIES: BudgetEntry[] = [
  {
    id: "1",
    timestamp: "2025-01-10T08:30:00.000Z",
    title: "ติดตั้งระบบ Air เพิ่มเติมชั้น 2",
    location: "ตึก OPD ใหม่",
    budget_requested: 250000,
    budget_received: 100000,
    priority: "แดง",
    description:
      "ระบบแอร์ชั้น 2 ชำรุด ส่งผลให้ผู้ป่วยรู้สึกไม่สบาย โดยเฉพาะในช่วงฤดูร้อน ควรเร่งดำเนินการก่อนฤดูร้อนถัดไป",
    status: "รอเงิน",
    admin_remark: "",
  },
  {
    id: "2",
    timestamp: "2025-01-12T10:15:00.000Z",
    title: "ปรับปรุงห้องน้ำผู้ป่วยนอก",
    location: "ตึก OPD เก่า",
    budget_requested: 120000,
    budget_received: 0,
    priority: "เหลือง",
    description:
      "ห้องน้ำมีอายุการใช้งานมากกว่า 15 ปี มีกลิ่น และสภาพชำรุด ต้องการปรับปรุงพื้นกระเบื้องและระบบระบายอากาศ",
    status: "รอเงิน",
    admin_remark: "",
  },
  {
    id: "3",
    timestamp: "2025-01-14T09:00:00.000Z",
    title: "จัดซื้อเครื่องมือแพทย์ใหม่",
    location: "ตึก OPD ใหม่",
    budget_requested: 850000,
    budget_received: 850000,
    priority: "แดง",
    description:
      "เครื่องตรวจ EKG เก่ามีปัญหาบ่อยครั้ง ส่งผลต่อการวินิจฉัยโรค ควรจัดซื้อเครื่องใหม่เพื่อรองรับผู้ป่วย",
    status: "มีเงินแล้ว",
    admin_remark: "อนุมัติงบ 850,000 บาท รอการจัดซื้อจัดจ้าง",
  },
  {
    id: "4",
    timestamp: "2025-01-16T14:20:00.000Z",
    title: "ปรับปรุงครัวกลาง",
    location: "ตึกโภชนาการ",
    budget_requested: 380000,
    budget_received: 200000,
    priority: "เหลือง",
    description:
      "ต้องการปรับปรุงพื้นที่ครัวกลาง เพิ่มอุปกรณ์ครัวอุตสาหกรรม และระบบระบายควันที่มีประสิทธิภาพมากขึ้น",
    status: "รอเงิน",
    admin_remark: "",
  },
  {
    id: "5",
    timestamp: "2025-01-18T11:30:00.000Z",
    title: "ติดตั้งป้ายบอกทางภายในอาคาร",
    location: "ตึก OPD เก่า",
    budget_requested: 45000,
    budget_received: 45000,
    priority: "เขียว",
    description:
      "ผู้ป่วยและญาติมักหลงทางภายในอาคาร ต้องการติดตั้งป้ายบอกทางที่ชัดเจนเป็นภาษาไทยและอังกฤษ",
    status: "เสร็จแล้ว",
    admin_remark: "ดำเนินการเรียบร้อยแล้ว มีนาคม 2568",
  },
  {
    id: "6",
    timestamp: "2025-01-20T08:00:00.000Z",
    title: "จัดซื้อรถเข็นผู้ป่วยเพิ่มเติม",
    location: "อื่นๆ",
    budget_requested: 90000,
    budget_received: 0,
    priority: "เขียว",
    description:
      "รถเข็นมีไม่เพียงพอในช่วง Peak Hours โดยเฉพาะช่วงเช้า ต้องการจัดซื้อเพิ่มอีก 20 คัน",
    status: "รอเงิน",
    admin_remark: "",
  },
  {
    id: "7",
    timestamp: "2025-01-22T13:45:00.000Z",
    title: "ปรับปรุงระบบไฟฟ้าสำรอง",
    location: "ตึก OPD ใหม่",
    budget_requested: 620000,
    budget_received: 0,
    priority: "แดง",
    description:
      "ระบบ UPS และ Generator สำรองมีอายุมาก เกิดปัญหาไฟดับกะทันหัน 3 ครั้งในปีที่ผ่านมา ต้องเร่งดำเนินการ",
    status: "ปฏิเสธ",
    admin_remark:
      "งบประมาณเกินวงเงินที่ได้รับจัดสรรในปีนี้ ให้เสนอใหม่ปีงบถัดไป",
  },
  {
    id: "8",
    timestamp: "2025-01-25T09:30:00.000Z",
    title: "จัดทำโครงการอาหารเสริมโภชนาการผู้ป่วย",
    location: "ตึกโภชนาการ",
    budget_requested: 175000,
    budget_received: 50000,
    priority: "เขียว",
    description:
      "พัฒนาเมนูอาหารให้หลากหลายและมีคุณค่าทางโภชนาการมากขึ้น สำหรับผู้ป่วยที่พักรักษาตัวในโรงพยาบาล",
    status: "รอเงิน",
    admin_remark: "",
  },
];

/**
 * Check if the app is running in demo/development mode (no real GAS URL configured)
 */
export function isDevMode(): boolean {
  return !import.meta.env.VITE_GAS_URL || import.meta.env.VITE_GAS_URL === "";
}

export { ADMIN_PASSWORD };
