import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import {
    AssignmentsSection,
    ClassInfoCard,
    ParticipantsSection,
    SessionsSection
} from "../../../components/teacher/Teacher/classDetails";

export default function TeacherClassDetailsPage() {
    const { id, classId } = useParams<{ id?: string; classId?: string }>();
    const targetClassId = classId || id || "1";

    return (
        <>
            {/* Breadcrumb & Page Title */}
            <PageHeader
                title="Class Details"
                breadcrumbItems={[
                    { label: "Dashboard", path: "/teacher/dashboard" },
                    { label: "My Classes", path: "/teacher/classes" },
                    { label: `Class #${targetClassId}` },
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
            {/* Class Header */}
            <ClassInfoCard />
            {/* Participant List */}
            <ParticipantsSection />
            {/* Sessions List */}
            <SessionsSection classId={targetClassId} />
            {/* Assignment list*/}
            <AssignmentsSection classId={targetClassId} />
        </>
    );
}