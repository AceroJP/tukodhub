"use client";

import { useState, useRef } from "react";
import Swal from "sweetalert2";
import { IconSupport, IconSearch } from "@/components/owner/OwnerIcons";

type Attachment = {
  name: string;
  type: "image" | "video" | "file";
  size: string;
  url?: string;
};

type TicketMessage = {
  id: string;
  sender: "Platform Admin" | "Tenant Owner";
  text: string;
  timestamp: string;
  attachments?: Attachment[];
};

type Ticket = {
  id: string;
  ticketNumber: string;
  tenantName: string;
  tenantSlug: string;
  subject: string;
  category: "Billing" | "Technical Bug" | "Access Request" | "Configuration";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Waiting on Tenant" | "Resolved";
  createdAt: string;
  messages: TicketMessage[];
};

const initialTickets: Ticket[] = [
  {
    id: "tk-108",
    ticketNumber: "TK-108",
    tenantName: "CoolAir Airconditioning",
    tenantSlug: "coolair",
    subject: "Technician mobile app GPS proof not saving on branch 2",
    category: "Technical Bug",
    priority: "High",
    status: "Open",
    createdAt: "2026-11-18 10:14",
    messages: [
      {
        id: "msg-1",
        sender: "Tenant Owner",
        text: "Hi Super Admin, our field technicians at the Makati branch report that when they complete a job and upload proof photos, the GPS location tag errors out with code #503. I've attached a screenshot and a short video clip showing the error.",
        timestamp: "10:14 AM",
        attachments: [
          { name: "gps_error_screenshot.png", type: "image", size: "1.2 MB" },
          { name: "technician_screen_recording.mp4", type: "video", size: "14.8 MB" },
        ],
      },
      {
        id: "msg-2",
        sender: "Platform Admin",
        text: "Thanks for reporting this. We see the device location permissions were revoked on Android 14. I am sending an in-app request for temporary support access to review the branch audit logs.",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: "tk-107",
    ticketNumber: "TK-107",
    tenantName: "Electrical 3J Services",
    tenantSlug: "electrical3j",
    subject: "Invoice receipt for annual upgrade",
    category: "Billing",
    priority: "Low",
    status: "Resolved",
    createdAt: "2026-11-17 14:02",
    messages: [
      {
        id: "msg-10",
        sender: "Tenant Owner",
        text: "Please send the official BIR tax receipt for our Pro subscription renewal.",
        timestamp: "2:02 PM",
      },
      {
        id: "msg-11",
        sender: "Platform Admin",
        text: "Official receipt #PM-INV-202611-094 has been attached to your portal invoice section.",
        timestamp: "2:45 PM",
        attachments: [{ name: "BIR_Receipt_PM_INV.pdf", type: "file", size: "320 KB" }],
      },
    ],
  },
];

export default function SupportDeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("tk-108");
  const [replyText, setReplyText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) ?? tickets[0];

  function handleSendReply() {
    if (!replyText.trim()) return;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "Platform Admin",
      text: replyText.trim(),
      timestamp: "Just now",
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id
          ? {
              ...t,
              status: "Waiting on Tenant",
              messages: [...t.messages, newMessage],
            }
          : t
      )
    );
    setReplyText("");
  }

  async function handleAttachFile() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const type: Attachment["type"] = isVideo ? "video" : isImage ? "image" : "file";

    const newAttachment: Attachment = {
      name: file.name,
      type,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "Platform Admin",
      text: `Attached file: ${file.name}`,
      timestamp: "Just now",
      attachments: [newAttachment],
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicket.id
          ? {
              ...t,
              messages: [...t.messages, newMessage],
            }
          : t
      )
    );

    Swal.fire({
      icon: "success",
      title: "File Attached",
      text: `${file.name} uploaded to ticket ${activeTicket.ticketNumber}.`,
      confirmButtonColor: "#17624d",
    });
  }

  async function handleRequestSupportHandshake() {
    const { value: reason } = await Swal.fire({
      title: `Request Temporary Support Access`,
      text: `Tenant: ${activeTicket.tenantName} (${activeTicket.tenantSlug})`,
      input: "text",
      inputValue: `Diagnostic investigation for ${activeTicket.ticketNumber}: ${activeTicket.subject}`,
      inputLabel: "Audit Reason for exceptional access:",
      showCancelButton: true,
      confirmButtonColor: "#17624d",
      confirmButtonText: "Send Handshake Request to Tenant",
    });

    if (reason) {
      await Swal.fire({
        icon: "success",
        title: "Support Handshake Dispatched",
        text: `An in-app consent notification was sent to ${activeTicket.tenantName}. Once their owner approves, your platform session will receive a time-boxed access key.`,
        confirmButtonColor: "#17624d",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b17a25]">
            <span>Platform Support Desk</span>
            <span>•</span>
            <span>Audited Communication</span>
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-[#17352d]">Support Tickets</h1>
          <p className="mt-1 text-sm text-[#657970]">
            In-app ticketing with media uploads (images, videos, files) and explicit support access handshakes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRequestSupportHandshake}
          className="flex items-center gap-2 rounded-xl bg-amber-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-900"
        >
          <span>🔒</span>
          <span>Request Support Session</span>
        </button>
      </div>

      {/* Main Two-Pane View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Pane: Ticket Queue */}
        <div className="rounded-2xl border border-[#dce9df] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-[#e2ece6] pb-3">
            <h2 className="text-sm font-bold text-[#17352d]">Ticket Queue</h2>
            <span className="rounded-full bg-[#f2f6f4] px-2 py-0.5 text-xs font-bold text-[#17624d]">
              {tickets.length} Total
            </span>
          </div>

          <div className="space-y-2">
            {tickets.map((t) => {
              const isSelected = t.id === activeTicket.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left rounded-xl p-3.5 transition border ${
                    isSelected
                      ? "border-[#17624d] bg-[#f2f6f4]"
                      : "border-[#e2ece6] bg-white hover:bg-[#f7f8f5]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#17624d]">{t.ticketNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        t.priority === "High"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-1 font-semibold text-xs text-[#17352d] line-clamp-1">{t.subject}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#8ba097]">
                    <span>{t.tenantName}</span>
                    <span>{t.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Ticket Thread View */}
        <div className="flex flex-col rounded-2xl border border-[#dce9df] bg-white shadow-xs lg:col-span-2">
          {/* Thread Header */}
          <div className="border-b border-[#e2ece6] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#17624d]">{activeTicket.ticketNumber}</span>
                  <span className="text-xs text-[#8ba097]">•</span>
                  <span className="text-xs font-semibold text-[#657970]">{activeTicket.tenantName}</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    {activeTicket.category}
                  </span>
                </div>
                <h2 className="mt-1 text-base font-bold text-[#17352d]">{activeTicket.subject}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    Swal.fire({
                      icon: "success",
                      title: "Ticket Resolved",
                      text: `${activeTicket.ticketNumber} marked as resolved.`,
                      confirmButtonColor: "#17624d",
                    })
                  }
                  className="rounded-lg border border-[#cbded4] px-3 py-1.5 text-xs font-semibold text-[#17352d] hover:bg-[#f2f6f4]"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 space-y-4 p-5 overflow-y-auto max-h-[420px]">
            {activeTicket.messages.map((msg) => {
              const isPlatform = msg.sender === "Platform Admin";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isPlatform ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8ba097]">
                    <span>{msg.sender}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`mt-1 max-w-lg rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                      isPlatform
                        ? "bg-[#17624d] text-white"
                        : "border border-[#e2ece6] bg-[#f7f8f5] text-[#17352d]"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Media Attachments Preview */}
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
                                isPlatform ? "bg-white/10 text-white" : "bg-white border border-[#cbded4] text-[#17352d]"
                              }`}
                            >
                              <span>
                                {att.type === "video" ? "🎬" : att.type === "image" ? "🖼️" : "📄"}
                              </span>
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
            })}
          </div>

          {/* Reply Box */}
          <div className="border-t border-[#e2ece6] p-4 bg-[#f7f8f5] rounded-b-2xl">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              className="hidden"
              accept="image/*,video/*,.pdf,.log,.txt"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttachFile}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#cbded4] bg-white text-[#657970] transition hover:border-[#17624d] hover:text-[#17624d]"
                title="Attach image, video or log file"
              >
                📎
              </button>
              <input
                className="flex-1 rounded-xl border border-[#cbded4] bg-white px-4 py-2.5 text-xs text-[#17352d] outline-none transition focus:border-[#17624d]"
                placeholder="Type your response to tenant owner..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              />
              <button
                type="button"
                onClick={handleSendReply}
                className="rounded-xl bg-[#17624d] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#104c3c]"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#8ba097]">
              <span>Supports images (PNG, JPG), screen recordings (MP4, WebM), and PDF files.</span>
              <button
                type="button"
                onClick={handleRequestSupportHandshake}
                className="text-amber-800 font-semibold hover:underline"
              >
                Request Support Access Handshake
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
