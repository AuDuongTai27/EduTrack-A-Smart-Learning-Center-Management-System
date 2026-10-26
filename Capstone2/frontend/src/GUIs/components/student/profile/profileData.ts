export interface StudentProfileData {
  fullName: string;
  dob: string;
  gender: string;
  enrollDate: string;
  address: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export const INITIAL_PROFILE: StudentProfileData = {
  fullName: '[FE-Mock] Lê Văn An',
  dob: '2010-02-14',
  gender: 'Nam',
  enrollDate: '2025-01-05',
  address: '45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
  phone: '0956 789 012',
  email: 'an.le@student.edutrack.vn',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=an',
};
