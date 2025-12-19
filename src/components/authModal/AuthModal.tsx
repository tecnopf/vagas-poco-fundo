import React, { useEffect, useState } from "react";
import "./AuthModal.scss";
import AccountSelector from "./AccountSelector";
import FormWrapper from "./FormWrapper";
import EstablishmentLogin from "./EstablishmentForms/Login";
import EstablishmentRegister from "./EstablishmentForms/Register";
import UserLogin from "./UserForms/Login";
import UserRegister from "./UserForms/Register";
import { IoMdArrowBack } from "react-icons/io";
import InfoModal from "./InfoModal";
import ForgotPasswordModal from "../forgot-password-modal/ForgotPasswordModal";
import ErrorPopup from "../error-popup/ErrorPopup";
import Loading from "../loading/Loading";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const [accountType, setAccountType] = useState<"Establishment" | "User" | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [tokenInfoOpen, setTokenInfoOpen] = useState(false); 
  const [forgotOpen, setForgotOpen] = useState(false); 

  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Carregando...")

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [errorDirectMessage, setErrorDirectMessage] = useState<string | undefined>();
  const [errorStatus, setErrorStatus] = useState<number | undefined>();

  const openError = (message?: string, status?: number, directMessage?: string) => {
    setErrorMessage(message);
    setErrorDirectMessage(directMessage);
    setErrorStatus(status);
    setErrorOpen(true);
  };

  const setLoadingScreen = (open: boolean, loadingText?: string)=>{
    if(loadingText){
      setLoadingText(loadingText)
    }
    setLoading(open)
  }

  const handleClose = () => {
    setAccountType(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {!accountType ? (
          <AccountSelector
            onSelect={(type) => {
              setAccountType(type);
              setMode("login");
            }}
          />
        ) : (
          <>

            <div className="modal-header">
              <IoMdArrowBack onClick={() => setAccountType(null)} width={30} height={30} style={{position: 'absolute', left: 0, top: 7, cursor: 'pointer', fontSize: 30}}/>
              <button
                onClick={() => setMode("login")}
                className={mode === "login" ? "active" : ""}
                style={{
                  borderRight: "none",
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0
                }}
              >
                Entrar
              </button>

              <button
                onClick={() => setMode("register")}
                className={mode === "register" ? "active" : ""}
                style={{
                  borderLeft: "none",
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0
                }}
              >
                Criar conta
              </button>
            </div>

            <FormWrapper key={accountType + mode}>
              {accountType === "Establishment" && mode === "login" && <EstablishmentLogin onClose={onClose} onError={openError} setLoadingScreen={setLoadingScreen} setForgotOpen={setForgotOpen} />}
              {accountType === "Establishment" && mode === "register" && <EstablishmentRegister onClose={onClose} onError={openError} setTokenInfoOpen={setTokenInfoOpen} />}
              {accountType === "User" && mode === "login" && <UserLogin onClose={onClose} setForgotOpen={setForgotOpen} setLoadingScreen={setLoadingScreen} onError={openError} />}
              {accountType === "User" && mode === "register" && <UserRegister onClose={onClose} onError={openError}/>}
            </FormWrapper>
          </>
        )}
        <InfoModal open={tokenInfoOpen} onClose={() => setTokenInfoOpen(false)} /> 
        <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
        <ErrorPopup
          isOpen={errorOpen}
          message={errorMessage}
          rawMessage={errorDirectMessage}
          statusCode={errorStatus}
          onClose={() => setErrorOpen(false)}
          nestedModal
        />
        <Loading loading={loading} text={loadingText} />
      </div>
    </div>
  );
};

export default AuthModal;
