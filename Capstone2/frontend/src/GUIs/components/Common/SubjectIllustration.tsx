import { getSubjectIllustrationKey, type SubjectIllustrationKey } from './subjectIllustrationMapping';
import mathematics from '../../../assets/illustrations/subjects/mathematics.svg';
import physics from '../../../assets/illustrations/subjects/physics.svg';
import chemistry from '../../../assets/illustrations/subjects/chemistry.svg';
import biology from '../../../assets/illustrations/subjects/biology.svg';
import english from '../../../assets/illustrations/subjects/english.svg';
import literature from '../../../assets/illustrations/subjects/literature.svg';
import informatics from '../../../assets/illustrations/subjects/informatics.svg';
import defaultSubject from '../../../assets/illustrations/subjects/default-subject.svg';
import '../../../assets/css/subject-illustrations.css';

const assets: Record<SubjectIllustrationKey,string> = {mathematics,physics,chemistry,biology,english,literature,informatics,'default-subject':defaultSubject};
export function SubjectIllustration({name,code}: {name?: string | null; code?: string | null}) {
  const key = getSubjectIllustrationKey(name,code);
  return <img className="et-subject-illustration" data-subject-illustration={key} src={assets[key]} width={190} height={75} alt="" aria-hidden="true" draggable={false}/>;
}
