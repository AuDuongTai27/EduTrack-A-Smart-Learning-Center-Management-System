import { teacherIntroductions } from './landingStaticData';
import { useEffect, useRef, useState } from 'react';
import type { LandingTrainerItemDto } from '../../../BLL/models/LandingOverviewDto';
import { Icon, SectionHeading } from './LandingUI';
import { englishText, subjectInfo, specialtyLabel, teacherImageUrl } from './landingContent';

function TeacherPhoto({ teacher }: { teacher: LandingTrainerItemDto }) {
  const [failed, setFailed] = useState(false);
  const url = teacherImageUrl(teacher.avatarUrl);
  const initials = teacher.fullName.trim().split(/\s+/).slice(-2).map(n => n[0]).join('');
  return <div className="et-teacher-photo">
    {url && !failed
      ? <img src={url} loading="lazy" decoding="async" width="480" height="300" alt={teacher.fullName} onError={() => setFailed(true)}/>
      : <span className="et-initials" aria-label={`Avatar for ${teacher.fullName}`}>{initials || 'ET'}</span>}
  </div>;
}
function teacherContent(teacher: LandingTrainerItemDto) {
  const role = teacher.roleTitle === 'Teaching Assistant' ? 'Teaching Assistant' : 'Teacher';
  const subjects = teacher.subjects?.map(s => subjectInfo(s.subjectCode, s.subjectName, s.subjectId).name) ?? [];
  const specialty = specialtyLabel(teacher.specialty);
  const subject = subjects.join(', ') || (specialty.length <= 60 ? specialty : '') || 'Academic Support';
  const introduction = englishText(teacher.specialty);
  const isLabel = /^(Mathematics|Physics|Chemistry|English|Biology|Computer Science|Literature|History|Geography|Teaching Assistant|Teacher)$/i.test(introduction);
  return { role, subject, specialty, introduction: introduction && introduction !== subject && !isLabel ? introduction
    : role === 'Teaching Assistant' ? teacherIntroductions.assistant : teacherIntroductions.teacher };
}
function TeacherProfile({ teacher, onClose }: { teacher: LandingTrainerItemDto; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const content = teacherContent(teacher);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="et-workspace-dialog et-profile-dialog" aria-labelledby="teacher-profile-title" onCancel={onClose}
    onClick={e => {
      if (e.target !== dialog.current) return;
      const r = dialog.current.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose();
    }}>
    <div className="et-dialog-heading"><button className="et-menu-toggle" autoFocus aria-label="Close teacher profile" onClick={onClose}><Icon name="close"/></button></div>
    <TeacherPhoto key={teacher.avatarUrl} teacher={teacher}/>
    <h2 id="teacher-profile-title">{teacher.fullName}</h2>
    <span className="et-pill"><Icon name="user"/>{content.role}</span>
    <p className="et-profile-subject"><strong>Subject:</strong> {content.subject}</p>
    {content.specialty && content.specialty !== content.subject && <p><strong>Specialty:</strong> {content.specialty}</p>}
    <p>{content.introduction}</p>
    <a className="et-button et-primary" href="#contact" onClick={onClose}>Ask About Classes<Icon name="arrow"/></a>
  </dialog>;
}
export function TrainersSection({ trainers }: { trainers: LandingTrainerItemDto[] }) {
  const [profile, setProfile] = useState<LandingTrainerItemDto>();
  return <section id="teachers" className="et-section et-teachers"><div className="et-container">
    <SectionHeading title="Meet Our Teachers">Get to know the educators supporting our students along the way.</SectionHeading>

    <div className="et-teacher-grid">{trainers.slice(0, 3).map(teacher => {
      const content = teacherContent(teacher);
      return <article className="et-teacher-card" key={teacher.userId}>
        <TeacherPhoto key={teacher.avatarUrl} teacher={teacher}/>
        <div className="et-teacher-content"><h3>{teacher.fullName}</h3>
          <span className="et-pill"><Icon name="user"/>{content.role}</span>
          <p className="et-teacher-subject"><Icon name="book"/><span>Subject: <strong>{content.subject}</strong></span></p>
          <p className="et-teacher-intro"><Icon name="star"/><span>{content.introduction}</span></p>
          <button className="et-button et-profile-button" onClick={() => setProfile(teacher)} aria-label={`View profile for ${teacher.fullName}`}>View Profile<Icon name="arrow"/></button>
        </div>
      </article>;
    })}</div>
    {profile && <TeacherProfile teacher={profile} onClose={() => setProfile(undefined)}/>}
  </div></section>;
}
