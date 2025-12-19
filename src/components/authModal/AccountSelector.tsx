import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  onSelect: (type: "Establishment" | "User") => void;
}

const AccountSelector: React.FC<Props> = ({ onSelect }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      container.current,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="account-selector" ref={container}>
      <button className="up" onClick={() => onSelect("Establishment")}>
        Quero entrar como Estabelecimento para anunciar vagas!
      </button>

      <button className="down" onClick={() => onSelect("User")}>
        Quero entrar como Usuário para aplicar para vagas!
      </button>
    </div>
  );
};

export default AccountSelector;
