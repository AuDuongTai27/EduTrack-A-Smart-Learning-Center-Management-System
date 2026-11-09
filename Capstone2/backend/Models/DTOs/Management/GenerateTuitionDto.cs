using System.ComponentModel.DataAnnotations;

namespace EduTrack.API.Models.DTOs.Management;

public class GenerateTuitionDto
{
    [Required] public string Mode { get; set; } = "class";
    [Range(1, int.MaxValue)] public int GradeId { get; set; }
    public int? ClassId { get; set; }
    public int? StudentId { get; set; }
    [Range(1, 12)] public byte PeriodMonth { get; set; }
    [Range(2000, 2100)] public short PeriodYear { get; set; }
    public decimal? AmountDue { get; set; }
    public string? PreviewToken { get; set; }
}

public record GenerationRow(int ClassId, string ClassName, int? StudentId, string StudentName,
    decimal AmountDue, string Outcome, string? Reason, bool EnrollmentEligible, int? InvoiceId = null,
    decimal? MonthlyFee = null, DateTime? DueDate = null, string? DueDatePolicy = null);
public record GenerationClass(int ClassId, string ClassName, int InvoiceCount, decimal Amount,
    int AlreadyExists, int Ineligible);
public record GenerationPreview(string Mode, int GradeId, string GradeName, byte PeriodMonth, short PeriodYear,
    DateTime DueDate, string DueDatePolicy, string PreviewToken, int ClassCount, int StudentCount,
    int EligibleCount, decimal TotalAmount, int AlreadyExists, int Ineligible, int Created, int Failed,
    IReadOnlyList<GenerationClass> Classes, IReadOnlyList<GenerationRow> Rows,
    string BillingPolicy = "monthly-fixed-v1");
