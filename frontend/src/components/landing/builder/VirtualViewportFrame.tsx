"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

type VirtualViewportFrameProps = {
  devicePreview: "desktop" | "tablet" | "mobile";
  onDeviceChange: (device: "desktop" | "tablet" | "mobile") => void;
  zoomMode: "fit" | "50" | "75" | "100";
  onZoomChange: (mode: "fit" | "50" | "75" | "100") => void;
  children: React.ReactNode;
};

export function VirtualViewportFrame({
  devicePreview,
  onDeviceChange,
  zoomMode,
  onZoomChange,
  children,
}: VirtualViewportFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(1200);

  // Target viewport dimensions
  const targetWidth =
    devicePreview === "desktop" ? 1440 : devicePreview === "tablet" ? 768 : 375;

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute scale factor
  const computedScale =
    zoomMode === "fit"
      ? Math.min(1, Math.max(0.2, (containerWidth - 36) / targetWidth))
      : zoomMode === "50"
      ? 0.5
      : zoomMode === "75"
      ? 0.75
      : 1.0;

  // Initialize and maintain iframe document
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en" style="overflow-x: hidden; margin: 0; padding: 0;">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body class="${window.document.body.className}" style="margin: 0; padding: 0; overflow-x: hidden; background: #f7f8f5;">
          <div id="preview-root" style="width: 100%; min-height: 100%;"></div>
        </body>
      </html>
    `);
    doc.close();

    // Copy parent styles into iframe
    const syncStyles = () => {
      if (!iframe.contentDocument) return;
      const targetHead = iframe.contentDocument.head;
      const existingInjected = targetHead.querySelectorAll("[data-builder-style]");
      existingInjected.forEach((el) => el.remove());

      const parentStyles = window.document.querySelectorAll("link[rel='stylesheet'], style");
      parentStyles.forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-builder-style", "true");
        targetHead.appendChild(clone);
      });
    };
    syncStyles();

    // Watch for dynamic style updates in parent
    const observer = new MutationObserver(() => syncStyles());
    observer.observe(window.document.head, { childList: true, subtree: true });

    const root = doc.getElementById("preview-root");
    setMountNode(root);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Measure content height inside iframe
  useEffect(() => {
    if (!mountNode) return;
    const ro = new ResizeObserver(() => {
      if (mountNode) {
        const h = Math.max(800, mountNode.scrollHeight);
        setContentHeight(h);
      }
    });
    ro.observe(mountNode);
    return () => ro.disconnect();
  }, [mountNode, children, devicePreview]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-w-0 bg-[#eef2ef] rounded-2xl border border-[#dce9df] flex flex-col overflow-hidden h-[calc(100vh-140px)] min-h-[640px] shadow-xs"
    >
      {/* ── Virtual Browser Chrome Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-[#dce9df] shrink-0 text-xs">
        {/* Left: Window Controls + URL */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f7f8f5] rounded-full text-[11px] text-[#526b63] border border-[#cbded4]">
            <span className="text-[#17624d] font-bold">🔒</span>
            <span className="font-mono text-[#17352d]">https://tukodhub.com/</span>
            <span className="text-[10px] text-[#8ba097] border-l border-[#cbded4] pl-1.5 ml-0.5">
              {targetWidth}px
            </span>
          </div>
        </div>

        {/* Center: Device Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-[#cbded4] bg-[#f7f8f5] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onDeviceChange("desktop")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              devicePreview === "desktop"
                ? "bg-white text-[#17624d] shadow-2xs"
                : "text-[#657970] hover:text-[#17352d]"
            }`}
          >
            Desktop (1440)
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("tablet")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              devicePreview === "tablet"
                ? "bg-white text-[#17624d] shadow-2xs"
                : "text-[#657970] hover:text-[#17352d]"
            }`}
          >
            Tablet (768)
          </button>
          <button
            type="button"
            onClick={() => onDeviceChange("mobile")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              devicePreview === "mobile"
                ? "bg-white text-[#17624d] shadow-2xs"
                : "text-[#657970] hover:text-[#17352d]"
            }`}
          >
            Mobile (375)
          </button>
        </div>

        {/* Right: Proportional Zoom Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#657970] font-medium hidden sm:inline">Zoom:</span>
          <select
            value={zoomMode}
            onChange={(e) => onZoomChange(e.target.value as "fit" | "50" | "75" | "100")}
            className="rounded-lg border border-[#cbded4] bg-[#f7f8f5] px-2 py-1 text-xs font-semibold text-[#17352d] outline-none hover:border-[#17624d]"
          >
            <option value="fit">Fit ({Math.round(computedScale * 100)}%)</option>
            <option value="50">50%</option>
            <option value="75">75%</option>
            <option value="100">100%</option>
          </select>
        </div>
      </div>

      {/* ── Scrollable Viewport Canvas Area ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
        {/* Scaled Wrapper Box matching the scaled dimensions */}
        <div
          style={{
            width: Math.round(targetWidth * computedScale),
            height: Math.round(contentHeight * computedScale),
            minHeight: Math.round(contentHeight * computedScale),
            position: "relative",
            transition: "width 0.15s ease",
          }}
          className={`shrink-0 bg-white transition-shadow ${
            devicePreview === "mobile"
              ? "rounded-[2.5rem] border-[8px] border-[#17352d] shadow-2xl overflow-hidden"
              : devicePreview === "tablet"
              ? "rounded-2xl border-4 border-[#334b42] shadow-xl overflow-hidden"
              : "rounded-xl border border-[#cbded4] shadow-lg overflow-hidden"
          }`}
        >
          {/* Inner Virtual Screen */}
          <iframe
            ref={iframeRef}
            title="TukodHub Live Preview"
            style={{
              width: `${targetWidth}px`,
              height: `${contentHeight}px`,
              border: "none",
              transform: `scale(${computedScale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
              display: "block",
            }}
          />
          {mountNode && createPortal(children, mountNode)}
        </div>
      </div>
    </div>
  );
}
