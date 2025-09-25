import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

type ToastProps = {
  message: React.ReactNode;
  position?: "left" | "right" | "middle";
  placement?: "top" | "bottom"; // novo
  children: React.ReactNode;
  offsetY?: number;
  className?: string;
  gapY?: number;
};

export default function Toast({
  message,
  position = "middle",
  placement = "bottom", // default = embaixo
  children,
  offsetY = 8,
  gapY = 8,
  className = "",
}: ToastProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toastRef.current) return;
    // reset no mount ou mudança da mensagem
    gsap.set(toastRef.current, {
      autoAlpha: 0,
      y: placement === "top" ? offsetY : -offsetY,
    });
  }, [offsetY, message, placement]);

  const handleEnter = () => {
    if (!toastRef.current) return;
    gsap.to(toastRef.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.22,
      ease: "power3.out",
    });
  };

  const handleLeave = () => {
    if (!toastRef.current) return;
    gsap.to(toastRef.current, {
      autoAlpha: 0,
      y: placement === "top" ? offsetY : -offsetY,
      duration: 0.22,
      ease: "power3.in",
    });
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative flex ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      <div
        ref={toastRef}
        role="status"
        aria-hidden="true"
        style={{
          [placement === "top" ? "bottom" : "top"]: `calc(100% + ${gapY}px)`,
          userSelect: "none",
          backgroundColor: "gray",
          padding: "1px 6px",
          fontFamily: "SF-Regular",
        }}
        className={`absolute z-50 whitespace-nowrap px-3 py-2 rounded-lg shadow-lg bg-gray-800 text-white text-sm ${positionClass(
          position
        )}`}
      >
        {/* triangle */}
        <div
          className={`absolute ${
            placement === "top" ? "-bottom-2 border-t-8" : "-top-2 border-b-8"
          } w-0 h-0 border-l-6 border-r-6 border-transparent ${
            placement === "top"
              ? "border-t-gray-800"
              : "border-b-gray-800"
          } ${trianglePositionClass(position)}`}
          style={{
            borderTopColor: placement === "top" ? "gray" : "transparent",
            borderBottomColor: placement === "bottom" ? "gray" : "transparent",
          }}
        ></div>
        {message}
      </div>
    </div>
  );
}

function positionClass(position: ToastProps["position"]) {
  if (position === "left") return "left-0 transform-none";
  if (position === "right") return "right-0 transform-none";
  return "left-1/2 transform -translate-x-1/2";
}

function trianglePositionClass(position: ToastProps["position"]) {
  if (position === "left") return "left-4";
  if (position === "right") return "right-4";
  return "left-1/2 -translate-x-1/2";
}
