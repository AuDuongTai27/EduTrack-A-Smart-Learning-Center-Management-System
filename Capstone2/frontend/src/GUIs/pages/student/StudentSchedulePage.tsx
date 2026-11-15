import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { ScheduleWorkspace } from '../../components/shared/schedule/ScheduleWorkspace';

export function StudentSchedulePage() {
  return <main className="main-content"><div className="content-container">
    <StudentPageHeader title="Schedule" subtitle="Official class sessions under valid enrollments"
      breadcrumbs={[{label: 'Home', href: '/student/dashboard'}, {label: 'Schedule'}]} />
    <ScheduleWorkspace />
  </div></main>;
}
export default StudentSchedulePage;
