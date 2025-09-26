import React, { useState, useEffect } from "react";
import { ImSpinner9 } from "react-icons/im";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./SocialLinksModal.scss";
import { useProfile } from "../../cached-requests/getProfile";
import { API_URL } from "../../configs";
import { useAuth } from "../../context/AuthContext";
import ErrorPopup from "../../components/error-popup/ErrorPopup";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (links: SocialLinks) => void;
}

export type SocialLinks = {
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  useAccountEmail?: boolean;
};

const formatWhatsapp = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const SocialLinksModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [links, setLinks] = useState<SocialLinks>({});
  const { data, isLoading, isError } = useProfile()
  const { token } = useAuth()
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorPopup, setErrorPopup] = useState<number|null>(null);

  useEffect(()=>{
    console.log('isError: ',isError)
    console.log(links)
    console.log(data)

  },[links, data, isError])

  useEffect(() => {
    if (isOpen && data && data.socialLinks) {
      setLinks({
        ...data.socialLinks,
        useAccountEmail: data.socialLinks.useAccountEmail ?? false,
      });
      setErrors({});
    } else if (isOpen) {
      setLinks({});
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleField = (field: keyof SocialLinks, checked: boolean) => {
    setLinks((prev) => {
      if (checked) return { ...prev, [field]: "" };
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateValue = (field: keyof SocialLinks, value: string | boolean) => {
    setLinks((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const urlFields: (keyof SocialLinks)[] = ["instagram", "facebook", "linkedin"];
    urlFields.forEach((f) => {
      const val = links[f];
      if (val && !/^https?:\/\//i.test(val.toString())) {
        newErrors[f] = "O link deve começar com http:// ou https://";
      }
    });

    if (links.whatsapp) {
      const digits = links.whatsapp.replace(/\D/g, "");
      if (digits.length < 10) {
        console.log('whats')
        newErrors.whatsapp = "Número de WhatsApp incompleto";
      }
    }

    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const originalLinks = data?.socialLinks || {};
    const hasChanges = JSON.stringify(links) !== JSON.stringify(originalLinks);
    if (!hasChanges) {
      onClose();
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/profile/social-links`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(links),
      });

      if (!res.ok) {
        console.error(res.json())
        setErrorPopup(res.status);
        return;
      }

      const updated = await res.json();
      onSave(updated); 
      onClose();
    } catch (err: any) {
      console.error(err);
      console.error(err)
      setErrorPopup(err.status)
    } finally {
      setSaving(false);
    }
  };


  return (
    <>
    <div className="modal-overlay">
      <div className="modal-content new-links">
        {saving && (
          <div className="card-overlay">
            <ImSpinner9 className="spinner-icon" />
          </div>
        )}

        <h2>Adicionar redes sociais</h2>
        <p>Essas redes sociais serão mostradas como meio de contato quando você anunciar a vaga.</p>

        {/* WhatsApp */}
        <div className="social-field">
          <label>
            <input
              type="checkbox"
              checked={links.whatsapp !== undefined}
              onChange={(e) => toggleField("whatsapp", e.target.checked)}
            />
            <FaWhatsapp style={{ marginLeft: 8, marginRight: 8 }} /> WhatsApp
          </label>
          {links.whatsapp !== undefined && (
            <>
            <input
              type="text"
              value={links.whatsapp}
              onChange={(e) => updateValue("whatsapp", formatWhatsapp(e.target.value))}
              placeholder="(35) 99999-9999"
              maxLength={15}
            />
            {errors.whatsapp && <span className="error">{errors.whatsapp}</span>}
            </>
          )}
        </div>

        {/* Email */}
        <div className="social-field">
          <label style={{color: links.useAccountEmail ? "#b5b5b5" : "#333"}}>
            <input
              type="checkbox"
              checked={links.email !== undefined}
              onChange={(e) => {
                if (e.target.checked) {
                  setLinks((prev) => ({ ...prev, email: "", useAccountEmail: false }));
                } else {
                  setLinks((prev) => {
                    const { email, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              disabled={!!links.useAccountEmail} // desativa se estiver usando email da conta
            />
            <MdEmail style={{ marginLeft: 8, marginRight: 8,
              color: links.useAccountEmail ? "#b5b5b5" : "#555"
              }} /> Email
          </label>
          {links.email !== undefined && (
            <>
              <input
                type="text"
                value={links.email}
                onChange={(e) => updateValue("email", e.target.value)}
                placeholder="seu@email.com"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </>
          )}
        </div>

        {/* Instagram */}
        <div className="social-field">
          <label>
            <input
              type="checkbox"
              checked={links.instagram !== undefined}
              onChange={(e) => toggleField("instagram", e.target.checked)}
            />
            <FaInstagram style={{ marginLeft: 8, marginRight: 8 }} /> Instagram
          </label>
          {links.instagram !== undefined && (
            <>
              <input
                type="text"
                value={links.instagram}
                onChange={(e) => updateValue("instagram", e.target.value)}
                placeholder="http://instagram.com/seu-usuario"
              />
              {errors.instagram && <span className="error">{errors.instagram}</span>}
            </>
          )}
        </div>

        {/* Facebook */}
        <div className="social-field">
          <label>
            <input
              type="checkbox"
              checked={links.facebook !== undefined}
              onChange={(e) => toggleField("facebook", e.target.checked)}
            />
            <FaFacebook style={{ marginLeft: 8, marginRight: 8 }} /> Facebook
          </label>
          {links.facebook !== undefined && (
            <>
              <input
                type="text"
                value={links.facebook}
                onChange={(e) => updateValue("facebook", e.target.value)}
                placeholder="http://facebook.com/seu-perfil"
              />
              {errors.facebook && <span className="error">{errors.facebook}</span>}
            </>
          )}
        </div>

        {/* LinkedIn */}
        <div className="social-field">
          <label>
            <input
              type="checkbox"
              checked={links.linkedin !== undefined}
              onChange={(e) => toggleField("linkedin", e.target.checked)}
            />
            <FaLinkedin style={{ marginLeft: 8, marginRight: 8 }} /> LinkedIn
          </label>
          {links.linkedin !== undefined && (
            <>
              <input
                type="text"
                value={links.linkedin}
                onChange={(e) => updateValue("linkedin", e.target.value)}
                placeholder="http://linkedin.com/in/seu-perfil"
              />
              {errors.linkedin && <span className="error">{errors.linkedin}</span>}
            </>
          )}
        </div>

        <hr style={{ margin: "16px 0" }} />

        {/* Usar o mesmo email da conta (somente email) */}
        <div className="social-field">
          <label style={{color: links.email !== undefined ? "#b5b5b5" : "#1d1d1f" }}>
            <input
              type="checkbox"
              checked={!!links.useAccountEmail}
              onChange={(e) => {
                if (e.target.checked) {
                  setLinks((prev) => {
                    const { email, ...rest } = prev;
                    return { ...rest, useAccountEmail: true };
                  });
                } else {
                  setLinks((prev) => ({ ...prev, useAccountEmail: false }));
                }
              }}
              disabled={links.email !== undefined} // desativa se o email estiver ativo
            />
            Usar o mesmo email da conta
          </label>
        </div>

        <div className="edit-actions">
          <button className="save-btn" onClick={handleSave}>
            Salvar
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>

      </div>
    </div>
    <ErrorPopup onClose={()=>setErrorPopup(null)} isOpen={errorPopup? true : false} statusCode={errorPopup ?? undefined}/>
    </>
  );
};

export default SocialLinksModal;
