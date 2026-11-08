import { apiError } from "./apiError";
export interface GenerationRequest {
  mode: "grade" | "class" | "individual";
  gradeId: number; classId?: number; studentId?: number;
  periodMonth: number; periodYear: number; amountDue?: number; previewToken?: string;
}
export interface GenerationRow {
  classId: number; className: string; studentId: number | null; studentName: string;
  amountDue: number; outcome: string; reason: string | null; enrollmentEligible: boolean; invoiceId: number | null;
  dueDate?: string | null; dueDatePolicy?: string | null;
  monthlyFee: number | null;
}
export interface GenerationPreview {
  mode: string; gradeId: number; gradeName: string; periodMonth: number; periodYear: number;
  dueDate: string; dueDatePolicy: string; previewToken: string; classCount: number; studentCount: number;
  eligibleCount: number; totalAmount: number; alreadyExists: number; ineligible: number; created: number; failed: number;
  classes: { classId: number; className: string; invoiceCount: number; amount: number; alreadyExists: number; ineligible: number }[];
  rows: GenerationRow[];
  billingPolicy: "monthly-fixed-v1";
}
async function call(action: "preview" | "confirm", request: GenerationRequest): Promise<GenerationPreview> {
  let response: Response;
  try { response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/tuitioninvoices/generation/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) }); }
  catch { throw new Error("Chưa xác nhận được kết quả. Xem Preview lại để đối chiếu hóa đơn đã có trước khi thử lại; không tự ghi nhận Payment."); }
  if (!response.ok) throw await apiError(response, "Không xử lý được yêu cầu lập hóa đơn.");
  const result = await response.json();
  if (!result || result.mode !== request.mode || result.gradeId !== request.gradeId || result.periodMonth !== request.periodMonth || result.periodYear !== request.periodYear
    || typeof result.previewToken !== "string" || !Array.isArray(result.rows) || !Array.isArray(result.classes)
    || ![result.created, result.eligibleCount, result.alreadyExists, result.ineligible, result.failed, result.classCount, result.studentCount, result.totalAmount].every(n => Number.isFinite(n) && n >= 0))
    throw new Error("Phản hồi chưa xác nhận kết quả hợp lệ. Tải Preview và danh sách hóa đơn để kiểm tra.");
  if (result.billingPolicy !== "monthly-fixed-v1" || result.rows.some((row: GenerationRow) =>
    !["eligible", "created", "already_exists", "ineligible"].includes(row.outcome)
    || !Number.isFinite(row.amountDue) || row.amountDue < 0
    || (["eligible", "created"].includes(row.outcome) && row.amountDue === 0)))
    throw new Error("Backend chưa xác nhận chính sách học phí tháng hiện hành. Tải lại Preview bằng Backend mới.");
  return result;
}
export const tuitionGenerationApi = { preview: (request: GenerationRequest) => call("preview", request), confirm: (request: GenerationRequest) => call("confirm", request) };
