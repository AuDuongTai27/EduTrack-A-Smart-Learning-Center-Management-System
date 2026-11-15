import type { LandingCourseItemDto, LandingSubjectItemDto } from '../../../BLL/models/LandingOverviewDto';
import { DataState, Icon, SectionHeading } from './LandingUI';
import { classTitle, gradeLabel, scheduleLines, subjectInfo } from './landingContent';
import { SubjectVisual } from './SubjectVisual';
import { useLandingClasses } from './useLandingClasses';

function ClassCard({ course: c }: { course: LandingCourseItemDto }) {
  const schedule = scheduleLines(c.upcomingSessions);
  const grade = gradeLabel(c.gradeName);
  return <article className="et-class-card"><SubjectVisual code={c.subjectCode}/><div className="et-class-content">
    <span className="et-class-subject">{subjectInfo(c.subjectCode, c.subjectName, c.subjectId).name}{grade && ` · ${grade}`}</span>
    <h3>{classTitle(c)}</h3>
    <p className="et-class-meta"><Icon name="user"/><span>{c.teacherName || 'Teacher information on request'}</span></p>
    <div className="et-class-meta et-class-schedule"><Icon name="calendar"/><div><span className="et-meta-label">Schedule:</span>{schedule.length ? schedule.map(line => <span key={line}>{line}</span>) : <span>Contact for details</span>}</div></div>
    <p className="et-class-meta"><Icon name="books"/><span><span className="et-meta-label">Tuition: </span>{Number.isFinite(c.tuitionFee) && c.tuitionFee >= 0 ? `${new Intl.NumberFormat('en-US').format(c.tuitionFee)} VND` : 'Contact for details'}</span></p>
    <div className="et-card-bottom"><a href="#contact" className="et-button et-primary">Ask About This Class<Icon name="arrow"/></a></div>
  </div></article>;
}
export function CoursesSection({ subjects, selected, select }: {
  subjects: LandingSubjectItemDto[]; selected: number | null; select: (id: number | null) => void;
}) {
  const list = useLandingClasses(selected);
  const status = list.loading ? 'loading' : list.error ? 'error' : 'ready';
  const initial = !list.items.length;
  return <section id="classes" className="et-section et-container">
    <SectionHeading title="Featured Classes">Find your subject. Take your next step with confidence.</SectionHeading>
    {subjects.length > 6 ? <div className="et-subject-select"><label htmlFor="class-subject">Filter by subject</label><select id="class-subject" value={selected ?? ''} onChange={e => select(e.target.value ? Number(e.target.value) : null)}><option value="">All Subjects</option>{subjects.map(s => <option key={s.subjectId} value={s.subjectId}>{subjectInfo(s.subjectCode, s.subjectName, s.subjectId).name}</option>)}</select></div>
      : subjects.length > 0 && <div className="et-filters" role="group" aria-label="Filter classes by subject"><button aria-pressed={selected === null} className={selected === null ? 'is-selected' : ''} onClick={() => select(null)}>All Subjects</button>{subjects.map(s => <button key={s.subjectId} aria-pressed={selected === s.subjectId} className={selected === s.subjectId ? 'is-selected' : ''} onClick={() => select(s.subjectId)}>{subjectInfo(s.subjectCode, s.subjectName, s.subjectId).name}</button>)}</div>}
    {initial && <DataState status={status} empty={!list.items.length} noun="classes" retry={list.retry}/>}
    {!initial && <><p className="et-results-count" role="status">Showing {list.items.length} of {list.totalCount} classes</p><div className="et-class-grid">{list.items.map(c => <ClassCard key={c.classId} course={c}/>)}</div>
      {/* Up to two published sessions within 60 days, Vietnam time (UTC+7).
          Active does not imply enrollment availability; tuition has no assumed billing period. */}
      {list.error ? <div className="et-load-more-error" role="alert"><p>Unable to load more classes. Your current results are still available.</p><button className="et-button et-outline" onClick={list.retry}>Try Again</button></div>
        : list.hasMore && <div className="et-centered"><button className="et-button et-outline" disabled={list.loading} onClick={list.loadMore}>{list.loading ? 'Loading Classes…' : 'Load More Classes'}</button></div>}
    </>}
  </section>;
}
