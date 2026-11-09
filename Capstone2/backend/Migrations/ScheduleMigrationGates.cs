namespace EduTrack.API.Migrations;

// Gates run before tightening DDL. They never fill a date, choose a duplicate winner,
// change SessionId or modify Attendance. CHECK failures name the unresolved condition.
internal static class ScheduleMigrationGates
{
    internal const string CompatibleLegacyClass = """
        DROP TEMPORARY TABLE IF EXISTS edutrack_schedule_expand_gate;
        CREATE TEMPORARY TABLE edutrack_schedule_expand_gate (
          class_consistent INT NOT NULL,
          CONSTRAINT CK_schedule_legacy_class_consistent CHECK (class_consistent=1)
        );
        INSERT INTO edutrack_schedule_expand_gate SELECT IF(EXISTS(
          SELECT 1 FROM class_sessions x JOIN class_schedules s ON x.schedule_id=s.schedule_id
          WHERE x.class_id<>s.class_id),0,1);
        DROP TEMPORARY TABLE edutrack_schedule_expand_gate;
        """;

    internal const string Resolved = """
        DROP TEMPORARY TABLE IF EXISTS edutrack_schedule_contract_gate;
        CREATE TEMPORARY TABLE edutrack_schedule_contract_gate (
          legacy_resolved INT NOT NULL,
          occurrence_unique INT NOT NULL,
          timeline_valid INT NOT NULL,
          CONSTRAINT CK_schedule_legacy_resolved CHECK (legacy_resolved=1),
          CONSTRAINT CK_schedule_occurrence_unique CHECK (occurrence_unique=1),
          CONSTRAINT CK_schedule_timeline_valid CHECK (timeline_valid=1)
        );
        INSERT INTO edutrack_schedule_contract_gate
        SELECT
          IF(EXISTS(SELECT 1 FROM class_sessions WHERE schedule_id IS NULL OR schedule_version_id IS NULL OR planned_occurrence_date IS NULL OR occurrence_week_start IS NULL)
             OR EXISTS(SELECT 1 FROM class_schedules s WHERE NOT EXISTS(SELECT 1 FROM class_schedule_versions v WHERE v.schedule_id=s.schedule_id)),0,1),
          IF(EXISTS(SELECT 1 FROM class_sessions GROUP BY schedule_id,occurrence_week_start HAVING COUNT(*)>1),0,1),
          IF(EXISTS(SELECT 1 FROM class_schedule_versions a JOIN class_schedule_versions b
              ON a.schedule_id=b.schedule_id AND a.schedule_version_id<b.schedule_version_id
              WHERE (a.effective_to IS NULL OR b.effective_from<a.effective_to)
                AND (b.effective_to IS NULL OR a.effective_from<b.effective_to)),0,1);
        DROP TEMPORARY TABLE edutrack_schedule_contract_gate;
        """;

    internal const string EmptyForDowngrade = """
        DROP TEMPORARY TABLE IF EXISTS edutrack_schedule_down_gate;
        CREATE TEMPORARY TABLE edutrack_schedule_down_gate (
          empty_history INT NOT NULL,
          CONSTRAINT CK_schedule_down_requires_review CHECK (empty_history=1)
        );
        INSERT INTO edutrack_schedule_down_gate SELECT IF(
          EXISTS(SELECT 1 FROM class_schedule_versions) OR
          EXISTS(SELECT 1 FROM class_sessions WHERE planned_occurrence_date IS NOT NULL),0,1);
        DROP TEMPORARY TABLE edutrack_schedule_down_gate;
        """;
}
