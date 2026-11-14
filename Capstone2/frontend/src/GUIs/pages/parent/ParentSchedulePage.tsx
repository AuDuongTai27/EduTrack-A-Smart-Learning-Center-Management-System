import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { StudentPageHeader } from '../../components/student/common/StudentPageHeader';
import { ScheduleWorkspace } from '../../components/shared/schedule/ScheduleWorkspace';

export function ParentSchedulePage() {
  const { selectedChild, loading: parentLoading } = useParent();

  if (parentLoading || !selectedChild) {
    return (
      <LearnerPageLoader
        title="Loading schedule..."
        message="The system is synchronizing weekly class sessions for your child."
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container">
        <StudentPageHeader
          title={`${selectedChild.name}'s Schedule`}
          subtitle={`${selectedChild.grade} · Official class sessions from valid enrollments`}
          breadcrumbs={[
            { label: 'Dashboard', href: '/parent/dashboard' },
            { label: 'Schedule' },
          ]}
        />
        <ScheduleWorkspace role="student" userId={selectedChild.id} />
      </div>
    </main>
  );
}

export default ParentSchedulePage;
