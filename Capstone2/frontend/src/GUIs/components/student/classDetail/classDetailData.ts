export interface ClassDetailItem {
  id: number;
  name: string;
  subject: string;
  subjectClass: string;
  grad: string;
  accent: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  room: string;
  email: string;
  phone: string;
  description: string;
  studentCount: number;
}

export interface MaterialItem {
  id: number;
  classId: number;
  type: 'PDF' | 'DOC' | 'PPT' | 'IMG';
  fileName: string;
  description: string;
  uploadDate: string;
  uploadedBy: string;
  sizeMb: number;
}

export interface AssignmentItem {
  id: number;
  classId: number;
  title: string;
  dueDate: string;
  status: 'Chưa nộp' | 'Đã nộp' | 'Quá hạn';
}

export const CLASSES_DATA: ClassDetailItem[] = [
  {
    id: 1,
    name: '[FE-Mock] Class 9 - Advanced Mathematics',
    subject: 'Mathematics',
    subjectClass: 'subject-toan',
    grad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #3B82F6 100%)',
    accent: '#2563EB',
    teacher: 'ThS. Hoàng Quốc Việt',
    teacherInitials: 'QV',
    schedule: 'Mon - Wed, 18:00 – 20:00',
    room: 'Room 201',
    email: 'viet.hoang@edutrack.edu.vn',
    phone: '0923456789',
    description: 'Grade 9 Advanced Math focuses on quadratic equations, systems of equations, Vieta\'s theorem, and advanced plane geometry. Develops logical thinking and in-depth problem-solving skills.',
    studentCount: 3,
  },
  {
    id: 2,
    name: '[FE-Mock] Class 9 - Intensive Physics',
    subject: 'Physics',
    subjectClass: 'subject-vat-ly',
    grad: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)',
    accent: '#7C3AED',
    teacher: 'ThS. Huỳnh Khánh Duy',
    teacherInitials: 'KD',
    schedule: 'Tue - Thu, 18:00 – 20:00',
    room: 'Room 202',
    email: 'duy.huynh@edutrack.edu.vn',
    phone: '0934567890',
    description: 'Grade 9 Intensive Physics covers kinematics, dynamics, Newton\'s laws, and mechanical power. Combines intuitive motion sensor experiments.',
    studentCount: 2,
  },
  {
    id: 3,
    name: 'Class 8 - English Foundation',
    subject: 'English Language',
    subjectClass: 'subject-tieng-anh',
    grad: 'linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%)',
    accent: '#059669',
    teacher: 'Lê Hoàng Nam',
    teacherInitials: 'LN',
    schedule: 'Sat, 09:00 – 11:00',
    room: 'Lab 101',
    email: 'nam.le@edutrack.edu.vn',
    phone: '0945678901',
    description: 'Foundation English consolidates grammar, vocabulary, and academic communication skills in preparation for international certification exams.',
    studentCount: 15,
  },
  {
    id: 4,
    name: 'Chemistry 11',
    subject: 'Chemistry',
    subjectClass: 'subject-hoa-hoc',
    grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)',
    accent: '#DC2626',
    teacher: 'Phạm Thu Hà',
    teacherInitials: 'PH',
    schedule: 'Mon - Wed, 16:00 – 17:30',
    room: 'Room 202',
    email: 'pt.ha@edutrack.vn',
    phone: '0934 567 890',
    description: 'Chemistry 11 follows high school curriculum with a focus on organic chemistry and redox reactions. Students practice multiple-choice questions, reaction mechanisms, and calculation skills.',
    studentCount: 10,
  },
  {
    id: 5,
    name: 'Advanced Literature',
    subject: 'Literature',
    subjectClass: 'subject-ngu-van',
    grad: 'linear-gradient(135deg, #92400E 0%, #D97706 60%, #F59E0B 100%)',
    accent: '#D97706',
    teacher: 'Đỗ Minh Khoa',
    teacherInitials: 'ĐK',
    schedule: 'Fri, 14:00 – 16:00',
    room: 'Room 101',
    email: 'dm.khoa@edutrack.vn',
    phone: '0945 678 901',
    description: 'Advanced Literature trains reading comprehension, literary analysis, and argumentative writing skills. Students are guided to build rigorous arguments and clear expression.',
    studentCount: 8,
  },
  {
    id: 6,
    name: 'General Biology',
    subject: 'Biology',
    subjectClass: 'subject-sinh-hoc',
    grad: 'linear-gradient(135deg, #164E63 0%, #0891B2 60%, #06B6D4 100%)',
    accent: '#0891B2',
    teacher: 'Vũ Thị Lan',
    teacherInitials: 'VL',
    schedule: 'Tue - Thu, 15:30 – 17:00',
    room: 'Room 204',
    email: 'vt.lan@edutrack.vn',
    phone: '0956 789 012',
    description: 'General Biology explores core concepts of cells, genetics, and evolution. Combines theory with illustrations and mind maps to support effective retention.',
    studentCount: 11,
  },
];

export const MATERIALS_DATA: MaterialItem[] = [
  // Class 9 - Advanced Mathematics
  { id: 1, classId: 1, type: 'PDF', fileName: 'Chapter 1: Quadratic Equations & Systems.pdf', description: 'Fundamental concepts of quadratic forms, discriminant analysis and Vieta theorem', uploadDate: '01/09/2026', uploadedBy: 'ThS. Hoàng Quốc Việt', sizeMb: 2.4 },
  { id: 2, classId: 1, type: 'DOC', fileName: 'Lesson 1.1: Solving Quadratic Equations.docx', description: 'Factoring methods and standard quadratic formula application', uploadDate: '05/09/2026', uploadedBy: 'ThS. Hoàng Quốc Việt', sizeMb: 1.1 },
  { id: 3, classId: 1, type: 'PDF', fileName: 'Lesson 1.2: Vieta Formulas and Applications.pdf', description: 'Relationships between roots and polynomial coefficients', uploadDate: '10/09/2026', uploadedBy: 'ThS. Hoàng Quốc Việt', sizeMb: 3.6 },
  { id: 4, classId: 1, type: 'IMG', fileName: 'Chapter 2: Plane Trigonometry Mindmap.png', description: 'Trigonometric ratios, sine and cosine laws', uploadDate: '12/09/2026', uploadedBy: 'ThS. Hoàng Quốc Việt', sizeMb: 0.8 },

  // Class 9 - Intensive Physics
  { id: 5, classId: 2, type: 'PDF', fileName: 'Chapter 1: Kinematics and Motion.pdf', description: 'Linear kinematics, speed, velocity, acceleration and vectors', uploadDate: '02/09/2026', uploadedBy: 'ThS. Huỳnh Khánh Duy', sizeMb: 1.9 },
  { id: 6, classId: 2, type: 'DOC', fileName: 'Motion Sensor Experiment Instructions.docx', description: 'Instructions for motion sensor data collection', uploadDate: '06/09/2026', uploadedBy: 'ThS. Huỳnh Khánh Duy', sizeMb: 0.9 },
  { id: 7, classId: 2, type: 'PPT', fileName: 'Slide Newton Laws & Acceleration.pptx', description: 'Newton\'s laws and equations of uniformly accelerated motion', uploadDate: '11/09/2026', uploadedBy: 'ThS. Huỳnh Khánh Duy', sizeMb: 5.2 },
];

export const ASSIGNMENTS_DATA: AssignmentItem[] = [
  // Class 9 - Advanced Mathematics
  { id: 1, classId: 1, title: 'Homework 01: Quadratic Equations Problem Set', dueDate: '14/09/2026', status: 'Đã nộp' },
  { id: 2, classId: 1, title: 'Quiz 01: Applications of Vieta Theorem', dueDate: '20/09/2026', status: 'Chưa nộp' },

  // Class 9 - Intensive Physics
];

import type { ClassDto } from '../../../../BLL/models/ClassDto';

/**
 * Chuyển đổi dữ liệu ClassDto từ API backend (.NET) sang ClassDetailItem cho giao diện chi tiết lớp học
 */
export function mapClassDtoToDetailItem(dto: ClassDto, fallbackItem?: ClassDetailItem): ClassDetailItem {
  let subjectClass = fallbackItem?.subjectClass || 'subject-toan';
  let accent = fallbackItem?.accent || '#2563EB';
  let grad = fallbackItem?.grad || 'linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #3B82F6 100%)';
  const code = (dto.subjectCode || '').toUpperCase();

  if (code.includes('PHYS') || code.includes('VAT') || code.includes('LY')) {
    subjectClass = 'subject-vat-ly';
    accent = '#7C3AED';
    grad = 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)';
  } else if (code.includes('CHEM') || code.includes('HOA')) {
    subjectClass = 'subject-hoa-hoc';
    accent = '#DC2626';
    grad = 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)';
  } else if (code.includes('ENG') || code.includes('ANH')) {
    subjectClass = 'subject-tieng-anh';
    accent = '#059669';
    grad = 'linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%)';
  } else if (code.includes('LIT') || code.includes('VAN')) {
    subjectClass = 'subject-ngu-van';
    accent = '#D97706';
    grad = 'linear-gradient(135deg, #92400E 0%, #D97706 60%, #F59E0B 100%)';
  } else if (code.includes('BIO') || code.includes('SINH')) {
    subjectClass = 'subject-sinh-hoc';
    accent = '#0891B2';
    grad = 'linear-gradient(135deg, #164E63 0%, #0891B2 60%, #06B6D4 100%)';
  }

  const startDateFormatted = dto.startDate ? new Date(dto.startDate).toLocaleDateString('en-US') : '';

  return {
    id: dto.classId,
    name: dto.className,
    subject: dto.subjectName || fallbackItem?.subject || 'Subject',
    subjectClass,
    grad,
    accent,
    teacher: fallbackItem?.teacher || 'Lead Teacher',
    teacherInitials: fallbackItem?.teacherInitials || 'T',
    schedule: fallbackItem?.schedule || 'Schedule updated by course',
    room: dto.room || fallbackItem?.room || 'Center Classroom',
    email: fallbackItem?.email || 'contact@edutrack.edu.vn',
    phone: fallbackItem?.phone || '0901234567',
    description: fallbackItem?.description || `Class ${dto.className}${startDateFormatted ? ' starts on ' + startDateFormatted : ''}. Status: ${dto.status}.`,
    studentCount: fallbackItem?.studentCount || 20,
  };
}

