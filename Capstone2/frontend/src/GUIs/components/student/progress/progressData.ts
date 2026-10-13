export interface ProgressFeedback {
  assignmentTitle: string;
  quote: string;
  teacherName: string;
  statusType: 'dat' | 'chuadat' | 'canluuy' | 'chuacham';
  statusIcon: string;
  statusLabel: string;
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
    className: 'Lớp Toán 10A',
    subjectName: 'Toán học',
    colorTheme: 'prog-blue',
    icon: 'bi-calculator',
    attended: 12,
    total: 16,
    percentage: 75,
    feedbacks: [
      {
        assignmentTitle: 'Bài tập chương 3: Phương trình bậc hai',
        quote: 'Em làm bài khá tốt, cần chú ý phần đặt ẩn phụ hơn ở câu cuối.',
        teacherName: 'Cô Hương',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
      {
        assignmentTitle: 'Kiểm tra 15 phút: Bất đẳng thức Cauchy',
        quote: 'Nắm vững lý thuyết, tuy nhiên còn lúng túng khi gặp bài toán thực tế.',
        teacherName: 'Cô Hương',
        statusType: 'canluuy',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusLabel: 'Cần lưu ý',
      },
      {
        assignmentTitle: 'Bài tập về nhà tuần 6: Hệ thức Vi-ét',
        quote: 'Bài làm đầy đủ, trình bày sạch đẹp và có cách giải ngắn gọn.',
        teacherName: 'Cô Hương',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
    ],
  },
  {
    id: 'card2',
    className: 'Lớp Vật Lý 10B',
    subjectName: 'Vật lý',
    colorTheme: 'prog-purple',
    icon: 'bi-lightning-charge',
    attended: 14,
    total: 16,
    percentage: 88,
    feedbacks: [
      {
        assignmentTitle: 'Bài tập: Chuyển động thẳng biến đổi đều',
        quote: 'Tính toán chính xác các thông số gia tốc và vận tốc tức thời.',
        teacherName: 'Thầy Hùng',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
      {
        assignmentTitle: 'Báo cáo thực hành: Rơi tự do',
        quote: 'Số liệu thực nghiệm sai số còn hơi lớn, cần ghi chép cẩn thận hơn.',
        teacherName: 'Thầy Hùng',
        statusType: 'canluuy',
        statusIcon: 'bi-exclamation-triangle-fill',
        statusLabel: 'Cần lưu ý',
      },
    ],
  },
  {
    id: 'card3',
    className: 'Lớp Tiếng Anh B1',
    subjectName: 'Tiếng Anh',
    colorTheme: 'prog-green',
    icon: 'bi-translate',
    attended: 10,
    total: 16,
    percentage: 63,
    feedbacks: [
      {
        assignmentTitle: 'Essay: The Impact of Technology on Education',
        quote: 'Good vocabulary and coherent arguments. Watch out for grammatical tenses.',
        teacherName: 'Thầy David',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
      {
        assignmentTitle: 'Listening Test: Cambridge Preliminary Exam',
        quote: 'Cần luyện thêm phần nghe dạng câu hỏi Multiple Choice.',
        teacherName: 'Thầy David',
        statusType: 'chuadat',
        statusIcon: 'bi-x-circle-fill',
        statusLabel: 'Chưa đạt',
      },
    ],
  },
];

export const PAST_PROGRESS_CLASSES: ProgressClassItem[] = [
  {
    id: 'card4',
    className: 'Lớp Hóa học 9A',
    subjectName: 'Hóa học',
    colorTheme: 'prog-orange',
    icon: 'bi-droplet',
    attended: 20,
    total: 20,
    percentage: 100,
    isCompleted: true,
    feedbacks: [
      {
        assignmentTitle: 'Kiểm tra học kỳ 2: Axit và Bazơ',
        quote: 'Hoàn thành xuất sắc toàn bộ bài tập và phần lý thuyết mở rộng.',
        teacherName: 'Cô Lan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
      {
        assignmentTitle: 'Bài thu hoạch: Chuỗi phản ứng Hóa vô cơ',
        quote: 'Cân bằng phương trình tốt, nắm chắc tính chất hóa học.',
        teacherName: 'Cô Lan',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
    ],
  },
  {
    id: 'card5',
    className: 'Lớp Ngữ Văn 9B',
    subjectName: 'Ngữ Văn',
    colorTheme: 'prog-blue',
    icon: 'bi-journal-richtext',
    attended: 18,
    total: 20,
    percentage: 90,
    isCompleted: true,
    feedbacks: [
      {
        assignmentTitle: 'Nghị luận văn học: Bài thơ Ánh trăng',
        quote: 'Cảm thụ tác phẩm sâu sắc, lời văn mượt mà và cảm xúc.',
        teacherName: 'Thầy Tuấn',
        statusType: 'dat',
        statusIcon: 'bi-check2-all',
        statusLabel: 'Đạt',
      },
    ],
  },
];
