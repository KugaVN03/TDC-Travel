import { Faculty, FacultyId } from '../types/game';

export const FACULTIES: Faculty[] = [
  {
    id: 'cntt',
    name: 'Khoa Công nghệ thông tin',
    shortName: 'CNTT',
    color: '#2FA8F0',
    badgeColor: '#E1F4FD',
  },
  {
    id: 'dien_dt',
    name: 'Khoa Điện – Điện tử',
    shortName: 'Điện – ĐT',
    color: '#FFAA1F',
    badgeColor: '#FFF5DC',
  },
  {
    id: 'co_khi_oto',
    name: 'Khoa Cơ khí Ô tô',
    shortName: 'CK Ô tô',
    color: '#FF6F59',
    badgeColor: '#FFECE8',
  },
  {
    id: 'co_khi_ctm',
    name: 'Khoa Cơ khí Chế tạo máy',
    shortName: 'CK CTM',
    color: '#6F8CF0',
    badgeColor: '#EAF0FF',
  },
  {
    id: 'kinh_te',
    name: 'Khoa Kinh tế – Quản trị',
    shortName: 'Kinh tế',
    color: '#38B865',
    badgeColor: '#E8F8E3',
  },
  {
    id: 'ngoai_ngu',
    name: 'Khoa Ngoại ngữ',
    shortName: 'Ngoại ngữ',
    color: '#9B6BFF',
    badgeColor: '#F3ECFF',
  },
  {
    id: 'du_lich',
    name: 'Khoa Du lịch – Nhà hàng',
    shortName: 'Du lịch',
    color: '#FF6FA5',
    badgeColor: '#FFEBF3',
  },
  {
    id: 'khac',
    name: 'Khoa / Bộ môn Khác',
    shortName: 'TDC',
    color: '#00AEEF',
    badgeColor: '#E1F6FF',
  },
];

export function getFacultyById(id?: FacultyId | string): Faculty {
  return FACULTIES.find((f) => f.id === id) || FACULTIES[0];
}
