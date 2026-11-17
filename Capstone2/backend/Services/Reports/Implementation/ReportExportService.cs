using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ClosedXML.Excel;
using EduTrack.API.Models.EF;
using EduTrack.API.Services.Management;
using Microsoft.EntityFrameworkCore;

namespace EduTrack.API.Services.Reports.Implementation
{
    public class ReportExportService : IReportExportService
    {
        private readonly EduTrackDbContext _context;

        public ReportExportService(EduTrackDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> ExportTuitionReportToExcelAsync(
            int? classId = null,
            string? status = null,
            string? searchTerm = null,
            string? roleTitle = "Admin Staff")
        {
            var now = DateTimeOffset.UtcNow;

            // 1. Lấy toàn bộ danh sách hóa đơn học phí kèm học sinh, lớp và lịch sử thanh toán
            var query = _context.TuitionInvoices
                .AsNoTracking()
                .Include(i => i.Student)
                .Include(i => i.Class)
                .Include(i => i.Payments)
                .AsQueryable();

            if (classId.HasValue && classId.Value > 0)
            {
                query = query.Where(i => i.ClassId == classId.Value);
            }

            var invoices = await query.ToListAsync();

            // 2. Map sang ViewModel để áp dụng TuitionPolicy tính toán trạng thái chuẩn xác
            var reportRows = invoices.Select(inv =>
            {
                var totalPaid = inv.Payments.Sum(p => p.Amount);
                var balance = Math.Max(0, inv.AmountDue - totalPaid);
                var resolvedStatus = TuitionPolicy.ResolveStatus(
                    inv.AmountDue, totalPaid, inv.DueDate, now, inv.Status);
                var lastPayment = inv.Payments
                    .OrderByDescending(p => p.PaidAt)
                    .FirstOrDefault();

                return new
                {
                    inv.InvoiceId,
                    InvoiceCode = $"INV-{inv.InvoiceId:D5}",
                    StudentCode = inv.Student?.UserCode ?? $"STU-{inv.StudentId:D4}",
                    StudentName = inv.Student?.FullName ?? "N/A",
                    inv.ClassId,
                    ClassName = inv.Class?.ClassName ?? $"Class #{inv.ClassId}",
                    Period = $"Tháng {inv.PeriodMonth:D2}/{inv.PeriodYear}",
                    DueDate = inv.DueDate,
                    AmountDue = inv.AmountDue,
                    PaidAmount = totalPaid,
                    RemainingBalance = balance,
                    Status = resolvedStatus,
                    LastPaymentDate = lastPayment?.PaidAt
                };
            }).ToList();

            // 3. Lọc theo searchTerm nếu có
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim().ToLower();
                reportRows = reportRows.Where(r =>
                    r.StudentName.ToLower().Contains(term) ||
                    r.StudentCode.ToLower().Contains(term) ||
                    r.ClassName.ToLower().Contains(term) ||
                    r.InvoiceCode.ToLower().Contains(term)
                ).ToList();
            }

            // 4. Lọc theo trạng thái status nếu có
            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                reportRows = reportRows.Where(r =>
                    r.Status.Equals(status, StringComparison.OrdinalIgnoreCase) ||
                    (status.Equals("Partially Paid", StringComparison.OrdinalIgnoreCase) && r.Status.Equals("partially_paid", StringComparison.OrdinalIgnoreCase)) ||
                    (status.Equals("Paid", StringComparison.OrdinalIgnoreCase) && r.Status.Equals("paid", StringComparison.OrdinalIgnoreCase)) ||
                    (status.Equals("Unpaid", StringComparison.OrdinalIgnoreCase) && r.Status.Equals("unpaid", StringComparison.OrdinalIgnoreCase)) ||
                    (status.Equals("Overdue", StringComparison.OrdinalIgnoreCase) && r.Status.Equals("overdue", StringComparison.OrdinalIgnoreCase))
                ).ToList();
            }

            // Sắp xếp danh sách
            reportRows = reportRows.OrderBy(r => r.ClassName).ThenBy(r => r.StudentName).ToList();

            // 5. Tính toán các chỉ số thống kê
            int totalRecords = reportRows.Count;
            decimal totalAmountDue = reportRows.Sum(r => r.AmountDue);
            decimal totalPaidAmount = reportRows.Sum(r => r.PaidAmount);
            decimal totalRemaining = reportRows.Sum(r => r.RemainingBalance);
            double collectionRate = totalAmountDue > 0 ? (double)(totalPaidAmount / totalAmountDue) * 100 : 0.0;

            // 6. Xây dựng tài liệu Excel bằng ClosedXML
            using (var workbook = new XLWorkbook())
            {
                var ws = workbook.Worksheets.Add("Báo Cáo Học Phí");
                ws.ShowGridLines = true;

                // --- Header Báo Cáo ---
                ws.Cell("A1").Value = "TRUNG TÂM GIÁO DỤC THÔNG MINH EDUTRACK";
                ws.Cell("A1").Style.Font.Bold = true;
                ws.Cell("A1").Style.Font.FontSize = 13;
                ws.Cell("A1").Style.Font.FontColor = XLColor.FromHtml("#1E3A8A");

                ws.Cell("A2").Value = "BÁO CÁO THỐNG KÊ HỌC PHÍ & CÔNG NỢ HỌC VỤ";
                ws.Cell("A2").Style.Font.Bold = true;
                ws.Cell("A2").Style.Font.FontSize = 16;
                ws.Cell("A2").Style.Font.FontColor = XLColor.FromHtml("#0F172A");

                ws.Cell("A3").Value = $"Thời gian xuất: {DateTime.Now:dd/MM/yyyy HH:mm:ss} | Người tạo: {roleTitle} | Hệ thống EduTrack LMS";
                ws.Cell("A3").Style.Font.Italic = true;
                ws.Cell("A3").Style.Font.FontSize = 9.5;
                ws.Cell("A3").Style.Font.FontColor = XLColor.FromHtml("#64748B");

                var filterDesc = $"Bộ lọc: Lớp: {(classId.HasValue && classId.Value > 0 ? $"#{classId.Value}" : "Tất cả các lớp")} | Trạng thái: {(!string.IsNullOrWhiteSpace(status) ? status : "Tất cả")} | Tìm kiếm: {(!string.IsNullOrWhiteSpace(searchTerm) ? searchTerm : "Không")}";
                ws.Cell("A4").Value = filterDesc;
                ws.Cell("A4").Style.Font.FontSize = 9.5;
                ws.Cell("A4").Style.Font.FontColor = XLColor.FromHtml("#475569");

                // --- Hộp chỉ số tổng quan (KPI Summary Cards) ---
                int summaryRow = 6;
                ws.Range($"A{summaryRow}:B{summaryRow}").Merge();
                ws.Cell(summaryRow, 1).Value = $"Tổng số hóa đơn: {totalRecords:N0}";
                ws.Cell(summaryRow, 1).Style.Font.Bold = true;
                ws.Cell(summaryRow, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#F1F5F9");
                ws.Cell(summaryRow, 1).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                ws.Cell(summaryRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                ws.Range($"C{summaryRow}:E{summaryRow}").Merge();
                ws.Cell(summaryRow, 3).Value = $"Tổng phải thu: {totalAmountDue:N0} VND";
                ws.Cell(summaryRow, 3).Style.Font.Bold = true;
                ws.Cell(summaryRow, 3).Style.Fill.BackgroundColor = XLColor.FromHtml("#EFF6FF");
                ws.Cell(summaryRow, 3).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                ws.Cell(summaryRow, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                ws.Range($"F{summaryRow}:H{summaryRow}").Merge();
                ws.Cell(summaryRow, 6).Value = $"Tổng đã thu: {totalPaidAmount:N0} VND ({collectionRate:0.1}%)";
                ws.Cell(summaryRow, 6).Style.Font.Bold = true;
                ws.Cell(summaryRow, 6).Style.Font.FontColor = XLColor.FromHtml("#166534");
                ws.Cell(summaryRow, 6).Style.Fill.BackgroundColor = XLColor.FromHtml("#DCFCE7");
                ws.Cell(summaryRow, 6).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                ws.Cell(summaryRow, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                ws.Range($"I{summaryRow}:L{summaryRow}").Merge();
                ws.Cell(summaryRow, 9).Value = $"Tổng công nợ còn lại: {totalRemaining:N0} VND";
                ws.Cell(summaryRow, 9).Style.Font.Bold = true;
                ws.Cell(summaryRow, 9).Style.Font.FontColor = XLColor.FromHtml("#991B1B");
                ws.Cell(summaryRow, 9).Style.Fill.BackgroundColor = XLColor.FromHtml("#FEE2E2");
                ws.Cell(summaryRow, 9).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                ws.Cell(summaryRow, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                // --- Bảng Dữ Liệu Chi Tiết ---
                int tableHeaderRow = 8;
                string[] headers = {
                    "STT",
                    "Mã Hóa Đơn",
                    "Mã Học Sinh",
                    "Họ và Tên Học Sinh",
                    "Lớp Học",
                    "Kỳ Thu Phí",
                    "Hạn Nộp",
                    "Học Phí Phải Nộp",
                    "Đã Thanh Toán",
                    "Còn Nợ Lại",
                    "Trạng Thái",
                    "Ngày Đóng Gần Nhất"
                };

                for (int c = 0; c < headers.Length; c++)
                {
                    var cell = ws.Cell(tableHeaderRow, c + 1);
                    cell.Value = headers[c];
                    cell.Style.Font.Bold = true;
                    cell.Style.Font.FontSize = 10.5;
                    cell.Style.Font.FontColor = XLColor.White;
                    cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1E40AF");
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                }
                ws.Row(tableHeaderRow).Height = 28;

                // --- Đổ dữ liệu các dòng ---
                int currentRow = tableHeaderRow + 1;
                for (int i = 0; i < reportRows.Count; i++)
                {
                    var item = reportRows[i];

                    ws.Cell(currentRow, 1).Value = i + 1;
                    ws.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    ws.Cell(currentRow, 2).Value = item.InvoiceCode;
                    ws.Cell(currentRow, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    ws.Cell(currentRow, 3).Value = item.StudentCode;
                    ws.Cell(currentRow, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    ws.Cell(currentRow, 4).Value = item.StudentName;
                    ws.Cell(currentRow, 4).Style.Font.Bold = true;

                    ws.Cell(currentRow, 5).Value = item.ClassName;

                    ws.Cell(currentRow, 6).Value = item.Period;
                    ws.Cell(currentRow, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    ws.Cell(currentRow, 7).Value = item.DueDate.ToString("dd/MM/yyyy");
                    ws.Cell(currentRow, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    // Tiền tệ
                    ws.Cell(currentRow, 8).Value = item.AmountDue;
                    ws.Cell(currentRow, 8).Style.NumberFormat.Format = "#,##0 \"VND\"";
                    ws.Cell(currentRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                    ws.Cell(currentRow, 9).Value = item.PaidAmount;
                    ws.Cell(currentRow, 9).Style.NumberFormat.Format = "#,##0 \"VND\"";
                    ws.Cell(currentRow, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    if (item.PaidAmount > 0)
                    {
                        ws.Cell(currentRow, 9).Style.Font.FontColor = XLColor.FromHtml("#166534");
                    }

                    ws.Cell(currentRow, 10).Value = item.RemainingBalance;
                    ws.Cell(currentRow, 10).Style.NumberFormat.Format = "#,##0 \"VND\"";
                    ws.Cell(currentRow, 10).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    if (item.RemainingBalance > 0)
                    {
                        ws.Cell(currentRow, 10).Style.Font.FontColor = XLColor.FromHtml("#991B1B");
                    }

                    // Trạng thái (Tô màu nhẹ theo trạng thái)
                    var statusCell = ws.Cell(currentRow, 11);
                    var st = item.Status?.ToLowerInvariant() ?? "";
                    if (st == "paid")
                    {
                        statusCell.Value = "Đã hoàn thành";
                        statusCell.Style.Font.FontColor = XLColor.FromHtml("#166534");
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHtml("#DCFCE7");
                    }
                    else if (st == "partially_paid" || st == "partially paid")
                    {
                        statusCell.Value = "Đóng 1 phần";
                        statusCell.Style.Font.FontColor = XLColor.FromHtml("#1E40AF");
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHtml("#DBEAFE");
                    }
                    else if (st == "overdue")
                    {
                        statusCell.Value = "Quá hạn";
                        statusCell.Style.Font.FontColor = XLColor.FromHtml("#991B1B");
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHtml("#FEE2E2");
                    }
                    else
                    {
                        statusCell.Value = "Chưa đóng";
                        statusCell.Style.Font.FontColor = XLColor.FromHtml("#854D0E");
                        statusCell.Style.Fill.BackgroundColor = XLColor.FromHtml("#FEF9C3");
                    }
                    statusCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    statusCell.Style.Font.Bold = true;

                    // Ngày đóng gần nhất
                    ws.Cell(currentRow, 12).Value = item.LastPaymentDate.HasValue
                        ? item.LastPaymentDate.Value.ToString("dd/MM/yyyy HH:mm")
                        : "—";
                    ws.Cell(currentRow, 12).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    // Kẻ khung viền mỏng từng dòng
                    ws.Range(currentRow, 1, currentRow, 12).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    ws.Range(currentRow, 1, currentRow, 12).Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                    ws.Range(currentRow, 1, currentRow, 12).Style.Border.OutsideBorderColor = XLColor.FromHtml("#E2E8F0");
                    ws.Range(currentRow, 1, currentRow, 12).Style.Border.InsideBorderColor = XLColor.FromHtml("#E2E8F0");

                    currentRow++;
                }

                // --- Dòng Tổng Cộng (Summary Footer Row) ---
                int footerRow = currentRow;
                ws.Range($"A{footerRow}:G{footerRow}").Merge();
                ws.Cell(footerRow, 1).Value = "TỔNG CỘNG HỌC PHÍ:";
                ws.Cell(footerRow, 1).Style.Font.Bold = true;
                ws.Cell(footerRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                ws.Cell(footerRow, 8).Value = totalAmountDue;
                ws.Cell(footerRow, 8).Style.NumberFormat.Format = "#,##0 \"VND\"";
                ws.Cell(footerRow, 8).Style.Font.Bold = true;
                ws.Cell(footerRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                ws.Cell(footerRow, 9).Value = totalPaidAmount;
                ws.Cell(footerRow, 9).Style.NumberFormat.Format = "#,##0 \"VND\"";
                ws.Cell(footerRow, 9).Style.Font.Bold = true;
                ws.Cell(footerRow, 9).Style.Font.FontColor = XLColor.FromHtml("#166534");
                ws.Cell(footerRow, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                ws.Cell(footerRow, 10).Value = totalRemaining;
                ws.Cell(footerRow, 10).Style.NumberFormat.Format = "#,##0 \"VND\"";
                ws.Cell(footerRow, 10).Style.Font.Bold = true;
                ws.Cell(footerRow, 10).Style.Font.FontColor = XLColor.FromHtml("#991B1B");
                ws.Cell(footerRow, 10).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                ws.Range($"K{footerRow}:L{footerRow}").Merge();
                ws.Cell(footerRow, 11).Value = $"Tỷ lệ thu: {collectionRate:0.1}%";
                ws.Cell(footerRow, 11).Style.Font.Bold = true;
                ws.Cell(footerRow, 11).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                ws.Range(footerRow, 1, footerRow, 12).Style.Fill.BackgroundColor = XLColor.FromHtml("#F8FAFC");
                ws.Range(footerRow, 1, footerRow, 12).Style.Border.TopBorder = XLBorderStyleValues.Thin;
                ws.Range(footerRow, 1, footerRow, 12).Style.Border.BottomBorder = XLBorderStyleValues.Double;

                // --- Tự căn chỉnh độ rộng cột và chiều cao hàng ---
                ws.Columns().AdjustToContents();

                // Lưu vào memory stream
                using (var memoryStream = new MemoryStream())
                {
                    workbook.SaveAs(memoryStream);
                    return memoryStream.ToArray();
                }
            }
        }
    }
}
