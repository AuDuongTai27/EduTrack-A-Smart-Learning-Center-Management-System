import type { Subject } from '../../BLL/models/Subject';

/**
 * Dữ liệu mẫu môn học bám sát DbSeeder.cs (bảng subjects)
 */
export const MOCK_SUBJECTS: Subject[] = [
  {
    subjectId: 1,
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    description: 'Core mathematical concepts, algebra, geometry, calculus and logical problem solving.',
  },
  {
    subjectId: 2,
    subjectCode: 'PHYS',
    subjectName: 'Physics',
    description: 'Mechanics, thermodynamics, electromagnetism, and modern physical foundations.',
  },
  {
    subjectId: 3,
    subjectCode: 'CHEM',
    subjectName: 'Chemistry',
    description: 'Inorganic, organic chemistry, reaction stoichiometry, and laboratory techniques.',
  },
  {
    subjectId: 4,
    subjectCode: 'ENG',
    subjectName: 'English Language',
    description: 'Grammar, reading comprehension, writing proficiency, and IELTS foundation.',
  },
];
