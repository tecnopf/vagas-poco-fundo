import React from "react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }} onClick={onClose}>
      <div className="modal-content info-modal" onClick={e => e.stopPropagation()}>
        <h2>Solicitar Token</h2>
        <p>Para criar uma conta, solicite um token através do link abaixo e depois escreva o código que você recebeu.</p>
        <a href="#" className="token-link">Solicitar Token</a>
      </div>
    </div>
  );
};

export default InfoModal;
