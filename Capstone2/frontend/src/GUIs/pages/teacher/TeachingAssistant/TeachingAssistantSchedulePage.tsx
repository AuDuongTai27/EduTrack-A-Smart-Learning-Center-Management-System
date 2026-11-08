import PageHeader from '../../../components/Common/PageHeader';
import {ScheduleWorkspace} from '../../../components/shared/schedule/ScheduleWorkspace';

export default function TeachingAssistantSchedulePage() {
  return <ScheduleWorkspace role="teaching-assistant" renderHeader={actions => <PageHeader title="Lịch Trực & Ca Trợ Giảng"
    breadcrumbItems={[{label:'Dashboard',path:'/teaching-assistant/dashboard'},{label:'Lịch trực'}]} action={actions} />} />;
}
