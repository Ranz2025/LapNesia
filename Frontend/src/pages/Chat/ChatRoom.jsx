import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { getMessages, sendMessage, getChatRoom } from "../../services/chatService";

const FONT_DISPLAY = "'Baloo 2', sans-serif";
const GRADIENT = "linear-gradient(90deg, #2563EB 0%, #06B6D4 100%)";

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getMessages(roomId);
      const msgs = res.data?.data?.data || [];
      setMessages(msgs);
      // Fallback: ambil otherUser dari pesan jika belum ada
      if (!otherUser && msgs.length > 0) {
        const other = msgs.find((m) => m.sender_id !== currentUser.id)?.sender;
        if (other) setOtherUser(other);
      }
    } catch {
      // silently ignore polling errors
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch room info (nama lawan chat) saat halaman pertama dibuka
  useEffect(() => {
    (async () => {
      try {
        const res = await getChatRoom(roomId);
        const room = res.data?.data ?? res.data;
        if (room?.other_user) setOtherUser(room.other_user);
      } catch {
        // tidak kritikal
      }
    })();
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(roomId, body.trim());
      setMessages((prev) => [...prev, res.data?.data]);
      setBody("");
    } catch {
      alert("Gagal mengirim pesan. Coba lagi.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div
      className="flex flex-col"
      style={{ background: "#F0F9FF", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />

      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 sticky top-16 z-10 max-w-2xl w-full mx-auto"
        style={{ background: "#F0F9FF", borderBottom: "1px solid #BFDBFE" }}
      >
        <button
          onClick={() => navigate("/chat")}
          className="p-1.5 rounded-xl transition"
          style={{ background: "#F1F5F9", border: "1px solid #BFDBFE" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(37,99,235,0.35)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
        >
          <ArrowLeft size={18} style={{ color: "#475569" }} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-white"
          style={{ background: GRADIENT }}
        >
          {otherUser?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-[#0F172A] leading-tight text-sm" style={{ fontFamily: FONT_DISPLAY }}>
            {otherUser?.name ?? "..."}
          </p>
          <p className="text-xs capitalize" style={{ color: "#64748B" }}>{otherUser?.role ?? ""}</p>
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <div
                  className="rounded-2xl h-10 w-48 animate-pulse"
                  style={{ background: "#EFF6FF" }}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-sm" style={{ color: "#64748B" }}>
            Belum ada pesan. Mulai percakapan!
          </div>
        ) : (
          Object.entries(grouped).map(([day, dayMsgs]) => (
            <div key={day}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
                <span className="text-xs" style={{ color: "#64748B" }}>
                  {formatDate(dayMsgs[0].created_at)}
                </span>
                <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
              </div>

              {dayMsgs.map((msg) => {
                const isMine = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}>
                    {!isMine && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mr-2 flex-shrink-0 self-end text-white"
                        style={{ background: "rgba(37,99,235,0.4)" }}
                      >
                        {msg.sender?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                      <div
                        className={`px-4 py-2 text-sm break-words ${isMine ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
                        style={
                          isMine
                            ? { background: GRADIENT, color: "#fff" }
                            : {
                                background: "#EFF6FF",
                                border: "1px solid #E2E8F0",
                                color: "#E2E2F0",
                              }
                        }
                      >
                        {msg.body}
                      </div>
                      <span className="text-[10px] mt-0.5 px-1" style={{ color: "#64748B" }}>
                        {formatTime(msg.created_at)}
                        {isMine && msg.read_at && (
                          <span className="ml-1" style={{ color: "#60A5FA" }}>✓✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div
        className="max-w-2xl w-full mx-auto px-4 py-3"
        style={{ borderTop: "1px solid #BFDBFE" }}
      >
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 px-4 py-2.5 rounded-full text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8]"
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(37,99,235,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 disabled:opacity-40 hover:brightness-110"
            style={{ background: GRADIENT }}
          >
            <Send size={16} className="text-[#475569]" />
          </button>
        </form>
      </div>
    </div>
  );
}
