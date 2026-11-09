using System.Linq.Expressions;
using EduTrack.API.Models.Entities;

namespace EduTrack.API.Repositories;

public static class ClassDeletionPolicy
{
    // Keep every direct class relationship. Sessions protect attendance, assignments
    // protect submissions/evaluations, invoices protect payments, and notifications
    // protect recipients. No status filter: cancelled/dropped/paid history still counts.
    public static readonly Expression<Func<Class, bool>> HasRetainedData = c =>
        c.StudentClasses.Any() || c.ClassSessions.Any() || c.Assignments.Any()
        || c.ContentUnits.Any() || c.ProgressNotes.Any() || c.TuitionInvoices.Any()
        || c.ApprovalRequests.Any() || c.Notifications.Any()
        || c.TeacherClasses.Any() || c.TaClasses.Any() || c.ClassSchedules.Any();
}
