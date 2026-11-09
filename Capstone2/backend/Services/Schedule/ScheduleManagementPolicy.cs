using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Services.Schedule;

public static class ScheduleManagementPolicy
{
    public static DayOfWeek Weekday(string value)
    {
        if (!Enum.TryParse<DayOfWeek>(value, true, out var day) || !Enum.IsDefined(day) ||
            !Enum.GetNames<DayOfWeek>().Any(n => n.Equals(value, StringComparison.OrdinalIgnoreCase)))
            throw new ArgumentException("Thứ phải là Monday–Sunday.");
        return day;
    }

    public static TimeSpan Time(string value)
    {
        if (!TimeSpan.TryParseExact(value, [@"hh\:mm", @"hh\:mm\:ss"], CultureInfo.InvariantCulture, out var time) ||
            time < TimeSpan.Zero || time >= TimeSpan.FromDays(1))
            throw new ArgumentException("Giờ phải có dạng HH:mm hoặc HH:mm:ss, trong cùng ngày.");
        return time;
    }

    public static DateTime Date(string? value)
    {
        if (!DateTime.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            throw new ArgumentException("Ngày học thực tế phải có dạng yyyy-MM-dd và tồn tại.");
        return date;
    }

    public static bool Overlap(TimeSpan a, TimeSpan b, TimeSpan c, TimeSpan d) => a < d && c < b;
    public static bool ValidSlot(TimeSpan start, TimeSpan end) => start >= TimeSpan.Zero && start < end && end < TimeSpan.FromDays(1);
    public static bool ValidClass(Class c) => c.Status is "active" or "upcoming" && (!c.EndDate.HasValue || c.EndDate.Value.Date >= c.StartDate.Date);
    public static bool InClass(Class c, DateTime date) => date.Date >= c.StartDate.Date && (!c.EndDate.HasValue || date.Date <= c.EndDate.Value.Date);
    public static bool SameRoom(string? a, string? b) => !string.IsNullOrWhiteSpace(a) && !string.IsNullOrWhiteSpace(b) &&
        a.Trim().Equals(b.Trim(), StringComparison.OrdinalIgnoreCase);
    public static string Hash(object value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(value))));
    public static string Version(ClassSchedule s) => Hash(new {s.ScheduleId, s.ClassId, Versions = s.Versions.OrderBy(v => v.EffectiveFrom).Select(v =>
        new {v.ScheduleVersionId, v.EffectiveFrom, v.EffectiveTo, v.DayOfWeek, v.StartTime, v.EndTime, v.Room}).ToArray()});
    public static string FormatTime(TimeSpan value) => value.ToString("c", CultureInfo.InvariantCulture);
    public static string FormatDate(DateTime value) => value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    // Two recurring slots conflict only if their class date ranges share an occurrence.
    public static bool SharesOccurrence(Class a, Class b, DayOfWeek day)
    {
        var first = a.StartDate.Date > b.StartDate.Date ? a.StartDate.Date : b.StartDate.Date;
        var last = a.EndDate?.Date ?? DateTime.MaxValue.Date;
        if (b.EndDate.HasValue && b.EndDate.Value.Date < last) last = b.EndDate.Value.Date;
        var offset = ((int)day - (int)first.DayOfWeek + 7) % 7;
        return (last - first).TotalDays >= offset;
    }
}
