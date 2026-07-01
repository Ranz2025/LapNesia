import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, RefreshCw } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getChatRooms } from "../../services/chatService";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

export default function Chat() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getChatRooms();
      setRooms(res.data?.data || []);
    } catch {
      setError("Gagal memuat daftar chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  return (
    <div style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold text-[#0F172A]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Pesan
          </h1>
          <button
            onClick={fetchRooms}
            className="p-2 rounded-xl transition hover:brightness-110"
            style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
          >
            <RefreshCw size={16} style={{ color: "#475569" }} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-4 animate-pulse flex gap-3"
                style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
              >
                <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: "#E2E8F0" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded w-1/3" style={{ background: "#E2E8F0" }} />
                  <div className="h-3 rounded w-2/3" style={{ background: "#F1F5F9" }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <p className="text-sm mb-3" style={{ color: "#F87171" }}>{error}</p>
            <button
              onClick={fetchRooms}
              className="text-sm font-semibold hover:underline"
              style={{ color: "#2563EB" }}
            >
              Coba Lagi
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
          >
            <MessageCircle className="mx-auto mb-4" size={48} style={{ color: "rgba(255,255,255,0.1)" }} />
            <h3 className="font-semibold text-[#0F172A] mb-2" style={{ fontFamily: FONT_DISPLAY }}>
              Belum ada percakapan
            </h3>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Chat akan muncul di sini setelah Anda memulai percakapan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="rounded-2xl p-4 transition cursor-pointer flex items-center gap-3"
                style={{ background: "#FFFFFF", border: "1px solid #BFDBFE" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 text-white"
                  style={{ background: GRADIENT }}
                >
                  {room.other_user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#0F172A] truncate">{room.other_user?.name}</p>
                    <span className="text-xs flex-shrink-0 ml-2" style={{ color: "#64748B" }}>
                      {timeAgo(room.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm truncate" style={{ color: "#475569" }}>
                      {room.last_message?.body || "Belum ada pesan"}
                    </p>
                    {room.unread_count > 0 && (
                      <span
                        className="ml-2 flex-shrink-0 min-w-[20px] h-5 text-white text-xs font-bold rounded-full flex items-center justify-center px-1"
                        style={{ background: GRADIENT }}
                      >
                        {room.unread_count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs capitalize" style={{ color: "#64748B" }}>
                    {room.other_user?.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
