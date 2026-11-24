import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
    AssignmentsSection,
    ClassInfoCard,
    ParticipantsSection,
    SessionsSection
} from "../../../components/teacher/Teacher/classDetails";
import teachingDAL, { type TeachingClassItemDto } from "../../../../DAL/teachingDAL";
import type { TeachingAssignmentItemDto } from "../../../../BLL/models/teaching/TeachingAssignmentDto";

export default function TeacherClassDetailsPage() {
    const { id, classId } = useParams<{ id?: string; classId?: string }>();
    const numClassId = Number(classId || id || "1");
    const targetClassId = String(numClassId);

    const [classInfo, setClassInfo] = useState<TeachingClassItemDto | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<TeachingAssignmentItemDto[] | any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchClassDetails() {
            try {
                setLoading(true);
                // 1. Fetch class details scoped to teacher
                const cls = await teachingDAL.getClassById(numClassId);

                // 2. Fetch real students for this class via teachingDAL
                try {
                    const classStudents = await teachingDAL.getClassStudents(numClassId);
                    if (isMounted) setStudents(classStudents);
                } catch {
                    if (isMounted) setStudents([]);
                }

                // 3. Fetch real assignments for this class via teachingDAL
                try {
                    const teachingAsgs = await teachingDAL.getClassAssignments(numClassId);
                    if (isMounted) {
                        setAssignments(teachingAsgs);
                    }
                } catch {
                    if (isMounted) setAssignments([]);
                }

                if (isMounted) {
                    setClassInfo(cls);
                }
            } catch (err) {
                console.error("Failed to load class details:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchClassDetails();

        return () => {
            isMounted = false;
        };
    }, [numClassId]);

    return (
        <>
            {/* Breadcrumb & Page Title */}
            <PageHeader
                title={classInfo ? classInfo.className : `Class #${targetClassId}`}
                breadcrumbItems={[
                    { label: "Dashboard", path: "/teacher/dashboard" },
                    { label: "My Classes", path: "/teacher/classes" },
                    { label: classInfo ? classInfo.className : `Class #${targetClassId}` },
                ]}
                action={
                    <div className="d-flex align-items-center gap-2">
                        <Link
                            to="/teacher/classes"
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        >
                            <i className="bi bi-arrow-left" /> Back to Classes
                        </Link>
                    </div>
                }
            />

            {loading ? (
                <div className="card class-list-card border-0 mb-4 p-5 text-center">
                    <div className="spinner-border text-primary mx-auto mb-2" role="status" />
                    <p className="text-muted mb-0">Loading class details...</p>
                </div>
            ) : (
                <>
                    {/* Class Header */}
                    <ClassInfoCard
                        classInfo={classInfo}
                        teacherName={classInfo?.teacherName || "MSc. Hoang Quoc Viet"}
                        taName={classInfo?.taName || classInfo?.partnerName || "Au Duong Tai"}
                    />
                    {/* Participant List */}
                    <ParticipantsSection
                        classId={targetClassId}
                        participants={students}
                    />
                    {/* Sessions List */}
                    <SessionsSection classId={targetClassId} />
                    {/* Assignment list*/}
                    <AssignmentsSection
                        classId={targetClassId}
                        assignments={assignments}
                        readOnly={classInfo?.myRoleInClass === "teaching_assistant"}
                        onAssignmentDeleted={(delId) => setAssignments((prev) => prev.filter((a: any) => a.assignmentId !== delId))}
                    />
                </>
            )}
        </>
    );
}
