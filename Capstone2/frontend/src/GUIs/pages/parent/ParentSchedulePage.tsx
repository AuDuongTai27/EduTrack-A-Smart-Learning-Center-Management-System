import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { ScheduleWorkspace } from '../../components/shared/schedule/ScheduleWorkspace';

export function ParentSchedulePage() {
  const { selectedChild, loading: parentLoading } = useParent();

  if (parentLoading || !selectedChild) {
    return (
      <LearnerPageLoader
        title="Đang tải lịch học..."
        message="Hệ thống đang đồng bộ thời khóa biểu các ca học trong tuần của con."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        <StudentPageHeader
          title={`Lịch học của ${selectedChild.name}`}
          subtitle={`${selectedChild.grade} · Các phiên học chính thức thuộc đăng ký lớp hợp lệ`}
          breadcrumbs={[
            { label: 'Trang chủ', href: '/parent/dashboard' },
            { label: 'Thời khóa biểu' },
          ]}
        />
        <ScheduleWorkspace role="student" userId={selectedChild.id} />
      </div>
    </main>
  );
}

export default ParentSchedulePage;
