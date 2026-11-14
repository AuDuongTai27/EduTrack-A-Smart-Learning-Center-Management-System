import PageHeader from '../../../components/Common/PageHeader';
import {ScheduleWorkspace} from '../../../components/shared/schedule/ScheduleWorkspace';

export default function TeachingAssistantSchedulePage() {
  return <ScheduleWorkspace role="teaching-assistant" renderHeader={actions => <PageHeader title="Duty & TA Schedule"
    breadcrumbItems={[{label:'Dashboard',path:'/teaching-assistant/dashboard'},{label:'Duty Schedule'}]} action={actions} />} />;
}
