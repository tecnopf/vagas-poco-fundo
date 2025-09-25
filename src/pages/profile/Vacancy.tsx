// src/components/profile/VacancyList.tsx
import React, { useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import "./Vacancy.scss";
import { CustomSelect } from "../../components/select/CustomSelect";
import Switcher1 from "../../components/ToggleSwitch";
import { useProfile } from "../../cached-requests/getProfile";
import { FaHouseUser } from "react-icons/fa";
import Toast from "../../components/toast/Toast";
import { ImSpinner9 } from "react-icons/im";

interface Job {
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
  link?: string
}

const initialJobs: Job[] = [
  {
    id: 1,
    title: "Caixa de Supermercado",
    description: "Atendimento no caixa e organização do supermercado",
    status: "opened",
    totalVacancies: 5,
    remainingVacancies: 4,
    expiration: "2025-09-25",
    educationLevel: "fundamental",
    workingHoursPerDay: 8,
    createdDate: "2025-09-10 10:30:00",
    link: "https://google.com"
  },
  {
    id: 2,
    title: "Atendente de Restaurante",
    description: "Servir clientes e auxiliar na organização do salão",
    status: "opened",
    totalVacancies: 3,
    remainingVacancies: 1,
    expiration: null,
    educationLevel: "middle",
    workingHoursPerDay: 6,
    createdDate: "2025-09-10 09:30:00",
  },
  {
    id: 3,
    title: "Assistente Administrativo",
    description: "Suporte administrativo e organização de documentos",
    status: "filled",
    totalVacancies: 2,
    remainingVacancies: 0,
    expiration: "2025-09-20",
    educationLevel: "higher",
    workingHoursPerDay: 8,
    createdDate: "2025-09-08 07:00:00",
  },
];

type Props = { onProfileClick?: () => void };

const VacancyList: React.FC<Props> = ({ onProfileClick }) => {
  const [vacancy, setVacancy] = useState<Job[]>(initialJobs);
  const [flashError, setFlashError] = useState<number | null>(null); // id flashing
  const [editingJob, setEditingJob] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Job>>({});
  //const [enabled, setEnabled] = useState(false)
  const { data } = useProfile()
  const [saving, setSaving] = useState(false);


  const startEditing = (job: Job) => {
    setEditingJob(job.id);
    setDraft({ ...job });
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setDraft({});
  };

  const saveEditing = async() => {
    if (editingJob == null) return;
    setSaving(true);
    await new Promise(resolve=>setTimeout(resolve,3000))

    setVacancy((prev) =>
      prev.map((j) =>
        j.id === editingJob
          ? ({
              ...j,
              ...draft,
              totalVacancies: Number(draft.totalVacancies ?? j.totalVacancies),
              remainingVacancies: Number(draft.remainingVacancies ?? j.remainingVacancies),
              workingHoursPerDay: Number(draft.workingHoursPerDay ?? j.workingHoursPerDay),
            } as Job)
          : j
      )
    );
    setEditingJob(null);
    setDraft({});
    setSaving(false);
  };

  const updateDraft = (field: keyof Job, value: any) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const flash = (id: number) => {
    setFlashError(id);
    setTimeout(() => setFlashError(null), 600);
  };

  const updateVacancy = (
    jobId: number,
    field: "totalVacancies" | "remainingVacancies",
    delta: number
  ) => {
    const job = vacancy.find((j) => j.id === jobId);
    if (!job) return;

    if (editingJob !== jobId) {
      setEditingJob(jobId);
      setDraft({ ...job });
    }

    setDraft((prev) => {
      let newDraft = { ...prev };
      const baseTotal = Number(prev.totalVacancies ?? job.totalVacancies);
      const baseRemaining = Number(prev.remainingVacancies ?? job.remainingVacancies);

      if (field === "remainingVacancies") {
        const newRemaining = Math.max(0, baseRemaining + delta);
        if (newRemaining > baseTotal) {
          flash(jobId);
          return prev;
        }
        newDraft.remainingVacancies = newRemaining;

        if (newRemaining === 0) newDraft.status = "filled";
        else if (newRemaining > 0 && newDraft.status !== "closed") newDraft.status = "opened";
      }

      if (field === "totalVacancies") {
        const newTotal = Math.max(0, baseTotal + delta);
        newDraft.totalVacancies = newTotal;
        newDraft.remainingVacancies = Math.min(baseRemaining, newTotal);

        if (baseRemaining > newTotal) flash(jobId);
      }

      return newDraft;
    });
  };

  const updateStatus = (jobId: number, status: Job["status"]) => {
    const job = vacancy.find((j) => j.id === jobId);
    if (!job) return;

    if (editingJob !== jobId) setEditingJob(jobId);

    setDraft((prev) => {
      let newDraft = { ...prev, status };

      if (status === "filled") newDraft.remainingVacancies = 0;
      if (status === "opened" && (prev.remainingVacancies ?? job.remainingVacancies) === 0)
        newDraft.remainingVacancies = 1;

      return newDraft;
    });
  }

  const today = new Date();
  today.setDate(today.getDate() + 5); 
  const dateString = today.toISOString().slice(0, 10);

  return (
    <>
    <div className="vacancy-header">Vagas {data?.name}
      <Toast message="Perfil">
        <FaHouseUser onClick={onProfileClick} id='open-profile-sidebar' />
      </Toast>
    </div>
    <div className="vacancy-list">
      {vacancy.map((v) => {
        const isEditing = editingJob === v.id;
        const data = isEditing ? { ...v, ...draft } : v;
        return (
          <div key={v.id} className="vacancy-card">
            {isEditing && saving && (
                  <div className="card-overlay">
                    <ImSpinner9 className="spinner-icon" />
                  </div>
                )}
            <div className="vacancy-field">
              <strong>Cargo:</strong>
              
              {isEditing ? (
                <input value={String(data.title)} onChange={(e) => updateDraft("title", e.target.value)} />
              ) : (
                <>
                <span className="vacancy-info">{v.title}</span>
                <button onClick={() => startEditing(v)}>
                  <MdModeEditOutline className="edit-icon"/>
                </button>
                </>
              )}
              
            </div>

            <div className="vacancy-field">
              <strong>Descrição:</strong>
              {isEditing ? (
                <textarea value={String(data.description)} onChange={(e) => updateDraft("description", e.target.value)} />
              ) : (
                <>
                <span className="vacancy-info">{v.description}</span>
                <button onClick={() => startEditing(v)}>
                  <MdModeEditOutline className="edit-icon"/>
                </button>
                </>
              )}
              
            </div>

            <div className="vacancy-field">
              <strong>Status:</strong>
              {isEditing ? (
                <CustomSelect<"opened" | "closed" | "filled" | "expired">
                  customClass="vacancy-select"
                  
                  options={["opened", "closed", "filled", "expired"]}
                  value={data.status}
                  onChange={(val) => updateStatus(v.id, val)}
                  getLabel={(val) => {
                    switch(val) {
                      case "opened": return "Aberta";
                      case "closed": return "Fechada";
                      case "filled": return "Preenchida";
                      case "expired": return "Expirada";
                    }
                  }}
                  placeholder="Selecione o status"
                />
              ) : (
                <>
                <span className="vacancy-info">{v.status === "opened" ? "Aberta" : "Fechada"}</span>
                  <button onClick={() => startEditing(v)}>
                  <MdModeEditOutline className="edit-icon"/>
                </button>
                </>
              )}
              
            </div>

            <div className="vacancy-field">
              <strong>Educação:</strong>
              {isEditing ? (
                <CustomSelect<"none" | "fundamental" | "middle" | "higher" | "incompleteHigher">
                  customClass="vacancy-select"
                  options={["none", "fundamental", "middle", "higher", "incompleteHigher"]}
                  value={data.educationLevel} 
                  onChange={(val) => updateDraft("educationLevel", val)}
                  getLabel={(val) => {
                    switch (val) {
                      case "none": return "Não necessário";
                      case "fundamental": return "Ensino Fundamental";
                      case "middle": return "Ensino Médio";
                      case "higher": return "Ensino Superior";
                      case "incompleteHigher": return "Ensino Superior aceitando incompleto";
                    }
                  }}
                  placeholder="Select education level"
                />
              ) : (
                <>
                <span className="vacancy-info">{v.educationLevel}</span>
                <button onClick={() => startEditing(v)}>
                  <MdModeEditOutline className="edit-icon"/>
                </button>
                </>
              )}
              
            </div>

            <div className="vacancy-field">
              <strong>Horas/dia:</strong>
              {isEditing ? (
                <>
                
                <input
                  type="number"
                  value={Number(data.workingHoursPerDay)}
                  onChange={(e) => updateDraft("workingHoursPerDay", Number(e.target.value))}
                />
                </>
              ) : (
                <>
                <span className="vacancy-info">{v.workingHoursPerDay}</span>
                  <button onClick={() => startEditing(v)}>
                  <MdModeEditOutline className="edit-icon"/>
                </button>
                </>
              )}
              
            </div>

            <div className="vacancy-field" style={{minHeight: 40}}>
              <Toast message="Deixe desativado se sua vaga não for temporária" position="left">
              <strong>Expiração:</strong>
              </Toast>
              {isEditing ? (
              <>
                <div style={{marginLeft: 15}}></div>
                <Switcher1
                  isChecked={Boolean(data.expiration)}
                  onChange={(val) => updateDraft("expiration", val ? data.expiration ?? dateString : null)}
                />
                {data.expiration ? (
                  <input
                    type="date"
                    value={data.expiration}
                    onChange={(e) => updateDraft("expiration", e.target.value || null)}
                  />
                ) : (
                  <p style={{ marginLeft: 15 }}>Sem expiração</p>
                )}
              </>
            ) : (
              <>
              <span className="vacancy-info">{v.expiration ?? "Sem prazo"}</span>
              <button onClick={() => startEditing(v)}>
                <MdModeEditOutline className="edit-icon"/>
              </button>
              </>
            )}

            
              
            </div>

            <div className="vacancy-field">
              <Toast message="Deixe um link para redirecionar no botão de Ver Mais" position="left">
              <strong>Link:</strong>
              </Toast>
              {isEditing? <>
              <input
                type="text"
                value={data.link ?? ""}
                onChange={(e) => updateDraft("link", e.target.value)}
                placeholder="https://"
              />
              </> : <>
              <span className="vacancy-info">{v.link ?? "Sem redirecionamento"}</span>
              <button onClick={() => startEditing(v)}>
                <MdModeEditOutline className="edit-icon"/>
              </button>
               
              </>}
             
            </div>
          

            <div className="up-down-wrapper">
              <div className={`vacancy-field ${flashError === v.id ? "flash-error" : ""}`}>
                <strong style={{color: 'black'}}>Vagas Totais:</strong>
                <div className="vacancy-control">
                  <div className="up-down-buttons">
                    <button onClick={() => updateVacancy(v.id, "totalVacancies", 1)}>
                      <IoIosArrowUp className={`up-down-icon ${flashError === v.id ? "flash-error" : ""}`} />
                    </button>
                    <span>{data.totalVacancies}</span>
                    <button onClick={() => updateVacancy(v.id, "totalVacancies", -1)}>
                      <IoIosArrowDown className={`up-down-icon ${flashError === v.id ? "flash-error" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="vacancy-field">
                <strong style={{color: 'black'}}>Vagas Disponíveis:</strong>
                <div className="vacancy-control">
                  <div className="up-down-buttons">
                    <button onClick={() => updateVacancy(v.id, "remainingVacancies", 1)}>
                      <IoIosArrowUp className={`up-down-icon`} />
                    </button>
                    <span>{data.remainingVacancies}</span>
                    <button onClick={() => updateVacancy(v.id, "remainingVacancies", -1)}>
                      <IoIosArrowDown className={`up-down-icon`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="edit-actions">
                <button className="save-btn" onClick={saveEditing}>
                  Salvar
                </button>
                <button className="cancel-btn" onClick={cancelEditing}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
    </>
  );
};

export default VacancyList;
