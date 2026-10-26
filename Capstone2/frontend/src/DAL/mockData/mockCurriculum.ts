import type { ContentUnit } from '../../BLL/models/ContentUnit';
import type { Assignment } from '../../BLL/models/Assignment';
import type { Submission } from '../../BLL/models/Submission';
import type { AiEvaluation } from '../../BLL/models/AiEvaluation';

/**
 * Dữ liệu mẫu bài giảng/chương học bám sát DbSeeder.cs (bảng content_units)
 */
export const MOCK_CONTENT_UNITS: ContentUnit[] = [
  {
    contentUnitId: 1,
    classId: 1,
    parentUnitId: null,
    title: 'Chapter 1: Quadratic Equations & Systems',
    unitType: 'chapter',
    description: 'Fundamental concepts of quadratic forms, discriminant analysis and Vieta theorem',
    orderIndex: 1,
  },
  {
    contentUnitId: 2,
    classId: 1,
    parentUnitId: 1,
    title: 'Lesson 1.1: Solving Quadratic Equations',
    unitType: 'lesson',
    description: 'Factoring methods and standard quadratic formula application',
    orderIndex: 1,
  },
  {
    contentUnitId: 3,
    classId: 1,
    parentUnitId: 1,
    title: 'Lesson 1.2: Vieta Formulas and Applications',
    unitType: 'lesson',
    description: 'Relationships between roots and polynomial coefficients',
    orderIndex: 2,
  },
  {
    contentUnitId: 4,
    classId: 1,
    parentUnitId: null,
    title: 'Chapter 2: Plane Trigonometry',
    unitType: 'chapter',
    description: 'Trigonometric ratios, sine and cosine laws',
    orderIndex: 2,
  },
  {
    contentUnitId: 5,
    classId: 2,
    parentUnitId: null,
    title: 'Chapter 1: Kinematics and Motion',
    unitType: 'chapter',
    description: 'Linear kinematics, speed, velocity, acceleration and vectors',
    orderIndex: 1,
  },
];

/**
 * Dữ liệu mẫu bài tập & đề kiểm tra bám sát DbSeeder.cs (bảng assignments)
 */
export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    assignmentId: 1,
    contentUnitId: 2,
    classId: 1,
    title: '[FE-Mock] Homework 01: Quadratic Equations Problem Set',
    description: 'Complete problems 1 to 15 from textbook page 42. Show all calculation steps.',
    fileUrl: 'https://storage.edutrack.edu.vn/assignments/hw01_math9.pdf',
    dueDate: '2026-09-14T23:59:00Z',
    maxScore: 10.0,
    createdBy: 3,
    answerKeyText: 'Đáp án: Câu 1 x={2,3}; Câu 2 x={-1,5}; Câu 3 vô nghiệm; Câu 4 delta=16, x=4; Câu 5 x=0 hoặc x=2.',
    answerKeyFileUrl: null,
    rubricJson: JSON.stringify([
      { id: 'crit_1', name: 'Tính chính xác của kết quả', maxScore: 5.0, weight: 0.5, description: 'Đúng kết quả các bài toán biến đổi' },
      { id: 'crit_2', name: 'Phương pháp giải & Lập luận', maxScore: 3.0, weight: 0.3, description: 'Áp dụng đúng định lý Viète và công thức nghiệm' },
      { id: 'crit_3', name: 'Trình bày & Ký hiệu', maxScore: 2.0, weight: 0.2, description: 'Các bước biến đổi rõ ràng, sạch sẽ' },
    ]),
    isAiGradingEnabled: true,
  },
  {
    assignmentId: 2,
    contentUnitId: 3,
    classId: 1,
    title: '[FE-Mock] Quiz 01: Applications of Vieta Theorem',
    description: 'Solve 5 advanced theorem problems regarding symmetric expressions.',
    fileUrl: 'https://storage.edutrack.edu.vn/assignments/quiz01_math9.pdf',
    dueDate: '2026-09-20T23:59:00Z',
    maxScore: 10.0,
    createdBy: 3,
    answerKeyText: 'Đáp án biểu thức đối xứng x1^2 + x2^2 = S^2 - 2P.',
    answerKeyFileUrl: null,
    rubricJson: JSON.stringify([
      { id: 'crit_1', name: 'Tính chính xác', maxScore: 6.0, weight: 0.6 },
      { id: 'crit_2', name: 'Lập luận logic', maxScore: 4.0, weight: 0.4 },
    ]),
    isAiGradingEnabled: true,
  },
  {
    assignmentId: 3,
    contentUnitId: 5,
    classId: 2,
    title: '[FE-Mock] Lab Report: Uniform Acceleration Experiment',
    description: 'Analyze data captured from motion sensor track.',
    fileUrl: 'https://storage.edutrack.edu.vn/assignments/lab01_phys9.pdf',
    dueDate: '2026-09-18T23:59:00Z',
    maxScore: 10.0,
    createdBy: 4,
    answerKeyText: 'Báo cáo tính toán gia tốc a = 2.45 m/s^2, sai số không quá 5%.',
    answerKeyFileUrl: null,
    rubricJson: JSON.stringify([
      { id: 'crit_1', name: 'Số liệu thí nghiệm', maxScore: 5.0, weight: 0.5 },
      { id: 'crit_2', name: 'Phân tích đồ thị', maxScore: 5.0, weight: 0.5 },
    ]),
    isAiGradingEnabled: true,
  },
];

/**
 * Dữ liệu mẫu bài nộp của học sinh bám sát DbSeeder.cs (bảng submissions)
 */
export const MOCK_SUBMISSIONS: Submission[] = [
  {
    submissionId: 1,
    assignmentId: 1,
    studentId: 6, // STU001 - An
    fileUrl: 'https://storage.edutrack.edu.vn/submissions/stu001_hw01.pdf',
    submittedAt: '2026-09-13T20:30:00Z',
    score: 9.5,
    feedback: 'Excellent work! Detailed derivations and clean presentation.',
    aiScore: 9.5,
    aiFeedbackJson: JSON.stringify({
      suggestedScore: 9.5,
      criteriaScores: [
        { criterionId: 'crit_1', score: 5.0 },
        { criterionId: 'crit_2', score: 2.8 },
        { criterionId: 'crit_3', score: 1.7 },
      ],
    }),
    status: 'graded',
    gradedBy: 3,
  },
  {
    submissionId: 2,
    assignmentId: 1,
    studentId: 7, // STU002 - Bích
    fileUrl: 'https://storage.edutrack.edu.vn/submissions/stu002_hw01.pdf',
    submittedAt: '2026-09-14T22:15:00Z',
    score: 8.0,
    feedback: 'Good attempt. Check signs in problem 12.',
    aiScore: 7.8,
    aiFeedbackJson: JSON.stringify({
      suggestedScore: 7.8,
      criteriaScores: [
        { criterionId: 'crit_1', score: 4.0 },
        { criterionId: 'crit_2', score: 2.3 },
        { criterionId: 'crit_3', score: 1.5 },
      ],
    }),
    status: 'graded',
    gradedBy: 5,
  },
  {
    submissionId: 3,
    assignmentId: 1,
    studentId: 8, // STU003 - Cường
    fileUrl: 'https://storage.edutrack.edu.vn/submissions/stu003_hw01.pdf',
    submittedAt: '2026-09-15T08:10:00Z',
    score: null,
    feedback: null,
    aiScore: null,
    aiFeedbackJson: null,
    status: 'late',
    gradedBy: null,
  },
];

/**
 * Dữ liệu mẫu kết quả chấm điểm AI bám sát DbSeeder.cs (bảng ai_evaluations)
 */
export const MOCK_AI_EVALUATIONS: AiEvaluation[] = [
  {
    evaluationId: 1,
    submissionId: 1,
    requestedBy: 3,
    aiScore: 9.5,
    aiFeedback: 'High accuracy across all 15 solutions. Clear step-by-step logic. Minor syntax abbreviation in problem 8.',
    rawResponse: JSON.stringify({ model: 'gemini-1.5-flash', score: 9.5, confidence: 0.96 }),
    status: 'SUCCESS',
    createdAt: '2026-09-13T20:35:00Z',
  },
  {
    evaluationId: 2,
    submissionId: 2,
    requestedBy: 3,
    aiScore: 7.8,
    aiFeedback: 'Correct methodology for items 1-11. Calculation sign mistake detected in item 12.',
    rawResponse: JSON.stringify({ model: 'gemini-1.5-flash', score: 7.8, confidence: 0.92 }),
    status: 'SUCCESS',
    createdAt: '2026-09-14T22:20:00Z',
  },
];
