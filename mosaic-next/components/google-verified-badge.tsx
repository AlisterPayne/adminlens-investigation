"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface GoogleVerifiedBadgeProps {
  size?: "xs" | "sm" | "md";
  className?: string;
  showIconOnly?: boolean;
}

export default function GoogleVerifiedBadge({
  size = "sm",
  className = "",
  showIconOnly = false,
}: GoogleVerifiedBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 320;

    // Position directly below the chip badge with 6px offset
    let top = rect.bottom + window.scrollY + 6;
    let left = rect.left + window.scrollX;

    // Check right screen boundary
    if (left + popoverWidth > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - popoverWidth - 16 + window.scrollX);
    }

    // Check bottom screen boundary (flip to above if too close to bottom)
    if (rect.bottom + 180 > window.innerHeight && rect.top > 200) {
      top = rect.top + window.scrollY - 180;
    }

    setCoords({ top, left });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on click outside, escape, or reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  const badgePadding = {
    xs: "px-1.5 py-0.5 rounded",
    sm: "px-2 py-0.5 rounded-md",
    md: "px-2.5 py-1 rounded-md",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const textSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-xs font-semibold",
  };

  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      {/* Soft light-green badge with dark-green circular checkmark & underlined Verified text */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 ${badgePadding[size]} bg-[#e6f4ea] hover:bg-[#d8ece0] border border-[#ceead6]/70 transition-colors cursor-pointer group/vbtn focus:outline-hidden`}
        title="Click to view Google Verified details"
        aria-expanded={isOpen}
      >
        {/* Google Admin Console style Green Outline Checkmark Circle */}
        <svg
          className={`${iconSizes[size]} text-[#137333] shrink-0`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.3"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2.5 2.5 5-5" />
        </svg>

        {!showIconOnly && (
          <span className={`${textSizes[size]} font-semibold text-[#137333] underline underline-offset-2 decoration-[#137333]`}>
            Verified
          </span>
        )}
      </button>

      {/* Popover Card - ONLY appears when clicked */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="z-[9999] w-72 sm:w-80 rounded-xl bg-white p-4 shadow-xl border border-gray-200/90 text-left transition-all animate-in fade-in zoom-in-95 duration-150"
          >
            <p className="text-xs text-gray-700 leading-relaxed font-normal">
              Verified apps have been reviewed by Google to ensure compliance with certain security and privacy requirements. Note that many well-known apps might not be verified in this way.
            </p>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <a
                href="https://support.google.com/a/answer/9987046"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Learn about verified apps
              </a>
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}
