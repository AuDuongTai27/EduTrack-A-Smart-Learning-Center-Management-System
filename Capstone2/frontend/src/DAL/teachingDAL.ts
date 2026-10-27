import { teachingApi } from '../api/teachingApi';

/**
 * [Bounded Context: Teaching]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 2 (Teacher & Teaching Assistant)
 *
 * HƯỚNG DẪN:
 * - Gọi các hàm từ `teachingApi` và xử lý dữ liệu / fallback cho các trang thuộc
 *   `src/GUIs/pages/teacher/Teacher/` và `src/GUIs/pages/teacher/TeachingAssistant/`.
 */
export const teachingDAL = {
  // TODO [Thành viên 2 - Teacher & Teaching Assistant]:
  // Tự viết các hàm điều phối dữ liệu gọi xuống `teachingApi` tại đây.
};

export default teachingDAL;
