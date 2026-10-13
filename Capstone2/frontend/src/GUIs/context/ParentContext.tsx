import React, { createContext, useContext, useState } from 'react';

/**
 * Interface đại diện cho hồ sơ học sinh được liên kết với phụ huynh
 */
export interface ChildClassItem {
  id: number;
  name: string;
  subject: string;
  subjectClass: string;
  badge: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  room: string;
  attendedLessons: number;
  totalLessons: number;
  notes: string;
}

export interface ChildStudent {
  id: number;
  code: string;            // Mã học sinh tại trung tâm (VD: HS-2026-001)
  name: string;            // Họ và tên học sinh
  avatar: string;          // Ký tự avatar (VD: MA)
  grade: string;           // Khối lớp (VD: Lớp 11)
  school: string;          // Trường đang học
  dob: string;             // Ngày sinh
  phone?: string;          // SĐT học sinh (nếu có)
  classesCount: number;    // Số lớp đang theo học
  attendanceRate: number;  // Tỷ lệ chuyên cần (%)
  averageScore: number;    // Điểm trung bình đánh giá
  unpaidAmount: number;    // Số tiền học phí còn nợ
  classes: ChildClassItem[];
}

/**
 * Interface cho phiếu gửi yêu cầu liên kết tới trung tâm (Solution 2)
 */
export interface PendingLinkRequest {
  id: string;
  studentName: string;
  dob: string;
  school: string;
  parentPhone: string;
  note?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ParentContextType {
  // Danh sách các con đã liên kết
  childrenList: ChildStudent[];
  // Học sinh đang được chọn hiển thị
  selectedChildId: number | null;
  selectedChild: ChildStudent | null;
  // Danh sách yêu cầu gửi tới trung tâm chờ duyệt
  pendingRequests: PendingLinkRequest[];

  // Hàm chuyển đổi học sinh
  setSelectedChildId: (id: number | null) => void;

  /**
   * SOLUTION 1: Liên kết nhanh qua Mã học sinh (Student Code) + Ngày sinh
   * Frontend: Xác thực định dạng, kiểm tra trùng lặp và thêm ngay vào state
   * Backend tương lai: Gọi POST /api/parents/link-by-code { studentCode, dob, phone }
   */
  linkStudentByCode: (
    code: string,
    dob: string,
    phone?: string
  ) => { success: boolean; message: string; student?: ChildStudent };

  /**
   * SOLUTION 2: Gửi phiếu yêu cầu hỗ trợ tới Giáo vụ Trung tâm
   * Frontend: Tạo Ticket ID, lưu vào pendingRequests để theo dõi
   * Backend tương lai: Gọi POST /api/parents/link-requests { fullName, dob, school, parentPhone, note }
   */
  requestLinkStudent: (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ) => { success: boolean; ticketId: string; message: string };

  // Tiện ích hỗ trợ demo / kiểm thử giao diện
  setDemoEmptyState: () => void;
  resetDemoChildren: () => void;
}

// Dữ liệu mẫu ban đầu gồm 2 học sinh
const INITIAL_CHILDREN: ChildStudent[] = [
  {
    id: 1,
    code: 'HS-2026-001',
    name: 'Nguyễn Minh Anh',
    avatar: 'MA',
    grade: 'Lớp 11',
    school: 'THPT Chuyên Nguyễn Huệ',
    dob: '15/08/2009',
    phone: '0912 345 678',
    classesCount: 6,
    attendanceRate: 96,
    averageScore: 8.8,
    unpaidAmount: 2400000,
    classes: [
      {
        id: 1,
        name: 'Toán Nâng Cao – Toán',
        subject: 'Toán Học',
        subjectClass: 'subject-toan',
        badge: 'Toán',
        teacher: 'Nguyễn Văn An',
        teacherInitials: 'NA',
        schedule: 'Thứ 2 - 4 - 6, 15:00 – 16:30',
        room: 'Phòng P.201',
        attendedLessons: 18,
        totalLessons: 20,
        notes: 'Tiếp thu tốt, tích cực phát biểu trong các buổi luyện đề.',
      },
      {
        id: 2,
        name: 'Vật Lý Cơ Bản – Vật Lý',
        subject: 'Vật Lý',
        subjectClass: 'subject-vat-ly',
        badge: 'Vật Lý',
        teacher: 'Trần Thị Mai',
        teacherInitials: 'TM',
        schedule: 'Thứ 3 - 5, 17:00 – 18:30',
        room: 'Phòng P.103',
        attendedLessons: 15,
        totalLessons: 16,
        notes: 'Nắm chắc kiến thức quang hình học, cần cẩn thận hơn khi giải bài tập điện từ.',
      },
      {
        id: 3,
        name: 'Tiếng Anh Giao Tiếp – Tiếng Anh',
        subject: 'Tiếng Anh',
        subjectClass: 'subject-tieng-anh',
        badge: 'Tiếng Anh',
        teacher: 'Lê Hoàng Nam',
        teacherInitials: 'LN',
        schedule: 'Thứ 7, 09:00 – 11:00',
        room: 'Phòng P.305',
        attendedLessons: 12,
        totalLessons: 12,
        notes: 'Phát âm chuẩn, tự tin giao tiếp theo nhóm.',
      },
      {
        id: 4,
        name: 'Hóa Học 11 – Hóa Học',
        subject: 'Hóa Học',
        subjectClass: 'subject-hoa-hoc',
        badge: 'Hóa Học',
        teacher: 'Phạm Thu Hà',
        teacherInitials: 'PH',
        schedule: 'Thứ 2 - 4, 16:00 – 17:30',
        room: 'Phòng P.202',
        attendedLessons: 17,
        totalLessons: 18,
        notes: 'Thực hành thí nghiệm chu đáo, bài tập hóa hữu cơ đạt điểm cao.',
      },
      {
        id: 5,
        name: 'Ngữ Văn Nâng Cao – Ngữ Văn',
        subject: 'Ngữ Văn',
        subjectClass: 'subject-ngu-van',
        badge: 'Ngữ Văn',
        teacher: 'Đỗ Minh Khoa',
        teacherInitials: 'ĐK',
        schedule: 'Thứ 6, 14:00 – 16:00',
        room: 'Phòng P.101',
        attendedLessons: 11,
        totalLessons: 12,
        notes: 'Khả năng cảm thụ văn học tốt, hành văn mạch lạc.',
      },
      {
        id: 6,
        name: 'Sinh Học Đại Cương – Sinh Học',
        subject: 'Sinh Học',
        subjectClass: 'subject-sinh-hoc',
        badge: 'Sinh Học',
        teacher: 'Vũ Thị Lan',
        teacherInitials: 'VL',
        schedule: 'Thứ 3 - 5, 15:30 – 17:00',
        room: 'Phòng P.204',
        attendedLessons: 13,
        totalLessons: 14,
        notes: 'Hoàn thành đầy đủ các chuyên đề di truyền học.',
      },
    ],
  },
  {
    id: 2,
    code: 'HS-2026-088',
    name: 'Nguyễn Hải Đăng',
    avatar: 'HĐ',
    grade: 'Lớp 8',
    school: 'THCS Lê Quý Đôn',
    dob: '20/11/2012',
    phone: '',
    classesCount: 3,
    attendanceRate: 98,
    averageScore: 9.1,
    unpaidAmount: 1200000,
    classes: [
      {
        id: 101,
        name: 'Toán 8 Cơ Bản & Nâng Cao',
        subject: 'Toán Học',
        subjectClass: 'subject-toan',
        badge: 'Toán',
        teacher: 'Nguyễn Văn An',
        teacherInitials: 'NA',
        schedule: 'Thứ 3 - 5, 17:30 – 19:00',
        room: 'Phòng P.102',
        attendedLessons: 16,
        totalLessons: 16,
        notes: 'Tư duy hình học không gian xuất sắc, chuyên cần 100%.',
      },
      {
        id: 102,
        name: 'Tiếng Anh THCS – Flyers/Kỳ thi HSG',
        subject: 'Tiếng Anh',
        subjectClass: 'subject-tieng-anh',
        badge: 'Tiếng Anh',
        teacher: 'Lê Hoàng Nam',
        teacherInitials: 'LN',
        schedule: 'Thứ 7 - CN, 08:00 – 09:30',
        room: 'Phòng P.301',
        attendedLessons: 14,
        totalLessons: 15,
        notes: 'Từ vựng phong phú, ngữ pháp rất chắc chắn.',
      },
      {
        id: 103,
        name: 'Khoa Học Tự Nhiên 8 (Lý – Hóa)',
        subject: 'Vật Lý',
        subjectClass: 'subject-vat-ly',
        badge: 'Vật Lý',
        teacher: 'Trần Thị Mai',
        teacherInitials: 'TM',
        schedule: 'Thứ 6, 17:30 – 19:30',
        room: 'Phòng P.203',
        attendedLessons: 11,
        totalLessons: 11,
        notes: 'Ham học hỏi, thích làm các thí nghiệm trực quan.',
      },
    ],
  },
];

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export const ParentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<ChildStudent[]>(INITIAL_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(1);
  const [pendingRequests, setPendingRequests] = useState<PendingLinkRequest[]>([]);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId) || null;

  /**
   * =========================================================================
   * SOLUTION 1: LIÊN KẾT NHANH BẰNG MÃ HỌC SINH (Student Code)
   * -------------------------------------------------------------------------
   * CÁCH HOẠT ĐỘNG:
   * 1. Phụ huynh nhập Mã học sinh (đã có trên Thẻ học sinh hoặc biên lai đóng phí)
   *    kèm Ngày tháng năm sinh của học sinh để đối chiếu thông tin an toàn.
   * 2. Hệ thống kiểm tra: Nếu mã chưa từng được liên kết, tạo hồ sơ học sinh
   *    và push ngay vào state `childrenList`.
   * 3. Tự động set `selectedChildId` sang học sinh mới để phụ huynh xem ngay lập tức.
   * 4. Ghi chú Backend tương lai: API POST /api/parent/link-student { code, dob }
   *    sẽ tra cứu bảng `parent_students` & `users` (role Student) rồi tạo quan hệ.
   * =========================================================================
   */
  const linkStudentByCode = (
    code: string,
    dob: string,
    phone?: string
  ): { success: boolean; message: string; student?: ChildStudent } => {
    const trimmedCode = code.trim().toUpperCase();

    // Kiểm tra xem đã liên kết mã này chưa
    const existing = childrenList.find(
      (c) => c.code.toUpperCase() === trimmedCode
    );
    if (existing) {
      return {
        success: false,
        message: `Học sinh với mã ${trimmedCode} đã có trong danh sách theo dõi của bạn.`,
      };
    }

    // Giả lập danh mục học sinh tìm thấy từ hệ thống trung tâm
    const initials = 'ĐK';
    const newStudent: ChildStudent = {
      id: Date.now(),
      code: trimmedCode,
      name: 'Nguyễn Đăng Khoa',
      avatar: initials,
      grade: 'Lớp 10',
      school: 'THPT Kim Liên',
      dob: dob || '10/10/2010',
      phone: phone || '',
      classesCount: 2,
      attendanceRate: 100,
      averageScore: 8.5,
      unpaidAmount: 1800000,
      classes: [
        {
          id: 201,
          name: 'Toán 10 Chuyên Đề Đại Số',
          subject: 'Toán Học',
          subjectClass: 'subject-toan',
          badge: 'Toán',
          teacher: 'Nguyễn Văn An',
          teacherInitials: 'NA',
          schedule: 'Thứ 2 - 5, 18:00 – 19:30',
          room: 'Phòng P.201',
          attendedLessons: 8,
          totalLessons: 8,
          notes: 'Mới nhập học, hòa nhập lớp nhanh chóng.',
        },
        {
          id: 202,
          name: 'Tiếng Anh IELTS Foundation',
          subject: 'Tiếng Anh',
          subjectClass: 'subject-tieng-anh',
          badge: 'Tiếng Anh',
          teacher: 'Lê Hoàng Nam',
          teacherInitials: 'LN',
          schedule: 'Thứ 4 - 6, 18:00 – 19:30',
          room: 'Phòng P.302',
          attendedLessons: 7,
          totalLessons: 8,
          notes: 'Kỹ năng Listening và Reading tiến bộ rõ rệt.',
        },
      ],
    };

    setChildrenList((prev) => [...prev, newStudent]);
    setSelectedChildId(newStudent.id);

    return {
      success: true,
      message: `Liên kết thành công học sinh ${newStudent.name} (${newStudent.code})!`,
      student: newStudent,
    };
  };

  /**
   * =========================================================================
   * SOLUTION 2: GỬI PHIẾU YÊU CẦU HỖ TRỢ LIÊN KẾT TỚI TRUNG TÂM
   * -------------------------------------------------------------------------
   * CÁCH HOẠT ĐỘNG:
   * 1. Áp dụng khi phụ huynh không nhớ Mã học sinh hoặc chưa được cấp mã.
   * 2. Phụ huynh điền form gồm: Tên con, Ngày sinh, Trường học, SĐT liên hệ, Ghi chú.
   * 3. Hệ thống sinh mã Ticket (#REQ-xxxx) và lưu vào danh sách `pendingRequests`.
   * 4. Giao diện hiển thị thông báo thành công: "Yêu cầu đã được chuyển tới bộ phận
   *    Giáo vụ EduTrack. Chúng tôi sẽ đối soát hồ sơ và liên kết trong vòng 24h làm việc."
   * 5. Ghi chú Backend tương lai: API POST /api/parent/link-requests tạo 1 bản ghi
   *    trong bảng `approval_requests` với request_type = 'feedback' hoặc 'parent_link'.
   * =========================================================================
   */
  const requestLinkStudent = (
    studentName: string,
    dob: string,
    school: string,
    parentPhone: string,
    note?: string
  ): { success: boolean; ticketId: string; message: string } => {
    const randomTicketNumber = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `REQ-${randomTicketNumber}`;

    const newRequest: PendingLinkRequest = {
      id: ticketId,
      studentName: studentName.trim(),
      dob: dob.trim(),
      school: school.trim(),
      parentPhone: parentPhone.trim(),
      note: note?.trim(),
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
    };

    setPendingRequests((prev) => [newRequest, ...prev]);

    return {
      success: true,
      ticketId,
      message: `Đã gửi yêu cầu liên kết hồ sơ cho học sinh ${studentName}. Mã phiếu: #${ticketId}.`,
    };
  };

  // Hỗ trợ demo: Xóa toàn bộ học sinh để kiểm tra Empty State
  const setDemoEmptyState = () => {
    setChildrenList([]);
    setSelectedChildId(null);
  };

  // Hỗ trợ demo: Khôi phục lại 2 học sinh mẫu ban đầu
  const resetDemoChildren = () => {
    setChildrenList(INITIAL_CHILDREN);
    setSelectedChildId(1);
  };

  return (
    <ParentContext.Provider
      value={{
        childrenList,
        selectedChildId,
        selectedChild,
        pendingRequests,
        setSelectedChildId,
        linkStudentByCode,
        requestLinkStudent,
        setDemoEmptyState,
        resetDemoChildren,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = (): ParentContextType => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
};

export default ParentContext;
