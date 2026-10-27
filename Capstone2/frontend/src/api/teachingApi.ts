const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * [Bounded Context: Teaching]
 * Tầng Network API dành riêng cho Thành viên 2 (Teacher & Teaching Assistant)
 *
 * HƯỚNG DẪN:
 * - Thành viên phụ trách Teacher & TA tự định nghĩa các hàm gọi API
 *   (POST / PUT / PATCH / DELETE hoặc GET nâng cao) tại đây.
 * - Giúp tách biệt hoàn toàn với nhóm Management và Student/Parent (0% Git Conflict).
 */
export const teachingApi = {
  // TODO [Thành viên 2 - Teacher & Teaching Assistant]:
  // Tự viết các hàm fetch gọi tới Controllers/Teaching/ của bạn tại đây.
  // Ví dụ:
  // async myCustomEndpoint(payload: any) {
  //   const res = await fetch(`${API_BASE_URL}/...`, { ... });
  //   return await res.json();
  // }
};

export default teachingApi;
