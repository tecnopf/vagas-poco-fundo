// Loading.tsx
import React, { useEffect } from "react";
import { ImSpinner9 } from "react-icons/im";
import "./Loading.scss";

interface LoadingProps {
  loading: boolean;
  text?: string; // texto opcional
}

const Loading: React.FC<LoadingProps> = ({ loading, text }) => {
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = ""; 
    };
  }, [loading]);
  if (!loading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner-content">
        <ImSpinner9 className="spinner-icon" />
        {text && <p className="spinner-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loading;
