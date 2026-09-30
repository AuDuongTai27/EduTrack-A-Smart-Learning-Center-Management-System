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
  fullName: 'Nguyễn Thị Minh Anh',
  dob: '2006-03-15',
  gender: 'Nữ',
  enrollDate: '2023-09-01',
  address: '45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
  phone: '0901 234 567',
  email: 'minhanh.nguyen@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=240&h=240&fit=crop&auto=format',
};
