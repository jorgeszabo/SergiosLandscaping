"use client";
/* Full-screen photo viewer. Tap a job photo to open it large with a caption
   saying what it's of; swipe/arrow between photos. */
import { useEffect, useState } from "react";
import { IconClose, IconChevronLeft, IconChevronRight } from "./icons";

export type Shot = { src: string; caption?: string };

export function Lightbox({ shots, index, onClose }: { shots: Shot[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  useEffect(() => setI(index), [index]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setI((p) => Math.max(0, p - 1));
      else if (e.key === "ArrowRight") setI((p) => Math.min(shots.length - 1, p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shots.length, onClose]);

  const shot = shots[i];
  if (!shot) return null;
  const many = shots.length > 1;

  return (
    <div
      className="lightbox"
      onClick={(e) => { if ((e.target as HTMLElement).classList.contains("lightbox")) onClose(); }}
    >
      <button className="lightbox-btn close" onClick={onClose} aria-label="Close"><IconClose size={22} /></button>
      {many && i > 0 && (
        <button className="lightbox-btn left" onClick={() => setI(i - 1)} aria-label="Previous"><IconChevronLeft size={30} /></button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={shot.src} alt={shot.caption || ""} className="lightbox-img" />
      {many && i < shots.length - 1 && (
        <button className="lightbox-btn right" onClick={() => setI(i + 1)} aria-label="Next"><IconChevronRight size={30} /></button>
      )}
      {(shot.caption || many) && (
        <div className="lightbox-cap">
          {shot.caption}
          {many && <span className="lightbox-count">{i + 1} / {shots.length}</span>}
        </div>
      )}
    </div>
  );
}
