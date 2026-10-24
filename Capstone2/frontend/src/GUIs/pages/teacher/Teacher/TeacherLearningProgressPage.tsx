import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressTable,
  ProgressPagination,
} from "../../../components/teacher/Teacher/learningProgress";
import classDAL from "../../../../DAL/classDAL";
import userDAL from "../../../../DAL/userDAL";
import progressDAL from "../../../../DAL/progressDAL";
import assignmentDAL from "../../../../DAL/assignmentDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { AttendanceDto } from "../../../../BLL/models/ProgressDto";
import type { AssignmentDto } from "../../../../BLL/models/AssignmentDto";

export default function TeacherLearningProgressPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(1);
  const [students, setStudents] = useState<UserDto[]>([]);
  const [attendances, setAttendances] = useState<AttendanceDto[]>([]);
  const [latestAssignment, setLatestAssignment] = useState<string>("Homework 01: Quadratic Equations");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProgressData() {
      try {
        setLoading(true);
        // 1. GetAll classes
        const classesRes = await classDAL.getAllClasses();
        // 2. GetAll users (students)
        const usersRes = await userDAL.getAllUsers();
        const studentList = usersRes.data.filter(
          (u: UserDto) => u.roles?.includes("student") || u.userCode.startsWith("STU")
        );
        // 3. GetAll attendances
        const attRes = await progressDAL.getAllAttendances();
        // 4. GetAll assignments
        const asgRes = await assignmentDAL.getAllAssignments();

        if (isMounted) {
          setClasses(classesRes.data);
          if (classesRes.data.length > 0) {
            setSelectedClassId(classesRes.data[0].classId);
          }
          setStudents(studentList);
          setAttendances(attRes.data);
          if (asgRes.data.length > 0) {
            setLatestAssignment(asgRes.data[0].title);
          }
        }
      } catch (err) {
        console.error("Failed to load learning progress data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchProgressData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Learning Progress"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Learning Progress" },
        ]}
      />

      {/* Learning Progress Card */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header & Class Selector */}
        <LearningProgressHeader
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={(id) => setSelectedClassId(id)}
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading student learning progress...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table */}
            <ProgressTable
              students={students}
              attendances={attendances}
              latestAssignmentTitle={latestAssignment}
            />

            {/* Footer Pagination */}
            <ProgressPagination />
          </>
        )}
      </div>
    </>
  );
}
