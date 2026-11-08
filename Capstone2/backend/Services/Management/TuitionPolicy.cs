namespace EduTrack.API.Services.Management;

public static class TuitionPolicy
{
    private static readonly TimeSpan CenterOffset = TimeSpan.FromHours(7);

    public static bool IsValidAmount(decimal amount) => amount > 0 && amount <= 9999999999.99m
        && decimal.Round(amount, 2) == amount;

    // AddMonths clamps month-end dates, e.g. January 31 -> February 28/29.
    public static DateTime DueDateForCreation(DateTimeOffset createdAt) =>
        createdAt.ToOffset(CenterOffset).Date.AddMonths(1);

    public static string ResolveStatus(
        decimal amountDue,
        decimal paidAmount,
        DateTime dueDate,
        DateTimeOffset now,
        string? existingStatus = null)
    {
        // Exceptional adjustments retain their approval workflow.
        if (string.Equals(existingStatus?.Trim(), "pending_adjustment", StringComparison.OrdinalIgnoreCase))
            return "pending_adjustment";

        // Invalid legacy amounts require reconciliation, not a paid/overdue debt.
        if (!IsValidAmount(amountDue)) return "unpaid";
        if (paidAmount >= amountDue) return "paid";

        // Payment is allowed throughout the due date in the center's UTC+7 timezone.
        return now.ToOffset(CenterOffset).Date > dueDate.Date ? "overdue" : "unpaid";
    }
}
