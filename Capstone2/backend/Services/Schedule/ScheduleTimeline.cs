using EduTrack.API.Models.Entities;

namespace EduTrack.API.Services.Schedule;

// Date adapter shared with the existing Teacher/Student readers.
public static class ScheduleTimeline
{
    public static DateOnly Today(TimeProvider? clock = null) => DateOnly.FromDateTime((clock ?? TimeProvider.System).GetUtcNow().UtcDateTime.AddHours(7));
    public static DateOnly Monday(DateOnly date) => date.AddDays(-(((int)date.DayOfWeek + 6) % 7));
    public static DateOnly NextMonday(TimeProvider? clock = null) => Monday(Today(clock)).AddDays(7);
    public static bool Applies(ClassScheduleVersion v, DateOnly date) => v.EffectiveFrom <= date && (!v.EffectiveTo.HasValue || date < v.EffectiveTo.Value);
    public static ClassScheduleVersion? At(ClassSchedule schedule, DateOnly date)
    {
        var versions = schedule.Versions.Where(v => Applies(v, date)).ToList();
        if (versions.Count > 1) throw new ScheduleAccessException(409, "Timeline lịch cố định bị chồng khoảng; cần kiểm tra dữ liệu.");
        return versions.SingleOrDefault();
    }
    public static List<ClassScheduleVersion> At(IEnumerable<ClassSchedule> schedules, DateOnly date) =>
        schedules.Select(s => At(s, date)).OfType<ClassScheduleVersion>().OrderBy(v => v.ScheduleId).ToList();
    public static DateOnly ListingDate(DateTime start) => DateOnly.FromDateTime(start) > Today() ? DateOnly.FromDateTime(start) : Today();
    public static DateOnly PlannedDate(ClassScheduleVersion v, DateOnly week) => week.AddDays(((int)ScheduleManagementPolicy.Weekday(v.DayOfWeek) + 6) % 7);
    public static string Key(int scheduleId, DateOnly week) => $"{scheduleId}:{week:yyyy-MM-dd}";
}
