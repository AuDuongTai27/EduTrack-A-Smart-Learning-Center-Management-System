import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  LearningProgressHeader,
  ProgressTable,
  ProgressPagination,
} from "../../../components/teacher/TeachingAssistant/learningProgress";
import classDAL from "../../../../DAL/classDAL";
import userDAL from "../../../../DAL/userDAL";
import progressDAL from "../../../../DAL/progressDAL";
import assignmentDAL from "../../../../DAL/assignmentDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { AttendanceDto } from "../../../../BLL/models/ProgressDto";
import type { AssignmentDto } from "../../../../BLL/models/AssignmentDto";

export default function TeachingAssistantLearningProgressPage() {
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
        console.error("Failed to load TA learning progress data:", err);
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
        title="Tiến Độ Học Tập &amp; Điểm Danh Học Viên"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Tiến độ học tập" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải tiến độ học tập và tình hình làm bài của học sinh...</span>
        </div>
      )}

      {/* Learning Progress Card */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header & Class Selector */}
        <LearningProgressHeader
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={(id) => setSelectedClassId(id)}
        />

        {/* Toolbar & Table */}
        <ProgressTable
          students={students}
          attendances={attendances}
          latestAssignmentTitle={latestAssignment}
        />

        {/* Footer Pagination */}
        <ProgressPagination />
      </div>
    </>
  );
}
