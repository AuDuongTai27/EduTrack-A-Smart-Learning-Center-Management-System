using EduTrack.API.Services.Management;
using System.Globalization;

// No test-package dependencies or database access: execute the production policy directly.
var passed = 0;
var creationCases = new[]
{
    ("2026-11-06T08:30:00Z", "2026-12-06"),
    ("2026-12-31T08:30:00Z", "2027-01-31"),
    ("2026-01-31T08:30:00Z", "2026-02-28"),
    ("2028-01-31T08:30:00Z", "2028-02-29"),
    ("2026-03-31T08:30:00Z", "2026-04-30"),
    ("2026-11-05T17:00:00Z", "2026-12-06"),
};
foreach (var (createdAt, expected) in creationCases)
{
    Equal(expected, TuitionPolicy.DueDateForCreation(At(createdAt)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
}

var due = new DateTime(2026, 12, 6);
var statusCases = new[]
{
    ("2026-12-05T23:59:59+07:00", 0m, "unpaid", "unpaid"),
    ("2026-12-06T00:00:00+07:00", 0m, "unpaid", "unpaid"),
    ("2026-12-06T23:59:59+07:00", 0m, "unpaid", "unpaid"),
    ("2026-12-07T00:00:00+07:00", 0m, "unpaid", "overdue"),
    ("2026-12-06T23:59:59+07:00", 400_000m, "unpaid", "unpaid"),
    ("2026-12-07T00:00:00+07:00", 400_000m, "unpaid", "overdue"),
    ("2026-12-07T00:00:00+07:00", 1_000_000m, "overdue", "paid"),
    ("2026-12-07T00:00:00+07:00", 1_100_000m, "paid", "paid"),
    ("2026-11-06T10:00:00+07:00", 0m, "overdue", "unpaid"),
    ("2026-12-07T00:00:00+07:00", 0m, "paid", "overdue"),
    ("2026-12-07T00:00:00+07:00", 0m, "pending_adjustment", "pending_adjustment"),
    ("2026-12-07T00:00:00+07:00", 1_000_000m, "pending_adjustment", "pending_adjustment"),
};
foreach (var (now, paid, stored, expected) in statusCases)
{
    Equal(expected, TuitionPolicy.ResolveStatus(1_000_000m, paid, due, At(now), stored));
}
foreach (var invalidDue in new[] { 0m, -1m, 0.001m, 10000000000m })
{
    Equal("unpaid", TuitionPolicy.ResolveStatus(invalidDue, 20000000000m, due, At("2026-12-01T00:00:00Z"), "paid"));
    Equal("unpaid", TuitionPolicy.ResolveStatus(invalidDue, 20000000000m, due, At("2026-12-07T00:00:00Z"), "paid"));
}
Equal("unpaid", TuitionPolicy.ResolveStatus(1_000_000, 600_000, due, At("2026-12-01T00:00:00Z"), "paid"));

Console.WriteLine($"PASS: {passed} tuition policy checks; no database access.");

DateTimeOffset At(string text) => DateTimeOffset.Parse(text, CultureInfo.InvariantCulture);
void Equal(string expected, string actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    passed++;
}
