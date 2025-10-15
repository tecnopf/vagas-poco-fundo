import React, { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { CustomSelect } from "../../components/select/CustomSelect";
import Switcher1 from "../../components/ToggleSwitch";
import { API_URL } from "../../configs";
import { useAuth } from "../../context/AuthContext";
import ErrorPopup from "../../components/error-popup/ErrorPopup";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  status: "opened" | "closed" | "filled" | "expired";
  totalVacancies: number;
  remainingVacancies: number;
  expiration: string | null;
  educationLevel: "none" | "fundamental" | "middle" | "higher" | "incompleteHigher";
  workingHoursPerDay: number;
  createdDate: string;
  link?: string;
}

const VacancyModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Job>>({
    title: "",
    description: "",
    totalVacancies: 1,
    remainingVacancies: 1,
    expiration: null,
    educationLevel: "none",
    workingHoursPerDay: 8,
    link: "",
  });
  const [saving, setSaving] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ open: boolean; status?: number; message?: string }>({
    open: false,
  });
  const { token } = useAuth();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const update = (field: keyof Job, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const showError = (message?: string, status?: number) => {
    setErrorPopup({ open: true, message, status });
  };

  const handleSave = async () => {
    if (!form.title) return showError("Título é obrigatório");
    if (form.link && form.link.trim() !== "" && !form.link.startsWith("https://"))
      return showError("O link deve começar com https://");
    if (!form.remainingVacancies || form.remainingVacancies < 1)
      return showError("O número de vagas deve ser no mínimo 1");
    if (form.expiration) {
      const expDate = new Date(form.expiration);
      const now = new Date();
      if (expDate <= now) return showError("A data de expiração deve ser no futuro");
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/vacancy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          totalVacancies: form.remainingVacancies,
          remainingVacancies: form.remainingVacancies,
          expiration: form.expiration? new Date(form.expiration).toISOString(): null,
          educationLevel: form.educationLevel,
          workingHoursPerDay: form.workingHoursPerDay,
          link: form.link,
        }),
      });

      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Não autorizado"
            : res.status === 400
            ? "Dados inválidos"
            : "Erro ao salvar vaga";
        throw { status: res.status, message: msg };
      }

      await res.json();
      await queryClient.invalidateQueries({queryKey:['vacancies']})
      await queryClient.refetchQueries({ queryKey: ['vacancies', 0] });
      await queryClient.invalidateQueries({ queryKey: ["vacancy"] });
      onSave();
      onClose();
    } catch (err: any) {
      console.error(err);
      showError(err.message || "Erro inesperado", err.status);
    } finally {
      setSaving(false);
    }
  };

  const minDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  })();

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content new-vacancy">
          {saving && (
            <div className="card-overlay">
              <ImSpinner9 className="spinner-icon" />
            </div>
          )}

          <h2>Criar nova vaga</h2>

          <div className="vacancy-field">
            <label htmlFor="vacancy-title"><strong>Cargo:</strong></label>
            <input id="vacancy-title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>

          <div className="vacancy-field">
            <label htmlFor="vacancy-description"><strong>Descrição:</strong></label>
            <textarea id="vacancy-description" value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>

          <div className="vacancy-field">
            <label ><strong>Educação:</strong></label>
            <CustomSelect<"none" | "fundamental" | "middle" | "higher" | "incompleteHigher">
              customClass="vacancy-select"
              options={["none", "fundamental", "middle", "higher", "incompleteHigher"]}
              value={form.educationLevel ?? "none"}
              onChange={(val) => update("educationLevel", val)}
              getLabel={(val) => {
                switch (val) {
                  case "none": return "Não necessário";
                  case "fundamental": return "Ensino Fundamental";
                  case "middle": return "Ensino Médio";
                  case "higher": return "Ensino Superior";
                  case "incompleteHigher": return "Ensino Superior Incompleto";
                }
              }}
            />
          </div>

          <div className="vacancy-field">
            <label htmlFor="vacancy-hours"><strong>Horas/dia:</strong></label>
            <input id="vacancy-hours" type="number" min={1} max={24} value={form.workingHoursPerDay} onChange={(e) => update("workingHoursPerDay", Number(e.target.value))} />
          </div>

          <div className="vacancy-field" style={{ minHeight: 26 }}>
            <label ><strong>Expiração:</strong></label>
            <div style={{ marginLeft: 15 }}></div>
            <Switcher1
              isChecked={Boolean(form.expiration)}
              onChange={(val) => {
                if (val) {
                  const date = new Date();
                  date.setDate(date.getDate() + 5);
                  update("expiration", date.toISOString().slice(0, 10));
                } else {
                  update("expiration", null);
                }
              }}
            />
            {form.expiration && (
              <input
                id="vacancy-expiration"
                type="date"
                value={form.expiration}
                min={minDate}
                onChange={(e) => update("expiration", e.target.value || null)}
              />
            )}
          </div>

          <div className="vacancy-field">
            <label htmlFor="vacancy-link"><strong>Link:</strong></label>
            <input
              id="vacancy-link"
              type="text"
              value={form.link}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://link-para-seu-post"
            />
          </div>

          <div className="vacancy-field">
            <label htmlFor="vacancy-remaining"><strong>Vagas:</strong></label>
            <input
              id="vacancy-remaining"
              min={1}
              type="number"
              value={form.remainingVacancies}
              onChange={(e) => update("remainingVacancies", Number(e.target.value))}
            />
          </div>

          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              Salvar
            </button>
            <button  className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <ErrorPopup
        nestedModal
        isOpen={errorPopup.open}
        statusCode={errorPopup.status}
        message={errorPopup.message}
        onClose={() => setErrorPopup({ open: false })}
      />
    </>
  );
};

export default VacancyModal;
