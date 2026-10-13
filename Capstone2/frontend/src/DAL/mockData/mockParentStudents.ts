import type { ParentStudent } from '../../BLL/models/ParentStudent';

/**
 * Dữ liệu mẫu quan hệ Phụ huynh - Học sinh bám sát DbSeeder.cs (bảng parent_students)
 * Phục vụ C-02: Tài khoản phụ huynh liên kết học sinh
 */
export const MOCK_PARENT_STUDENTS: ParentStudent[] = [
  {
    parentId: 9, // Lê Văn Nam (PAR001)
    studentId: 6, // Lê Văn An (STU001)
    relationship: 'Father',
    isPrimaryContact: true,
    createdAt: '2025-01-05T00:00:00Z',
  },
  {
    parentId: 9, // Lê Văn Nam (PAR001) - bảo hộ thêm học sinh thứ hai để demo bộ chọn nhiều con
    studentId: 7, // Phạm Thị Bích (STU002)
    relationship: 'Guardian',
    isPrimaryContact: false,
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    parentId: 10, // Phạm Thị Mai (PAR002)
    studentId: 7, // Phạm Thị Bích (STU002)
    relationship: 'Mother',
    isPrimaryContact: true,
    createdAt: '2025-01-05T00:00:00Z',
  },
];
