/** Decoration only. Exact aliases, never class titles, seed IDs or theme defaults. */
export type SubjectIllustrationKey = 'mathematics' | 'physics' | 'chemistry' | 'biology' | 'english' | 'literature' | 'informatics' | 'natural-science' | 'default-subject';

const aliases: Record<string, SubjectIllustrationKey> = {
  math:'mathematics', maths:'mathematics', mathematics:'mathematics', toan:'mathematics', 'toan hoc':'mathematics',
  phys:'physics', phy:'physics', physics:'physics', 'vat ly':'physics', 'vat li':'physics',
  chem:'chemistry', chemistry:'chemistry', hoa:'chemistry', 'hoa hoc':'chemistry',
  bio:'biology', biology:'biology', sinh:'biology', 'sinh hoc':'biology',
  eng:'english', english:'english', 'tieng anh':'english', anh:'english', 'anh van':'english',
  lit:'literature', literature:'literature', 'ngu van':'literature', van:'literature', 'van hoc':'literature',
  it:'informatics', cs:'informatics', ict:'informatics', informatics:'informatics', 'computer science':'informatics', 'tin hoc':'informatics',
  'natural science':'natural-science', 'natural sciences':'natural-science', khtn:'natural-science', 'khoa hoc tu nhien':'natural-science',
};
function normalize(value: unknown): string {
  return typeof value === 'string' ? value.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim() : '';
}
export function getSubjectIllustrationKey(name?: string | null, code?: string | null): SubjectIllustrationKey {
  const codeKey = normalize(code);
  const nameKey = normalize(name);
  return (Object.hasOwn(aliases,codeKey) ? aliases[codeKey] : undefined)
    ?? (Object.hasOwn(aliases,nameKey) ? aliases[nameKey] : undefined)
    ?? 'default-subject';
}
