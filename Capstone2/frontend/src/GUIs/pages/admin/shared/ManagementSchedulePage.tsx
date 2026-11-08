import PageHeader from '../../../components/Common/PageHeader';
import { ScheduleWorkspace } from '../../../components/shared/schedule/ScheduleWorkspace';

export default function ManagementSchedulePage({role}: {role: 'center-manager' | 'admin-staff'}) {
  return <>
    <PageHeader title="Lịch học trung tâm" breadcrumbItems={[
      {label: role === 'center-manager' ? 'Center Manager' : 'Admin Staff', path: `/${role}/dashboard`},
      {label: 'Lịch học'},
    ]} />
    <ScheduleWorkspace key={role} role={role} />
  </>;
}
