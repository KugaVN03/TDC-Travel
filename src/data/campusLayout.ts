import { Quest } from '../types/game';

export const TDC_LOGO =
  'M320.5,313.7c1.2-3.6,1.2-6.6-0.1-8.9c-1.3-2.3-4.1-3.5-8.2-3.5c-3.9,0-7.1,0.8-10.1,3.1 c-2.3-2.1-5.7-3.3-10.4-3.3l-36.5-0.5l-2.4,6.3l8.7,0.1l-9.7,27.4l9.3,0.1l9.7-27.4l8.2,0.1l-9.7,27.4l11.6,0.1 c4.1,0.1,7.8-1,11-3c1.3,3,4.3,4.4,8.6,4.4c3.9,0,7.3-1,10.3-3.3c2.8-2.2,4.9-5.2,6.3-9l-7.5-0.8c-0.9,2.5-1.6,4.1-2.6,5.2 c-1.2,1.1-2.3,1.8-3.9,1.8c-2,0-2.9-1.2-2.9-3.2c0-1.4,0.7-3.9,1.9-7.7c0.2-0.7,0.5-1.1,0.7-1.6c0.5-0.9,0.5-1.6,0.7-2.5 c0.7-1.8,1.4-3.4,2.1-4.5c1.4-2,3-3.2,4.8-3.1c1.4,0,2,0.7,2.3,2.3c0,1.1,0,2.5-0.7,3.9L320.5,313.7z M292.9,317 c-1.2,3.4-2.4,5.9-3.5,7.5c-2.1,2.9-4.4,4.3-7.3,4.2l-0.9,0l7.6-21.8l0.9,0c2.7,0,4.3,1.2,4.5,3.7 C294.3,312,293.8,314.3,292.9,317z M132.4,283.4v-1h0H199v0c45.9,0,44.1-41.3,44.1-41.3h0V151h13.1v90.2c0,50.5-45.3,47.2-57.3,47.2h-66.5 L132.4,283.4z M278.8,132.4v109.4c0,67.1-51.4,59.8-74.1,60.8h-71.1c-0.2-2-0.5-4-0.6-6h71.7c61.8,0,61.1-54.8,61.1-54.8 V133.4C270,132.8,274.4,132.5,278.8,132.4z M434.6,286.2v-3.8H368v0c-45.9,0-44.1-41.3-44.1-41.3h0V151h-13.1v90.2c0,50.5,45.3,47.2,57.3,47.2h66.5 L434.6,286.2z M434,296.6h-71.7c-61.8,0-61.1-54.8-61.1-54.8V133.3l-13.1-1v109.4c0,67.1,51.4,59.8,74.1,60.8h71.1 L434,296.6z M428,328.7c-3.1,10.3-7.4,20.2-12.6,29.4c0,0-0.4,0-0.4,0c-8.3,0.1-16.7,0.1-25,0.2 c-14.6,0.1-29.8-0.7-44.3,1c-12.2,1.4-24.8,5.5-34.1,13.8c-6.1,5.4-10.4,12.6-14,19.9c-3.3,6.7-6.2,13.5-8.5,20.6 c-1.2,3.5-2.2,7.1-3.2,10.7c-0.8,3.3-1.2,7.1-2.3,10.2c-1.1-3.1-1.5-6.9-2.3-10.2c-0.9-3.6-2-7.2-3.2-10.7 c-2.4-7.1-5.2-13.9-8.5-20.6c-3.6-7.3-7.9-14.5-14-19.9c-9.3-8.3-21.9-12.4-34.1-13.8c-14.6-1.7-29.7-0.9-44.3-1 c-8.3-0.1-16.7-0.1-25-0.2c0,0-0.4,0-0.4,0c-5.1-9.2-9.5-19.1-12.6-29.4c11.3-0.3,49-0.7,80.8,1.7c39.1,3.1,55.1,34.2,63.7,76.4 c8.6-42.2,24.6-73.3,63.7-76.4C379,328,416.6,328.4,428,328.7z';

export interface ChibiAvatarSpec {
  name: string;
  shirt: string;
  hair: string;
  pants: string;
  acc: 'cap' | 'pony' | 'bun';
}

export const AVATARS: ChibiAvatarSpec[] = [
  { name: 'Bé Xanh', shirt: '#2FA8F0', hair: '#3A2A22', pants: '#2D4A6B', acc: 'cap' },
  { name: 'Bé Cam', shirt: '#FF8A3D', hair: '#6B3E26', pants: '#3C3F58', acc: 'pony' },
  { name: 'Bé Hồng', shirt: '#FF7AA8', hair: '#24202A', pants: '#4B3B6B', acc: 'bun' },
];

export const CAMP = { cx: -10, cz: -2, rx: 165, rz: 125 };

export const ROADS: [number, number, number, number][] = [
  [-320, 32, 140, 205], // đường Võ Văn Ngân
  [185, -200, 128, 250], // đường Chương Dương
];

export const LAKE = { x: -40, z: -205, r: 34 };

export const PATHS: [number, number, number, number][] = [
  [-66, 118, -66, 100],
  [-66, 100, -80, 92],
  [-80, 92, -89, 72],
  [-89, 72, -94, 68],
  [-94, 68, -96, 57],
  [-96, 57, -103.5, 49.5],
  [-103.5, 49.5, -103, 24],
  [-103, 24, -103.7, -1],
  [-103.7, -1, -51, 0],
  [-51, 0, 48, 0],
  [-51, 0, -80, -2],
  [48, 0, 135, 2],
  [-89, 72, -121, 72],
  [-80, 92, -51, 67.6],
  [-51, 67.6, -20, 66],
  [-20, 66, 12, 57.5],
  [12, 57.5, 122, 56],
  [122, 56, 150, 56],
  [21, 0, 21, 57.5],
  [-10, 0, -10, -36],
  [-10, -36, -23, -66],
  [-10, -36, 8, -72],
  [-10, -36, -48, -34],
  [50, 0, 50, -26],
  [50, -26, 66, -27],
  [-60, 12, -51, 0],
];

export const ZONES: [number, number, number, number][] = [
  [-73, 12.8, -27, 38.6],
  [-72.6, -98.3, -25, -39],
  [0, 5, 18, 36],
  [-7, -104, 26, -75],
  [-92.5, 60.5, -85.1, 67.9],
];

export const TYPE_LABEL: Record<string, string> = {
  checkin: 'Check-in & Định vị',
  photo: 'Chụp ảnh Polaroid 3D',
  quiz: 'Mật thư & Đố vui',
  kick: 'Mini-game Sút bóng',
  it_debug: 'Mini-game CNTT: Debug Logic',
  electric_circuit: 'Mini-game Điện: Đấu mạch',
  auto_engine: 'Mini-game Ô tô: Lắp Động cơ',
};

export const QUESTS: Quest[] = [
  {
    id: 'visit3',
    name: 'Khởi đầu Thám hiểm',
    description: 'Mở khóa sương mù tại 3 trạm bất kỳ trong khuôn viên TDC',
    need: 3,
    reward: 60,
    icon: 'checkin',
    col: '#FFAA1F',
    getValue: (p) => Object.keys(p.done || {}).length,
  },
  {
    id: 'star15',
    name: 'Thợ săn Ngôi sao',
    description: 'Thu thập đủ 15 ngôi sao năng lượng trên các lối đi',
    need: 15,
    reward: 80,
    icon: 'star',
    col: '#FFC83A',
    getValue: (p) => p.stars || 0,
  },
  {
    id: 'quiz2',
    name: 'Bậc thầy Giải đố',
    description: 'Vượt qua ít nhất 2 trạm câu đố hoặc mini-game chuyên ngành',
    need: 2,
    reward: 80,
    icon: 'quiz',
    col: '#9B6BFF',
    getValue: (p) => p.quizOk || 0,
  },
  {
    id: 'photo1',
    name: 'Khoảnh khắc TDC',
    description: 'Chụp 1 bức ảnh Polaroid 3D tại Bồn cây tròn',
    need: 1,
    reward: 50,
    icon: 'photo',
    col: '#FF6FA5',
    getValue: (p) => p.photos || 0,
  },
  {
    id: 'party1',
    name: 'Tinh thần Đồng đội',
    description: 'Tạo hoặc tham gia một Tổ đội thám hiểm (Co-op Party)',
    need: 1,
    reward: 100,
    icon: 'party',
    col: '#38B865',
    getValue: (p) => (p.partyId ? 1 : 0),
  },
  {
    id: 'all_stations',
    name: 'Nhà Thám hiểm Toàn diện',
    description: 'Mở khóa toàn bộ 100% các trạm và xóa tan sương mù toàn trường',
    need: 10,
    reward: 250,
    icon: 'explorer',
    col: '#00AEEF',
    getValue: (p) => Object.keys(p.done || {}).length,
  },
];
