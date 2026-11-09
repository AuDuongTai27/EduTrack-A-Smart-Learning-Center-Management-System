import PageHeader from '../../../components/Common/PageHeader';
import {ScheduleWorkspace} from '../../../components/shared/schedule/ScheduleWorkspace';

// viet@5512b64 presentation; shared state replaces the template/default-ID fetch.
export default function TeacherSchedulePage() {
  return <ScheduleWorkspace role="teacher" renderHeader={actions => <PageHeader title="Thời Khóa Biểu Giảng Dạy"
    breadcrumbItems={[{label:'Dashboard',path:'/teacher/dashboard'},{label:'Thời khóa biểu'}]} action={actions} />} />;
}
