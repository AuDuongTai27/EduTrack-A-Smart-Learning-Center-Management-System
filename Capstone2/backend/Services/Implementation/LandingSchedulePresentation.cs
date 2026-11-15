using System.Globalization;
using EduTrack.API.Models.DTOs.Landing;
using EduTrack.API.Models.Entities;
using EduTrack.API.Services.Schedule;

namespace EduTrack.API.Services.Implementation;

// Public read-only presentation of actual occurrences, never a synthesized weekly timetable.
public static class LandingSchedulePresentation
{
    public static List<LandingSessionDto> Upcoming(IEnumerable<ClassSession> sessions, DateTime classStart,
        DateTime? classEnd, DateTime nowVietnam)
    {
        return sessions.Where(s => s.Status == "scheduled" && s.SessionDate.Date >= classStart.Date &&
                (!classEnd.HasValue || s.SessionDate.Date <= classEnd.Value.Date) &&
                s.SessionDate.Date.Add(s.StartTime) >= nowVietnam &&
                s.StartTime >= TimeSpan.Zero && s.EndTime > s.StartTime && s.EndTime < TimeSpan.FromDays(1) &&
                // A versioned occurrence must still belong to that version's validity window.
                (!s.ScheduleVersionId.HasValue || (s.ScheduleVersion != null && s.PlannedOccurrenceDate.HasValue &&
                    ScheduleTimeline.Applies(s.ScheduleVersion, s.PlannedOccurrenceDate.Value))))
            .OrderBy(s => s.SessionDate).ThenBy(s => s.StartTime).ThenBy(s => s.SessionId)
            .Select(s => new LandingSessionDto(s.SessionDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                s.StartTime.ToString(@"hh\:mm", CultureInfo.InvariantCulture), s.EndTime.ToString(@"hh\:mm", CultureInfo.InvariantCulture)))
            .Distinct().Take(2).ToList();
    }
}
