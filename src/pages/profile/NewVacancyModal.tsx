import React, { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { CustomSelect } from "../../components/select/CustomSelect";
import Switcher1 from "../../components/ToggleSwitch";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newJob: Job) => void;
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
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    if (isOpen) {
      setError(null);      
    }
  }, [isOpen]);

  if (!isOpen) return null;



  const update = (field: keyof Job, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (form.link && form.link.trim() !== "" && !form.link.startsWith("https://")) {
      setError("O link deve começar com https://");
      return;
    }
    if (!form.remainingVacancies || form.remainingVacancies < 1) {
      setError("O número de vagas deve ser no mínimo 1");
      return;
    }
    if (form.expiration) {
      const expDate = new Date(form.expiration);
      const now = new Date();
      if (expDate <= now) {
        setError("A data de expiração deve ser no futuro");
        return;
      }
    }

    setError(null);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500)); // simula API
    const newJob: Job = {
      ...(form as Job),
      id: Date.now(),
      status: "opened",
      createdDate: new Date().toISOString(),
      totalVacancies: Number(form.totalVacancies ?? 1),
      remainingVacancies: Number(form.remainingVacancies ?? 1),
      workingHoursPerDay: Number(form.workingHoursPerDay ?? 8),
    };
    onSave(newJob);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content new-vacancy">
        {saving && (
          <div className="card-overlay">
            <ImSpinner9 className="spinner-icon" />
          </div>
        )}

        <h2>Criar nova vaga</h2>

        {error && <p className="form-error">{error}</p>}

        <div className="vacancy-field">
          <strong>Cargo:</strong>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div className="vacancy-field">
          <strong>Descrição:</strong>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="vacancy-field">
          <strong>Educação:</strong>
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
                case "incompleteHigher": return "Ensino Superior Completo/Incompleto";
              }
            }}
            placeholder="Selecione"
          />
        </div>

        <div className="vacancy-field">
          <strong>Horas/dia:</strong>
          <input
            type="number"
            min={1}
            max={24}
            value={form.workingHoursPerDay}
            onChange={(e) => update("workingHoursPerDay", Number(e.target.value))}
          />
        </div>

        <div className="vacancy-field" style={{minHeight: 26}}>
          <strong>Expiração:</strong>
          <div style={{marginLeft: 15}}></div>
          <Switcher1
            isChecked={Boolean(form.expiration)}
            onChange={(val) =>
              update("expiration", val ? new Date().toISOString().slice(0, 10) : null)
            }
          />
          {form.expiration && (
            <input
              type="date"
              value={form.expiration}
              onChange={(e) => update("expiration", e.target.value || null)}
            />
          )}
        </div>

        <div className="vacancy-field">
          <strong>Link:</strong>
          <input
            type="text"
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            placeholder="https://link-para-seu-post"
          />
        </div>

        <div className="vacancy-field">
          <strong>Vagas:</strong>
          
          <input
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
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VacancyModal;
