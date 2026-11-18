"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { ownerApiRequest } from "@/lib/ownerApi";
import { IconSupport, IconSearch } from "@/components/owner/OwnerIcons";

// ─── API types (mirror PlatformController records) ───────────────────────────

type Attachment = {
  name: string;
  type: "image" | "video" | "file";
  size: string;
  url?: string;
};

type TicketSummary = {
  id: string;
  ticketNumber: string;
  tenantName: string;
  tenantSlug: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messageCount: number;
};

type TicketMessage = {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  attachmentsJson?: string | null;
  createdAt: string;
  // parsed locally
  attachments?: Attachment[];
};

type TicketDetail = {
  id: string;
  ticketNumber: string;
  tenantName: string;
  tenantSlug: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseAttachments(json?: string | null): Attachment[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as Attachment[];
  } catch {
    return [];
  }
}

function priorityColor(p: string) {
  if (p === "Urgent") return "bg-red-100 text-red-700";
  if (p === "High") return "bg-orange-100 text-orange-700";
  if (p === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

function statusColor(s: string) {
  if (s === "Open") return "bg-blue-100 text-blue-700";
  if (s === "In Progress") return "bg-purple-100 text-purple-700";
  if (s === "Waiting on Tenant") return "bg-amber-100 text-amber-700";
  if (s === "Resolved") return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-600";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ─── Page component ──────────────────────────────────────────────────────────

export default function SupportDeskPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ticket list ───────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ownerApiRequest<TicketSummary[]>("/api/v1/platform/support/tickets");
      setTickets(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed to load tickets", toast: true, timer: 3000, position: "top-end", showConfirmButton: false });
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchTickets(); }, []);

  // ── Fetch ticket detail when selection changes ──────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetail(null);
    ownerApiRequest<TicketDetail>(`/api/v1/platform/support/tickets/${selectedId}`)
      .then((d) => {
        const withAttachments: TicketMessage[] = d.messages.map((m) => ({
          ...m,
          attachments: parseAttachments(m.attachmentsJson),
        }));
        setDetail({ ...d, messages: withAttachments });
      })
      .catch(() =>
        Swal.fire({ icon: "error", title: "Failed to load ticket detail", toast: true, timer: 3000, position: "top-end", showConfirmButton: false })
      )
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  // ── Send reply ──────────────────────────────────────────────────────────────
  async function handleSendReply() {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);
    try {
      const attachmentsJson = pendingAttachment ? JSON.stringify([pendingAttachment]) : null;
      const newMsg = await ownerApiRequest<TicketMessage>(
        `/api/v1/platform/support/tickets/${selectedId}/messages`,
        { method: "POST", body: JSON.stringify({ message: replyText.trim(), attachmentsJson }) }
      );
      setDetail((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, { ...newMsg, attachments: parseAttachments(newMsg.attachmentsJson) }] }
          : prev
      );
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, status: "Waiting on Tenant", messageCount: t.messageCount + 1 } : t
        )
      );
      setReplyText("");
      setPendingAttachment(null);
    } catch {
      Swal.fire({ icon: "error", title: "Failed to send reply", toast: true, timer: 3000, position: "top-end", showConfirmButton: false });
    } finally {
      setSending(false);
    }
  }

  // ── File attachment (client-side metadata only; real upload = future Supabase Storage) ──
  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const type: Attachment["type"] = isVideo ? "video" : isImage ? "image" : "file";
    setPendingAttachment({
      name: file.name,
      type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
    // Reset input so same file can be reselected
    e.target.value = "";
  }

  // ── Support Handshake ───────────────────────────────────────────────────────
  async function handleRequestSupportHandshake() {
    if (!detail) return;

    const { value: reason } = await Swal.fire({
      title: "Request Support Access",
      html: `<p class="text-sm text-gray-600 mb-3">Requesting temporary access to <strong>${detail.tenantName}</strong>'s records. The tenant owner must approve this request.</p>
             <textarea id="reason" class="swal2-input w-full" rows="3" placeholder="Briefly describe why access is needed..."></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Send Request",
      confirmButtonColor: "#17624d",
      preConfirm: () => {
        const el = document.getElementById("reason") as HTMLTextAreaElement;
        const val = el?.value?.trim();
        if (!val) Swal.showValidationMessage("Reason is required");
        return val;
      },
    });

    if (!reason) return;

    try {
      await ownerApiRequest("/api/v1/platform/handshake", {
        method: "POST",
        body: JSON.stringify({ tenantId: detail.id, reason, durationMinutes: 60 }),
      });
      Swal.fire({
        icon: "success",
        title: "Request Sent",
        text: "The tenant owner will receive a notification to approve or deny this access.",
        confirmButtonColor: "#17624d",
      });
    } catch {
      Swal.fire({ icon: "error", title: "Failed to send handshake request", toast: true, timer: 3000, position: "top-end", showConfirmButton: false });
    }
  }

  // ── Filtered ticket list ────────────────────────────────────────────────────
  const filtered = tickets.filter(
    (t) =>
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-screen flex-col bg-[#f7f8f5]">
      {/* Header */}
      <div className="border-b border-[#e2ece6] bg-white px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#17624d]/10 text-[#17624d]">
            <IconSupport className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#17352d]">Support Desk</h1>
            <p className="text-xs text-[#657970]">In-app ticketing for tenant business owners</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length} Open
            </span>
            <button
              onClick={fetchTickets}
              className="rounded-lg border border-[#cbded4] bg-white px-3 py-1.5 text-xs font-medium text-[#17352d] transition hover:bg-[#f2f6f4]"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Ticket list */}
        <aside className="flex w-80 shrink-0 flex-col border-r border-[#e2ece6] bg-white">
          <div className="p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#cbded4] bg-[#f7f8f5] px-3 py-2">
              <IconSearch className="h-3.5 w-3.5 text-[#8ba097]" />
              <input
                className="flex-1 bg-transparent text-xs text-[#17352d] outline-none placeholder:text-[#8ba097]"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-xs text-[#8ba097]">Loading tickets…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <span className="text-2xl">📭</span>
                <p className="text-xs text-[#8ba097]">No tickets yet</p>
                <p className="text-[10px] text-[#8ba097]">Tickets created by tenant owners will appear here.</p>
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full border-b border-[#f0f4f2] px-4 py-3.5 text-left transition hover:bg-[#f7f8f5] ${
                    selectedId === t.id ? "bg-[#edf4f1] border-l-2 border-l-[#17624d]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-[#17624d]">{t.ticketNumber}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-[#17352d]">{t.subject}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] text-[#657970]">{t.tenantName}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${priorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#8ba097]">
                    <span>{fmtDate(t.createdAt)}</span>
                    <span>{t.messageCount} msg{t.messageCount !== 1 ? "s" : ""}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right: Ticket detail */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {!selectedId || (!detail && !detailLoading) ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
              <span className="text-5xl">🎫</span>
              <p className="text-sm font-semibold text-[#17352d]">Select a ticket to view</p>
              <p className="text-xs text-[#8ba097]">Ticket conversation will appear here</p>
            </div>
          ) : detailLoading ? (
            <div className="flex flex-1 items-center justify-center text-xs text-[#8ba097]">
              Loading ticket…
            </div>
          ) : detail ? (
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl m-4 border border-[#e2ece6] bg-white shadow-xs">
              {/* Detail header */}
              <div className="border-b border-[#e2ece6] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#17624d]">{detail.ticketNumber}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor(detail.status)}`}>
                        {detail.status}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${priorityColor(detail.priority)}`}>
                        {detail.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {detail.category}
                      </span>
                    </div>
                    <h2 className="mt-1 text-sm font-bold text-[#17352d] truncate">{detail.subject}</h2>
                    <p className="text-[11px] text-[#657970] mt-0.5">
                      {detail.tenantName} · {fmtDate(detail.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleRequestSupportHandshake}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                    >
                      🔐 Request Access
                    </button>
                    <button
                      onClick={() =>
                        Swal.fire({ icon: "info", title: "Mark Resolved", text: "Resolution workflow coming soon.", confirmButtonColor: "#17624d" })
                      }
                      className="rounded-lg border border-[#cbded4] bg-white px-3 py-1.5 text-xs font-semibold text-[#17352d] transition hover:bg-[#f2f6f4]"
                    >
                      ✓ Mark Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages feed */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {detail.messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12 text-xs text-[#8ba097]">
                    No messages yet. Send the first reply below.
                  </div>
                ) : (
                  detail.messages.map((msg) => {
                    const isPlatform = msg.senderType === "PlatformAdmin";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isPlatform ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8ba097]">
                          <span>{msg.senderName}</span>
                          <span>•</span>
                          <span>{fmtDate(msg.createdAt)}</span>
                        </div>
                        <div
                          className={`mt-1 max-w-lg rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                            isPlatform
                              ? "bg-[#17624d] text-white"
                              : "border border-[#e2ece6] bg-[#f7f8f5] text-[#17352d]"
                          }`}
                        >
                          <p>{msg.message}</p>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-2 border-t border-white/20 pt-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                                Attachments ({msg.attachments.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {msg.attachments.map((att, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                                      isPlatform
                                        ? "bg-white/10 text-white"
                                        : "bg-white border border-[#cbded4] text-[#17352d]"
                                    }`}
                                  >
                                    <span>{att.type === "video" ? "🎬" : att.type === "image" ? "🖼️" : "📄"}</span>
                                    <span className="font-semibold">{att.name}</span>
                                    <span className="opacity-70 text-[9px]">({att.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reply box */}
              <div className="border-t border-[#e2ece6] p-4 bg-[#f7f8f5] rounded-b-2xl">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelected}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.log,.txt"
                />

                {/* Pending attachment preview */}
                {pendingAttachment && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span>{pendingAttachment.type === "video" ? "🎬" : pendingAttachment.type === "image" ? "🖼️" : "📄"}</span>
                    <span className="font-semibold truncate flex-1">{pendingAttachment.name}</span>
                    <span className="opacity-70">({pendingAttachment.size})</span>
                    <button onClick={() => setPendingAttachment(null)} className="ml-2 font-bold opacity-60 hover:opacity-100">✕</button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[#cbded4] bg-white text-[#657970] transition hover:border-[#17624d] hover:text-[#17624d]"
                    title="Attach image, video or log file"
                  >
                    📎
                  </button>
                  <input
                    className="flex-1 rounded-xl border border-[#cbded4] bg-white px-4 py-2.5 text-xs text-[#17352d] outline-none transition focus:border-[#17624d]"
                    placeholder="Type your response to tenant owner…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    disabled={sending}
                  />
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="rounded-xl bg-[#17624d] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#104c3c] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-[#8ba097]">
                  Supports images (PNG, JPG), screen recordings (MP4, WebM), and PDF files · Enter to send
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
