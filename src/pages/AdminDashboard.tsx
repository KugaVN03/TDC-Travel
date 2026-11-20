import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Edit3,
  MapPin,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { TDC_LOGO, TYPE_LABEL } from '../data/campusLayout';
import { FACULTIES } from '../data/faculties';
import {
  buildStationQrPayload,
  deleteStation,
  generateAnalyticsCsv,
  getAdminAnalytics,
  resetStationsToDefault,
  saveCampaignEvent,
  saveStation,
} from '../services/adminService';
import { loadLocalEvents } from '../services/gameService';
import { CampaignEvent, Station, StationType } from '../types/game';

interface AdminDashboardProps {
  stations: Station[];
  onStationsUpdated: (next: Station[]) => void;
  onBackToGame: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stations,
  onStationsUpdated,
  onBackToGame,
}) => {
  const [activeTab, setActiveTab] = useState<'stations' | 'qr' | 'events' | 'analytics'>(
    'stations'
  );
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<CampaignEvent[]>(() => loadLocalEvents());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  useEffect(() => {
    // Generate QR Data URLs for all stations
    const genAll = async () => {
      const next: Record<string, string> = {};
      for (const st of stations) {
        try {
          const payload = buildStationQrPayload(st);
          const url = await QRCode.toDataURL(payload, {
            width: 240,
            margin: 1,
            color: { dark: '#1E3528', light: '#FFFFFF' },
          });
          next[st.id] = url;
        } catch {
          // Ignore
        }
      }
      setQrMap(next);
    };
    void genAll();
  }, [stations]);

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;
    const updatedList = await saveStation(editingStation);
    onStationsUpdated(updatedList);
    setEditingStation(null);
    showNotice(`Đã lưu cấu hình trạm "${editingStation.name}"!`);
  };

  const handleDeleteStation = async (id: string, name: string) => {
    const updatedList = await deleteStation(id);
    onStationsUpdated(updatedList);
    showNotice(`Đã xóa trạm "${name}".`);
  };

  const handleResetDefaults = () => {
    const list = resetStationsToDefault();
    onStationsUpdated(list);
    showNotice('Đã khôi phục 10 trạm tiêu chuẩn của khuôn viên TDC!');
  };

  const handleCreateNewStation = () => {
    const newId = `st_${Date.now().toString(36).slice(-4)}`;
    setEditingStation({
      id: newId,
      name: 'Trạm Thử Thách Mới',
      sub: 'Khu vực Khám phá TDC',
      facultyId: 'cntt',
      x: -20,
      z: 30,
      fogRadius: 28,
      col: '#00AEEF',
      type: 'quiz',
      pts: 100,
      badge: 'Nhà Khám Phá Mới',
      info: 'Mô tả thông tin giới thiệu tòa nhà / khu vực tại TDC.',
      funFact: 'Thông tin thú vị mở khóa sau khi sinh viên vượt qua thử thách.',
      directions: 'Hướng dẫn lộ trình di chuyển tới trạm tiếp theo.',
      qrSecretToken: `TDC-QR-${newId.toUpperCase()}`,
      riddle: {
        prompt: 'Câu hỏi mật thư quan sát thực địa tại trạm này là gì?',
        answer: 'tdc',
        hint: 'Gợi ý quan sát biển hiệu tại chỗ.',
      },
      questions: [
        {
          q: 'Câu hỏi trắc nghiệm mẫu tại trạm mới?',
          opts: ['Đáp án đúng A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          ans: 0,
          ex: 'Giải thích đáp án đúng sau khi sinh viên trả lời.',
        },
      ],
      active: true,
    });
  };

  const handleToggleEvent = async (evt: CampaignEvent) => {
    const updated = await saveCampaignEvent({ ...evt, active: !evt.active });
    setEvents(updated);
    showNotice(`Đã cập nhật trạng thái sự kiện "${evt.title}".`);
  };

  const analytics = getAdminAnalytics(stations);

  const handleExportCsv = () => {
    const csv = generateAnalyticsCsv(analytics);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-thong-ke-tdc-go-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Đã xuất file Báo cáo Thống kê CSV thành công!');
  };

  return (
    <div className="fixed inset-0 bg-[#F4F8F2] text-[#1E3528] overflow-y-auto z-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-white border-b-2 border-[#E2EBDA] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-sky-50 border-2 border-sky-200 grid place-items-center">
            <svg viewBox="118 118 332 332" className="w-8 h-8">
              <path fill="#00AEEF" d={TDC_LOGO} />
            </svg>
          </div>
          <div>
            <h1 className="m-0 font-black text-xl sm:text-2xl tracking-tight">
              TDC GO · Hệ Thống Quản Trị (Admin CMS)
            </h1>
            <p className="m-0 text-xs font-bold text-slate-500">
              Quản lý Trạm 3D, Mật thư O2O, In ấn Mã QR Thực địa & Thống kê Đoàn – Hội
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toastMsg && (
            <span className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full animate-bounce">
              ✔ {toastMsg}
            </span>
          )}
          <button type="button" onClick={onBackToGame} className="btn ghost text-sm">
            <ArrowLeft className="w-4 h-4" /> Quay lại Bản đồ 3D
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5 print:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-2 rounded-2xl border-2 border-[#E2EBDA] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('stations')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'stations'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" /> 1. Trạm 3D & Mật thư ({stations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" /> 2. Xuất & In Mã QR Trạm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'events'
                ? 'bg-amber-500 text-amber-950 shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" /> 3. Chiến dịch Sự kiện
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 4. Thống kê & Xuất CSV
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        {/* TAB 1: STATIONS CRUD */}
        {activeTab === 'stations' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Danh sách Điểm Trạm Tương tác & Vùng Sương mù (Fog of War)
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  Mỗi trạm gắn với tọa độ thực (x, z) trên mô hình 3D khuôn viên TDC, mật thư thực địa và mini-game.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="btn ghost text-xs"
                >
                  <RotateCcw className="w-4 h-4" /> Khôi phục Mặc định
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewStation}
                  className="btn sun text-xs"
                >
                  <Plus className="w-4 h-4" /> Thêm Trạm Mới
                </button>
              </div>
            </div>

            {editingStation && (
              <form
                onSubmit={handleSaveStation}
                className="bg-white border-2 border-emerald-400 rounded-2xl p-5 shadow-md flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h3 className="m-0 font-black text-base text-emerald-900">
                    ✏️ Chỉnh sửa Điểm Trạm: {editingStation.name} ({editingStation.id})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingStation(null)}
                    className="text-xs font-extrabold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tên Trạm 3D
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.name}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Phụ đề / Vị trí
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.sub}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, sub: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tên Huy hiệu (Badge)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStation.badge}
                      onChange={(e) =>
                        setEditingStation({ ...editingStation, badge: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Loại Thử thách
                    </label>
                    <select
                      value={editingStation.type}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          type: e.target.value as StationType,
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                    >
                      {Object.entries(TYPE_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Điểm Thưởng
                    </label>
                    <input
                      type="number"
                      value={editingStation.pts}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          pts: Number(e.target.value) || 100,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tọa độ X (Đông/Tây)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingStation.x}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          x: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tọa độ Z (Nam/Bắc)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingStation.z}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          z: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Tầng (B1=-1, T1..11)
                    </label>
                    <input
                      type="number"
                      min={-1}
                      max={11}
                      value={editingStation.floor ?? 1}
                      onChange={(e) => {
                        const fl = Number(e.target.value) || 1;
                        const yElev = fl === -1 ? -4.2 : Math.max(0, (fl - 1) * 4.2);
                        setEditingStation({
                          ...editingStation,
                          floor: fl,
                          y: +yElev.toFixed(1),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Mã QR Secret Token (Chống gian lận)
                    </label>
                    <input
                      type="text"
                      value={editingStation.qrSecretToken}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          qrSecretToken: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500">
                      Khoa Phụ trách
                    </label>
                    <select
                      value={editingStation.facultyId}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          facultyId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm"
                    >
                      {FACULTIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div>
                    <label className="text-xs font-black uppercase text-amber-800">
                      Câu hỏi Mật thư Quan sát Thực địa (O2O)
                    </label>
                    <input
                      type="text"
                      value={editingStation.riddle?.prompt || ''}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          riddle: {
                            prompt: e.target.value,
                            answer: editingStation.riddle?.answer || 'tdc',
                            hint: editingStation.riddle?.hint || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-amber-800">
                      Từ khóa Đáp án Mật thư
                    </label>
                    <input
                      type="text"
                      value={editingStation.riddle?.answer || ''}
                      onChange={(e) =>
                        setEditingStation({
                          ...editingStation,
                          riddle: {
                            prompt: editingStation.riddle?.prompt || '',
                            answer: e.target.value,
                            hint: editingStation.riddle?.hint || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-500">
                    Thông tin Giới thiệu & Fun Fact Mở khóa
                  </label>
                  <textarea
                    rows={2}
                    value={editingStation.funFact}
                    onChange={(e) =>
                      setEditingStation({ ...editingStation, funFact: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStation(null)}
                    className="btn ghost text-sm"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn sun text-sm">
                    <Save className="w-4 h-4" /> Lưu Thay Đổi Trạm
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl p-4 border-2 border-[#E2EBDA] shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-10 h-10 rounded-xl grid place-items-center text-white font-black text-sm shrink-0"
                        style={{ backgroundColor: st.col }}
                      >
                        {st.id.toUpperCase()}
                      </span>
                      <div>
                        <h3 className="m-0 font-black text-base">{st.name}</h3>
                        <p className="m-0 text-xs font-bold text-slate-500">
                          {st.sub} · 3D ({st.x}, {st.y || 0}m, {st.z}) · Tầng {st.floor === -1 ? 'B1' : st.floor || 1}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                      +{st.pts} đ
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-1">
                    <div>
                      <b>Loại thử thách:</b> {TYPE_LABEL[st.type]} · <b>Huy hiệu:</b>{' '}
                      {st.badge}
                    </div>
                    <div>
                      <b>Mã QR Token:</b>{' '}
                      <code className="bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded font-bold">
                        {st.qrSecretToken}
                      </code>
                    </div>
                    {st.riddle && (
                      <div>
                        <b>Mật thư O2O:</b> “{st.riddle.prompt}” → Đáp án:{' '}
                        <b className="text-emerald-700">{st.riddle.answer}</b>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-extrabold text-emerald-700">
                      ● Đang kích hoạt trên bản đồ 3D
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingStation(st)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-100 text-slate-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStation(st.id, st.name)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRINTABLE STANDEE QR CODES */}
        {activeTab === 'qr' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Bộ Standee Mã QR Định danh Trạm Thực địa (Chuẩn In Ấn O2O)
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  In và dán các thẻ QR này tại các tòa nhà tương ứng trong khuôn viên TDC để sinh viên quét bằng Camera trình duyệt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn sun text-sm"
              >
                <Printer className="w-4 h-4" /> In Toàn Bộ Bảng Mã QR (A4 / Standee)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stations.map((st) => (
                <div
                  key={st.id}
                  className="bg-white rounded-3xl p-5 border-4 border-[#1E3528] shadow-sm flex flex-col items-center text-center gap-2.5 break-inside-avoid"
                >
                  <div className="flex items-center gap-2">
                    <svg viewBox="118 118 332 332" className="w-6 h-6">
                      <path fill="#00AEEF" d={TDC_LOGO} />
                    </svg>
                    <span className="font-black text-xs uppercase tracking-wider text-sky-700">
                      TRƯỜNG CĐ CÔNG NGHỆ THỦ ĐỨC · TDC GO
                    </span>
                  </div>

                  <div
                    className="px-3 py-1 rounded-full text-white font-black text-xs"
                    style={{ backgroundColor: st.col }}
                  >
                    TRẠM THỬ THÁCH: {st.name.toUpperCase()}
                  </div>

                  {qrMap[st.id] ? (
                    <img
                      src={qrMap[st.id]}
                      alt={`QR ${st.name}`}
                      className="w-44 h-44 rounded-2xl border-2 border-slate-200 p-2"
                    />
                  ) : (
                    <div className="w-44 h-44 grid place-items-center text-xs font-bold text-slate-400">
                      Đang tạo QR...
                    </div>
                  )}

                  <div className="bg-[#FFFBEF] border border-amber-300 px-3 py-1.5 rounded-xl w-full">
                    <div className="text-[10px] font-black uppercase text-amber-800">
                      Mã Định Danh Dự Phòng
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900">
                      {st.qrSecretToken}
                    </div>
                  </div>

                  <p className="m-0 text-[11px] font-bold text-slate-500">
                    Quét mã bằng Camera Web Game <b>TDC GO</b> để xóa sương mù 3D và nhận huy hiệu <b>“{st.badge}” (+{st.pts}đ)</b>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGN EVENTS */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="m-0 font-black text-lg">
                Quản lý Chiến dịch & Sự kiện Chào Tân Sinh viên / Open Day
              </h2>
              <p className="m-0 text-xs font-bold text-slate-500">
                Kích hoạt các chiến dịch sự kiện theo đợt để nhân hệ số điểm thưởng trên toàn trường.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className={`bg-white rounded-2xl p-5 border-2 flex flex-col justify-between gap-3 ${
                    evt.active ? 'border-emerald-500' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                          evt.active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evt.active ? '● ĐANG DIỄN RA' : '○ ĐANG TẠM DỪNG'}
                      </span>
                      <span className="font-black text-amber-600 text-sm">
                        Hệ số thưởng: x{evt.bonusMultiplier}
                      </span>
                    </div>
                    <h3 className="m-0 font-black text-base">{evt.title}</h3>
                    <p className="text-xs font-bold text-slate-600 mt-1">
                      {evt.description}
                    </p>
                    <div className="text-xs font-extrabold text-slate-400 mt-2">
                      📅 Thời gian: {evt.startDate} → {evt.endDate}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleEvent(evt)}
                    className={`btn text-xs ${evt.active ? 'ghost' : 'sun'}`}
                  >
                    {evt.active ? 'Tạm dừng Chiến dịch' : 'Kích hoạt Chiến dịch Ngay'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & CSV EXPORT */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="m-0 font-black text-lg">
                  Báo cáo Thống kê Mức độ Khám phá Khuôn viên & Tham gia Theo Khoa
                </h2>
                <p className="m-0 text-xs font-bold text-slate-500">
                  Số liệu phục vụ công tác Đoàn – Hội, Phòng Công tác HSSV và nghiệm thu Đề tài NCKH.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn sun text-sm"
              >
                <Download className="w-4 h-4" /> Xuất Báo Cáo Thống Kê (.CSV)
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Tổng Sinh viên Tham gia
                </div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  {analytics.totalUsers} SV
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Tổng lượt Mở khóa Sương mù / Check-in
                </div>
                <div className="text-3xl font-black text-sky-600 mt-1">
                  {analytics.totalCheckins} lượt
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border-2 border-[#E2EBDA]">
                <div className="text-xs font-black uppercase text-slate-500">
                  Số Điểm Trạm 3D Hoạt động
                </div>
                <div className="text-3xl font-black text-amber-600 mt-1">
                  {stations.length} trạm
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Station Popularity Chart */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#E2EBDA] flex flex-col gap-3">
                <h3 className="m-0 font-black text-base">
                  📊 Lượt Check-in & Giải đố theo Khu vực Trạm 3D
                </h3>
                <div className="flex flex-col gap-2.5">
                  {analytics.stationStats.map((s) => {
                    const max = Math.max(
                      1,
                      ...analytics.stationStats.map((x) => x.count)
                    );
                    const pct = Math.round((s.count / max) * 100);
                    return (
                      <div key={s.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span>{s.name}</span>
                          <span>{s.count} lượt</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: s.col,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Faculty Leaderboard Chart */}
              <div className="bg-white p-5 rounded-2xl border-2 border-[#E2EBDA] flex flex-col gap-3">
                <h3 className="m-0 font-black text-base">
                  🏆 Thống kê Điểm số Tham gia theo Khoa
                </h3>
                <div className="flex flex-col gap-2.5">
                  {analytics.facultyStats.map((f) => {
                    const max = Math.max(
                      1,
                      ...analytics.facultyStats.map((x) => x.totalPoints)
                    );
                    const pct = Math.round((f.totalPoints / max) * 100);
                    return (
                      <div key={f.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-extrabold">
                          <span>
                            {f.name} ({f.studentsCount} SV)
                          </span>
                          <span>{f.totalPoints.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: f.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
