// src/components/profile/VacancyList.tsx
import React, { useEffect, useRef, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowUp, IoIosArrowDown, IoIosAddCircle } from "react-icons/io";
import "./Vacancy.scss";
import { CustomSelect } from "../../components/select/CustomSelect";
import Switcher1 from "../../components/ToggleSwitch";
import { useProfile } from "../../cached-requests/getProfile";
import { FaHouseUser } from "react-icons/fa";
import Toast from "../../components/toast/Toast";
import { ImSpinner9 } from "react-icons/im";
import { useVacancy } from "../../cached-requests/getVacanciesByEstablishment";
import { API_URL } from "../../configs";
import ErrorPopup from "../../components/error-popup/ErrorPopup";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";
import { HiTrash } from "react-icons/hi";
import { useQueryClient } from "@tanstack/react-query";
import { getStatusLabel } from "../../utils/getStatusLabel";

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


type Props = { onProfileClick?: () => void, onGetStartedClick?: ()=> void };

const VacancyList: React.FC<Props> = ({ onProfileClick, onGetStartedClick }) => {
  const [vacancy, setVacancy] = useState<Job[]>();
  const {data: vacancyData, isFetching} = useVacancy()
  const [flashError, setFlashError] = useState<number | null>(null);
  const [editingJob, setEditingJob] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Job>>({});
  const { data } = useProfile()
  const [saving, setSaving] = useState(false);
  const { token } = useAuth()
  const [errorPopupOpen, setErrorPopupOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);
  const [deletingVacancy, setDeletingVacancy] = useState(false)

  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  const [showConfirm, setShowConfirm] = useState<number | null>(null);

 
  useEffect(() => {
    if (!vacancy || cardsRef.current.length === 0 || isFetching) return;

    const elements = cardsRef.current.filter(Boolean); 

    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "power2.out", delay: 0.3 }
    );
  }, [vacancy]);
  

  useEffect(() => {
    if (vacancyData) {
      const translated = vacancyData.map((v: Job) => ({
        ...v,
        expiration: v.expiration ? new Date(v.expiration).toISOString().slice(0, 10) : null,
      }));
      setVacancy(translated);
    }
  }, [vacancyData])

  const handleDeleteClick = (id: number) => setShowConfirm((prev) => (prev === id ? null : id));
  const handleCancel = () => {
    setShowConfirm(null);
  };

  const queryClient = useQueryClient();

  const handleConfirm = async (id: number) => {
    setDeletingVacancy(true)
    try {
      const res = await fetch(`${API_URL}/api/vacancy/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ jobID: id })
      });

      if (!res.ok) {
        setErrorStatus(res.status);
        setErrorPopupOpen(true);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["vacancy"] });

      setShowConfirm(null);
    } catch (err) {
      console.error("Erro ao excluir vaga:", err);
      setErrorStatus(500);
      setErrorPopupOpen(true);
    } finally {
      setDeletingVacancy(false)
    }
  };


  const startEditing = (job: Job) => {
    setEditingJob(job.id);
    setDraft({ ...job });
  };

  const cancelEditing = () => {
    setEditingJob(null);
    setDraft({});
  };

  const saveEditing = async () => {
    if (editingJob == null) return;
    setSaving(true);

    try {
      const payload: Record<string, any> = { jobId: editingJob };

      Object.entries(draft).forEach(([key, value]) => {
        if (value !== undefined) payload[key] = value;
      });

      if (payload.expiration) {
        const date = new Date(payload.expiration);
        date.setHours(date.getHours() + 3);
        payload.expiration = date.toISOString();
      }

      const res = await fetch(`${API_URL}/api/vacancy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setErrorStatus(res.status ?? 500)
        setErrorPopupOpen(true);
        return
      };

      setVacancy((prev) =>
        prev!.map((j) =>
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
      await queryClient.invalidateQueries({queryKey:['vacancies']})
      await queryClient.refetchQueries({ queryKey: ['vacancies', 0] });
      await queryClient.invalidateQueries({queryKey:['vacancy']})
    } catch (err) {
      console.error(err);
    } finally {
      setEditingJob(null);
      setDraft({});
      setSaving(false);
    }
  };

  const updateDraft = (field: keyof Job, value: any) => {
    setDraft((prev) => {
      let updated = { ...prev, [field]: value };

      if (field === "expiration") {
        if (!value) {
          if ((prev.remainingVacancies ?? 0) > 0) updated.status = "opened";
          else updated.status = "filled";
        } else {
          const expDate = new Date(value);
          const today = new Date();
          if (expDate > today && (prev.status === "expired" || prev.status === undefined)) {
            if ((prev.remainingVacancies ?? 0) > 0) updated.status = "opened";
            else updated.status = "filled";
          }
        }
        updated.expiration = value;
      }

      return updated;
    });
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
    const job = vacancy!.find((j) => j.id === jobId);
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
    const job = vacancy!.find((j) => j.id === jobId);
    if (!job) return;

    if (editingJob !== jobId) setEditingJob(jobId);

    setDraft((prev) => {
      const newDraft = { ...prev, status };
      const now = new Date();
      now.setDate(now.getDate() - 1); 
      const yesterdayISO = now.toISOString().slice(0, 10);

      if (status === "filled") newDraft.remainingVacancies = 0;
      if (status === "opened" && (prev.remainingVacancies ?? job.remainingVacancies) === 0)
        newDraft.remainingVacancies = 1;

      if (status === "expired") {
        if (!job.expiration && !prev.expiration) {
          newDraft.expiration = yesterdayISO;
        } else {
          newDraft.expiration = yesterdayISO;
        }
      }
      if (status !== "expired" && prev.expiration) {
        const expDate = new Date(prev.expiration);
        const today = new Date();
        if (expDate > today && (prev.status === "expired" || job.status === "expired")) {
          newDraft.status = "opened";
        }
      }

      return newDraft;
    });
  };

  const today = new Date();  
  today.setDate(today.getDate() + 5); 
  const dateString = today.toISOString().slice(0, 10);  

  if(isFetching) {
    return (
    <div style={{minHeight: 'calc(100vh - 92px)'}}>
      <div className="vacancy-header" ref={titleRef}>Vagas {data?.name}
        <Toast message="Perfil">
          <FaHouseUser onClick={onProfileClick} id='open-profile-sidebar' />
        </Toast>
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1em'}}>
        <ImSpinner9 className="spinner-icon" />

      </div>
      
    </div>
    )
  }

  return (
    <div style={{minHeight: 'calc(100vh - 92px)'}}>
    <div className="vacancy-header" ref={titleRef}>Vagas {data?.name}
      <Toast message="Perfil">
        <FaHouseUser onClick={onProfileClick} id='open-profile-sidebar' />
      </Toast>
    </div>
    {!vacancy || vacancy.length === 0 && (
        <div className="no-vacancy-message" style={{display: 'flex', marginTop: '5em', flexDirection: 'column', alignItems: 'center'}}>
          <p style={{fontFamily: 'SF-Bold'}}>Sem vagas por enquanto.</p>
          <p style={{fontFamily: 'SF-Bold'}}>Crie sua primeira vaga para começar!</p>
          <div style={{padding: 5, marginTop: 10, cursor: 'pointer'}} onClick={onGetStartedClick}>
            <IoIosAddCircle style={{width: 60, height: 60}} />
          </div>
        </div>
      )}
    <div className="vacancy-list">
      {vacancy && vacancy.map((v,i) => {
          const isEditing = editingJob === v.id;
          const data = isEditing ? { ...v, ...draft } : v;
          
          return (
            <div key={v.id} className="vacancy-card" ref={(el) => {
        cardsRef.current[i] = el!; 
      }}>
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

              {!isEditing && (
                <div className="delete-vacancy" >
                  <HiTrash  className="delete-vacancy-icon" onClick={()=>handleDeleteClick(v.id)}/>
                  {showConfirm === v.id  && (
                    <div
                      className="delete-confirm-modal"
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        borderRadius: '10px',
                        background: "white",
                        cursor: 'auto',
                        border: "1px solid #ccc",
                        padding: "0.5rem 1rem",
                        zIndex: 10,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              
                      }}
                    >
                      <p>Excluir vaga?</p>
                      <div style={{ display: "flex", zIndex: 10, gap: "0.5rem", marginTop: "0.25rem" }}>
                        <button disabled={deletingVacancy} style={{pointerEvents: 'all'}} onClick={()=>handleCancel()}>Cancelar</button>
                        {deletingVacancy ? <ImSpinner9 className="spinner-icon" style={{width: 20, height: 20}} /> : 
                        <button style={{pointerEvents: 'all', color: 'red'}} onClick={()=>handleConfirm(v.id)}>Excluir</button>
                        }
                        
                    
                      </div>
                    </div>
                  )}
                </div> 
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
                  getLabel={getStatusLabel}
                  placeholder="Selecione o status"
                />
              ) : (
                <>
                <span className="vacancy-info">{getStatusLabel(v.status)}</span>
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
                <span className="vacancy-info">{(() => {
                  switch (v.educationLevel) {
                    case "none": return "Não necessário";
                    case "fundamental": return "Ensino Fundamental";
                    case "middle": return "Ensino Médio";
                    case "higher": return "Ensino Superior";
                    case "incompleteHigher": return "Ensino Superior completo/incompleto";
                    default: return v.educationLevel;
                  }
                })()}</span>
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
                    className="input-date"
                    value={data.expiration}
                    onChange={(e) => updateDraft("expiration", e.target.value || null)}
                  />
                ) : (
                  <p style={{ marginLeft: 15 }}>Sem expiração</p>
                )}
              </>
            ) : (
              <>
              <span className="vacancy-info">{v.expiration
              ? (() => {
                  const [year, month, day] = v.expiration.split("-").map(Number);
                  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                })()
              : "Sem prazo"}</span>
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
      <ErrorPopup
        isOpen={errorPopupOpen}
        statusCode={errorStatus}
        onClose={() => setErrorPopupOpen(false)}
      />
    </div>
    </div>
  );
};

export default VacancyList;
