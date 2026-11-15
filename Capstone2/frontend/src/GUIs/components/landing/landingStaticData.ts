import type { LandingCenterInfoDto, LandingCourseItemDto, LandingSubjectItemDto, LandingTrainerItemDto } from '../../../BLL/models/LandingOverviewDto';

// Frozen demo content transcribed from docs/kan50-refinement/screenshots/actual-*.png.
// Identity/fees: db/first_script.sql. The actual snapshot takes precedence over seed state:
// only classes 2 and 3 are visible; English is taught by Hoàng Quốc Việt.
export const centerInfo: LandingCenterInfoDto = {
  centerName: 'EduTrack Smart Learning Center', slogan: '',
  address: '123 Nguyen Van Cu, District 5, Ho Chi Minh City',
  hotline: '1900 6868', email: '', academicYear: '2026 - 2027',
};
export const contactInfo = centerInfo;
export const subjects: LandingSubjectItemDto[] = [
  { subjectId: 1, subjectCode: 'MATH', subjectName: 'Mathematics', description: '', activeClassesCount: 0 },
  { subjectId: 2, subjectCode: 'PHYS', subjectName: 'Physics', description: '', activeClassesCount: 1 },
  { subjectId: 3, subjectCode: 'CHEM', subjectName: 'Chemistry', description: '', activeClassesCount: 0 },
  { subjectId: 4, subjectCode: 'ENG', subjectName: 'English', description: '', activeClassesCount: 1 },
];
// Keep only public card fields, without making up unused enrollment/like counts.
export type LandingClass = Pick<LandingCourseItemDto, 'classId' | 'className' | 'subjectId' | 'subjectCode' | 'subjectName' | 'gradeName' | 'tuitionFee' | 'teacherName' | 'imageUrl' | 'upcomingSessions'>;
export const classes: LandingClass[] = [
  { classId: 2, className: 'Class 9 - Intensive Physics', subjectId: 2, subjectCode: 'PHYS', subjectName: 'Physics',
    gradeName: 'Grade 9', tuitionFee: 1400000, teacherName: 'ThS. Huỳnh Khánh Duy',
    imageUrl: '/assets/landing/physics.webp', upcomingSessions: [] },
  { classId: 3, className: 'Class 8 - English Foundation', subjectId: 4, subjectCode: 'ENG', subjectName: 'English',
    gradeName: 'Grade 8', tuitionFee: 1800000, teacherName: 'ThS. Hoàng Quốc Việt',
    imageUrl: '/assets/landing/english.webp', upcomingSessions: [] },
];
// Specialty preserved from first_script.sql; assigned subjects follow the actual snapshot.
// Empty avatar uses the existing professional initials presentation.
export const teachers: LandingTrainerItemDto[] = [
  { userId: 3, userCode: 'TC001', fullName: 'ThS. Hoàng Quốc Việt', roleTitle: 'Teacher', specialty: 'Mathematics',
    email: '', phone: '', avatarUrl: '', subjects: [subjects[3]] },
  { userId: 4, userCode: 'TC002', fullName: 'ThS. Huỳnh Khánh Duy', roleTitle: 'Teacher', specialty: 'Physics',
    email: '', phone: '', avatarUrl: '', subjects: [subjects[1], subjects[3]] },
  { userId: 5, userCode: 'TA001', fullName: 'Âu Dương Tài', roleTitle: 'Teaching Assistant', specialty: 'Teaching Assistant',
    email: '', phone: '', avatarUrl: '', subjects: [subjects[1], subjects[3]] },
];
export const hero = {
  centerName: 'EduTrack Learning Center',
  heading: ['The Right Learning', ' Path for Greater', 'Academic Success'],
  description: 'A place to ask questions, build confidence, and move forward. Discover a learning path that brings out your potential.',
  image: '/assets/landing/hero.webp', mobileImage: '/assets/landing/hero-mobile.webp',
};
export const teacherIntroductions = {
  teacher: 'Guides students in their subject learning.',
  assistant: 'Supports students with classroom learning.',
};
export const footerLinks = [
  ['#classes', 'Find a class'], ['#contact', 'Book a consultation'], ['#faq', 'Frequently asked questions'],
] as const;
export const CLASS_PAGE_SIZE = 3;
// Pure local pagination; filtering always happens before slicing.
export function getLocalClasses(subjectId: number | null, page = 1, source: readonly LandingClass[] = classes) {
  const filtered = source.filter(item => subjectId === null || item.subjectId === subjectId);
  const items = filtered.slice(0, Math.max(1, page) * CLASS_PAGE_SIZE);
  return { items, totalCount: filtered.length, hasMore: items.length < filtered.length };
}

// User-approved illustrative statistics. Never overwrite with API counts.
export const DEMO_STATISTICS = [
  { value: '1,230+', label: 'Students', icon: 'people' },
  { value: '64+', label: 'Classes', icon: 'books' },
  { value: '24+', label: 'Teachers & Teaching Assistants', icon: 'cap' },
] as const;
export const NAV_ITEMS = [
  ['hero', 'Home'], ['about', 'About Us'], ['programs', 'Programs'],
  ['classes', 'Classes'], ['teachers', 'Teachers'], ['contact', 'Contact'],
] as const;


export const benefits = [
      ['target', 'Experienced Educators', 'Get to know the people who will guide your learning.'],
      ['books', 'Structured Learning Paths', 'Find a subject and class that fit your next step.'],
      ['chart', 'Learning Progress Tracking', 'Stay connected to your learning journey.'],
      ['people', 'Supportive Environment', 'A space to ask, explore, and build confidence.'],
    ] as const;

export const enrollmentSteps = [
    ['book', 'Find a Class', 'Explore our subjects and featured classes.'],
    ['calendar', 'Get a Consultation', 'Discuss your goals and confirm class availability.'],
    ['cap', 'Start Learning', 'Confirm the arrangements with the center and begin.'],
  ] as const;

export const faqItems = [
      ['How do I choose the right class?', 'Start with the subjects and featured classes above. Contact the center to discuss your learning goals and find a suitable option.'],
      ['Where can I find the class schedule?', 'Please contact the center to confirm the latest schedule and available places for the class you are interested in.'],
      ['What does the tuition fee include?', 'Listed fees come from the center’s class records. Contact the center to confirm the billing period, included materials, and any other costs before enrolling.'],
      ['Can I book a consultation online?', 'Use the contact details below to arrange a consultation directly with the center. This page does not submit online bookings.'],
    ] as const;
