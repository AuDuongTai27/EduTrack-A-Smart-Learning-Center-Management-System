export type ProgressFeedbackFilter = 'all' | 'evaluation' | 'assignment';

export interface ProgressFeedback {
  assignmentTitle: string;
  quote: string;
  teacherName: string;
  statusType: 'dat' | 'chuadat' | 'canluuy' | 'chuacham';
  statusIcon: string;
  statusLabel: string;
  category?: 'evaluation' | 'assignment';
}

export function isEvaluationFeedback(fb: ProgressFeedback): boolean {
  if (fb.category) {
    return fb.category === 'evaluation';
  }
  const title = (fb.assignmentTitle || '').toLowerCase();
  return (
    title.includes('[đánh giá') ||
    title.includes('đánh giá') ||
    title.includes('nhận xét định kỳ') ||
    title.includes('ghi chú tiến độ') ||
    title.includes('[evaluation') ||
    title.includes('evaluation') ||
    title.includes('periodic review') ||
    title.includes('progress note')
  );
}

export function isAssignmentFeedback(fb: ProgressFeedback): boolean {
  if (fb.category) {
    return fb.category === 'assignment';
  }
  return !isEvaluationFeedback(fb);
}

export interface ProgressClassItem {
  id: string;
  className: string;
  subjectName: string;
  colorTheme: string;
  icon: string;
  attended: number;
  total: number;
  percentage: number;
  isCompleted?: boolean;
  feedbacks: ProgressFeedback[];
}

export const CURRENT_PROGRESS_CLASSES: ProgressClassItem[] = [
  {
    id: 'card1',
    className: '[FE-Mock] Class Math 10A',
    subjectName: 'Mathematics',
    colorTheme: 'prog-blue',
    icon: 'bi-calculator',
    attended: 12,
    total: 16,
    percentage: 75,
    feedbacks: [
      {
        assignmentTitle: '[Periodic Evaluation] Midterm Review: Solid Knowledge',
        quote: 'The student has a serious learning attitude and actively participates in discussions.',
        teacherName: 'Ms. Huong',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Praise',
        category: 'evaluation',
      },
      {
        assignmentTitle: 'Chapter 3 Assignment: Quadratic Equations',
        quote: 'Good performance, pay more attention to auxiliary variable substitution in the last problem.',
        teacherName: 'Ms. Huong',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
      {
        assignmentTitle: '15-minute Quiz: Cauchy Inequality',
        quote: 'Mastered theory, but still hesitant when encountering real-world problems.',
        teacherName: 'Ms. Huong',
        statusType: 'canluuy',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusLabel: 'Needs Attention',
        category: 'assignment',
      },
      {
        assignmentTitle: 'Week 6 Homework: Vieta\'s Formulas',
        quote: 'Complete work, clean presentation with concise solutions.',
        teacherName: 'Ms. Huong',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
    ],
  },
  {
    id: 'card2',
    className: '[FE-Mock] Class Physics 10B',
    subjectName: 'Physics',
    colorTheme: 'prog-purple',
    icon: 'bi-lightning-charge',
    attended: 14,
    total: 16,
    percentage: 88,
    feedbacks: [
      {
        assignmentTitle: '[Periodic Evaluation] Lab Experiment Skills and Teamwork',
        quote: 'Actively participates in motion experiments, needs to record data more thoroughly.',
        teacherName: 'Mr. Hung',
        statusType: 'canluuy',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusLabel: 'Needs Attention',
        category: 'evaluation',
      },
      {
        assignmentTitle: 'Assignment: Uniformly Accelerated Linear Motion',
        quote: 'Accurate calculations of acceleration and instantaneous velocity.',
        teacherName: 'Mr. Hung',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
      {
        assignmentTitle: 'Lab Report: Free Fall',
        quote: 'Experimental data has a slightly large error margin, needs more careful recording.',
        teacherName: 'Mr. Hung',
        statusType: 'canluuy',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusLabel: 'Needs Attention',
        category: 'assignment',
      },
    ],
  },
  {
    id: 'card3',
    className: '[FE-Mock] Class English B1',
    subjectName: 'English',
    colorTheme: 'prog-green',
    icon: 'bi-translate',
    attended: 10,
    total: 16,
    percentage: 63,
    feedbacks: [
      {
        assignmentTitle: '[Periodic Evaluation] Communication Reflex and Confidence Evaluation',
        quote: 'Pronunciation improved significantly, actively participates in classroom debates.',
        teacherName: 'Mr. David',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Good Progress',
        category: 'evaluation',
      },
      {
        assignmentTitle: 'Essay: The Impact of Technology on Education',
        quote: 'Good vocabulary and coherent arguments. Watch out for grammatical tenses.',
        teacherName: 'Mr. David',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
      {
        assignmentTitle: 'Listening Test: Cambridge Preliminary Exam',
        quote: 'Need more practice on Multiple Choice listening questions.',
        teacherName: 'Mr. David',
        statusType: 'chuadat',
        statusIcon: 'bi-x-circle-fill',
        statusLabel: 'Not Passed',
        category: 'assignment',
      },
    ],
  },
];

export const PAST_PROGRESS_CLASSES: ProgressClassItem[] = [
  {
    id: 'card4',
    className: 'Class Chemistry 9A',
    subjectName: 'Chemistry',
    colorTheme: 'prog-orange',
    icon: 'bi-droplet',
    attended: 20,
    total: 20,
    percentage: 100,
    isCompleted: true,
    feedbacks: [
      {
        assignmentTitle: '[Final Evaluation] Chemistry 9 Course Completion Review',
        quote: 'Student achieved the title of Outstanding Student in Chemistry for the past school year.',
        teacherName: 'Ms. Lan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Praise',
        category: 'evaluation',
      },
      {
        assignmentTitle: 'Semester 2 Exam: Acids and Bases',
        quote: 'Excellently completed all exercises and extended theory questions.',
        teacherName: 'Ms. Lan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
      {
        assignmentTitle: 'Term Paper: Inorganic Chemical Reaction Series',
        quote: 'Good equation balancing, solid grasp of chemical properties.',
        teacherName: 'Ms. Lan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
        category: 'assignment',
      },
    ],
  },
  {
    id: 'card5',
    className: 'Class Literature 9B',
    subjectName: 'Literature',
    colorTheme: 'prog-blue',
    icon: 'bi-journal-richtext',
    attended: 18,
    total: 20,
    percentage: 90,
    isCompleted: true,
    feedbacks: [
      {
        assignmentTitle: 'Literary Essay: Moonlight Poem',
        quote: 'Deep appreciation of the literary work, fluent and emotional writing.',
        teacherName: 'Mr. Tuan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Passed',
      },
    ],
  },
];

import type { AttendanceDto, ProgressNoteDto } from '../../../../BLL/models/ProgressDto';

export function mapNotesAndAttendancesToClasses(
  notes: ProgressNoteDto[],
  attendances: AttendanceDto[]
): ProgressClassItem[] {
  if ((!notes || notes.length === 0) && (!attendances || attendances.length === 0)) {
    return CURRENT_PROGRESS_CLASSES;
  }

  // Group by class
  const classMap = new Map<number, { className: string; feedbacks: ProgressFeedback[]; attended: number; total: number }>();

  attendances.forEach((att) => {
    const cid = att.classId || 1;
    if (!classMap.has(cid)) {
      classMap.set(cid, {
        className: att.className || `Class #${cid}`,
        feedbacks: [],
        attended: 0,
        total: 0,
      });
    }
    const record = classMap.get(cid)!;
    record.total += 1;
    if (att.status === 'present' || att.status === 'late') {
      record.attended += 1;
    }
  });

  notes.forEach((note) => {
    const cid = note.classId || 1;
    if (!classMap.has(cid)) {
      classMap.set(cid, {
        className: note.className || `Class #${cid}`,
        feedbacks: [],
        attended: 10,
        total: 12,
      });
    }
    const record = classMap.get(cid)!;
    const isWarning = note.noteType === 'warning' || note.noteType === 'concern' || note.noteType === 'needs_improvement';
    const isPraise = note.noteType === 'praise' || note.noteType === 'excellent';
    record.feedbacks.push({
      assignmentTitle: `[Periodic Evaluation] Progress Note`,
      quote: note.content,
      teacherName: note.authorName || 'Teacher',
      statusType: isWarning ? 'canluuy' : 'dat',
      statusIcon: isWarning ? 'bi-exclamation-triangle-fill' : 'bi-check2-all',
      statusLabel: isPraise ? 'Praise' : isWarning ? 'Needs Attention' : 'Passed',
      category: 'evaluation',
    });
  });

  const colorThemes = ['prog-blue', 'prog-purple', 'prog-orange', 'prog-green'];

  return Array.from(classMap.entries()).map(([cid, info], index) => {
    const total = info.total > 0 ? info.total : 10;
    const attended = info.attended > 0 ? info.attended : 8;
    const percentage = Math.round((attended / total) * 100);

    return {
      id: `live-card-${cid}`,
      className: info.className,
      subjectName: info.className.split('–')[0]?.trim() || 'Subject',
      colorTheme: colorThemes[index % colorThemes.length],
      icon: 'bi-calculator',
      attended,
      total,
      percentage,
      feedbacks: info.feedbacks.length > 0 ? info.feedbacks : CURRENT_PROGRESS_CLASSES[0].feedbacks,
    };
  });
}
