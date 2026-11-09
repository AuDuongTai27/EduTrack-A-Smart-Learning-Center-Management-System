import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { ScheduleWorkspace } from '../../components/shared/schedule/ScheduleWorkspace';

export function StudentSchedulePage() {
  return <main className="main-content"><div className="content-container">
    <StudentPageHeader title="Lịch học" subtitle="Các phiên học chính thức thuộc đăng ký lớp hợp lệ"
      breadcrumbs={[{label: 'Trang chủ', href: '/student/dashboard'}, {label: 'Lịch học'}]} />
    <ScheduleWorkspace />
  </div></main>;
}
export default StudentSchedulePage;
