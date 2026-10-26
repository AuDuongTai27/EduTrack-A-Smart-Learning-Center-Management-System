import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
    AssignmentsSection,
    ClassInfoCard,
    ParticipantsSection,
    SessionsSection
} from "../../../components/teacher/Teacher/classDetails";
import classDAL from "../../../../DAL/classDAL";
import userDAL from "../../../../DAL/userDAL";
import assignmentDAL from "../../../../DAL/assignmentDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { AssignmentDto } from "../../../../BLL/models/AssignmentDto";

export default function TeacherClassDetailsPage() {
    const { id, classId } = useParams<{ id?: string; classId?: string }>();
    const numClassId = Number(classId || id || "1");
    const targetClassId = String(numClassId);

    const [classInfo, setClassInfo] = useState<ClassDto | null>(null);
    const [students, setStudents] = useState<UserDto[]>([]);
    const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        async function fetchClassDetails() {
            try {
                setLoading(true);
                // 1. GetId: Fetch class details by ID
                const cls = await classDAL.getClassById(numClassId);

                // 2. GetAll: Fetch users for participants (filter students)
                const usersResult = await userDAL.getAllUsers();
                const studentList = usersResult.data.filter(
                    (u: UserDto) => u.roles?.includes("student") || u.userCode.startsWith("STU")
                );

                // 3. GetAll: Fetch assignments for this class
                const assignResult = await assignmentDAL.getAllAssignments();
                const filteredAssignments = assignResult.data.filter(
                    (a: AssignmentDto) => a.classId === numClassId
                );

                if (isMounted) {
                    setClassInfo(cls);
                    setStudents(studentList);
                    setAssignments(filteredAssignments.length > 0 ? filteredAssignments : assignResult.data.slice(0, 2));
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
                        teacherName="ThS. Hoàng Quốc Việt"
                        taName="Âu Dương Tài"
                    />
                    {/* Participant List */}
                    <ParticipantsSection
                        participants={students}
                        teacherName="ThS. Hoàng Quốc Việt"
                        taName="Âu Dương Tài"
                    />
                    {/* Sessions List */}
                    <SessionsSection classId={targetClassId} />
                    {/* Assignment list*/}
                    <AssignmentsSection
                        classId={targetClassId}
                        assignments={assignments}
                    />
                </>
            )}
        </>
    );
}