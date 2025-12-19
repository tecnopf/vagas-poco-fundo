import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const FormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      container.current,
      { x: 80, opacity: 0 }, // slide padrão
      { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
    );
  }, []);

  return <div ref={container}>{children}</div>;
};

export default FormWrapper;
