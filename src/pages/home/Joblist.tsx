import React, { useState, type JSX } from "react";
import "./Joblist.scss";
import "./Error.scss"
import { CustomSelect } from "../../components/select/CustomSelect";
import { MdOutlineAccessTimeFilled, MdStore, MdSchool } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { useIsMobile } from "../../hooks/UseIsMobile";
import { useVacancy } from "../../cached-requests/getVacancies";
import ShinyText from "../../components/ShinyText";
import { FaWhatsapp, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { getStatusLabel } from "../../utils/getStatusLabel";
import { ImSpinner9 } from "react-icons/im";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { TbFaceIdError } from "react-icons/tb";
import { IoLogoWhatsapp } from "react-icons/io";
import './Pagination.scss'
import { useAuth } from "../../context/AuthContext";

const formatDateBR = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const JobList: React.FC = () => {
  const [page, setPage] = useState(0);
  const { data, status, isFetching, isPlaceholderData, isError } = useVacancy(page);
  const jobs = data?.jobs ?? [];
  const hasMore = data?.hasMore ?? false;

  const [statusFilter, setStatusFilter] = useState<"all" | "opened" | "filled" | "closed" | "expired">("all");
  const [sortByVacancies, setSortByVacancies] = useState<"asc" | "desc" | "recent" | "old">("recent");
  const [educationFilter, setEducationFilter] = useState<string | "all">("all");
  const [hoursFilter, setHoursFilter] = useState<number | "all">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const [contactsOpen, setContactsOpen] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState<Record<string, string> | null>(null);
  const {authorized} = useAuth()

  const openContacts = (links: Record<string, string>) => {
    setSelectedLinks(links);
    setContactsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeContacts = () => {
    setContactsOpen(false);
    setSelectedLinks(null);
    document.body.style.overflow = "";
  };

  const getBarColor = (remaining: number, total: number) => {
    const percent = remaining / total;
    if (percent > 0.5) return "#28a745";
    if (percent > 0.2) return "#ffc107";
    return "#dc3545";
  };

  if (status === "pending")
    return (
      <div style={{ display: "flex", alignItems: "center", minHeight: 'calc(100vh - 92px)', justifyContent: "center", marginTop: "1em" }}>
        <ImSpinner9 className="spinner-icon" />
      </div>
    );

  if (isError)
    return (
      <div className="fatal-error">
        <p>Erro ao carregar vagas.</p>
        <TbFaceIdError className="fatal-error-icon" />
        <p>Tente novamente mais tarde.</p>
        <p>Se o erro persistir, entre em contato.</p>
        <a href="https://wa.link/h027we" target="_blank"><IoLogoWhatsapp className="whats"/></a>
      </div>
    );

  if (!jobs.length) return <div style={{ display: "flex", fontFamily: 'SF-Bold', marginTop: '3em', flexDirection: 'column', alignItems: "center", minHeight: 'calc(100vh - 92px)',}}>
      <p>Nenhuma vaga por enquanto.</p>
      {authorized? <p>Comece anunciar suas vagas agora mesmo!</p> : 
      <p>Se você tem um estabelecimento crie uma conta agora mesmo para anunciar!</p>
      }
      
    
  </div>

  const filteredJobs = jobs
    .filter((job) => (statusFilter === "all" ? true : job.status === statusFilter))
    .filter((job) => (educationFilter === "all" ? true : job.educationLevel === educationFilter))
    .filter((job) => (hoursFilter === "all" ? true : job.workingHoursPerDay === hoursFilter))
    .sort((a, b) => {
      if (sortByVacancies === "asc") return a.remainingVacancies - b.remainingVacancies;
      if (sortByVacancies === "desc") return b.remainingVacancies - a.remainingVacancies;
      if (sortByVacancies === "recent") return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (sortByVacancies === "old") return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      return 0;
    });

  return (
    <section id="vagas" className="job-list">
      <ShinyText text="Vagas Disponíveis" disabled={false} speed={3} className="h2" />

      <div className={`filters-wrapper ${isMobile ? "mobile" : ""}`}>
        {isMobile && (
          <button className="filters-toggle" onClick={() => setFiltersOpen((o) => !o)}>
            <IoIosArrowDown className={`arrow ${filtersOpen ? "open" : ""}`} />
          </button>
        )}
        <div className={`filters ${filtersOpen || !isMobile ? "open" : ""}`}>
          <CustomSelect
            options={["all", "opened", "filled", "expired", "closed"]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Todos os status"
            getLabel={(val) => getStatusLabel(val)}
          />
          <CustomSelect
            options={["recent", "old", "asc", "desc"]}
            value={sortByVacancies}
            onChange={setSortByVacancies}
            placeholder="Ordem de vagas"
            getLabel={(val) =>
              val === "asc"
                ? "Menos vagas restantes"
                : val === "desc"
                ? "Mais vagas restantes"
                : val === "recent"
                ? "Mais recentes"
                : "Mais antigas"
            }
          />
          <CustomSelect
            options={["all", "none", "fundamental", "middle", "higher", "incompleteHigher"]}
            value={educationFilter}
            onChange={setEducationFilter}
            placeholder="Todos os níveis"
            getLabel={(val) => {
              switch (val) {
                case "all": return "Todos os níveis";
                case "none": return "Sem exigência";
                case "fundamental": return "Ensino Fundamental";
                case "middle": return "Ensino Médio";
                case "higher": return "Ensino Superior";
                case "incompleteHigher": return "Superior completo/incompleto";
                default: return val;
              }
            }}
          />
          <CustomSelect
            options={["all", 3, 4, 5, 6, 7, 8, 9, 10]}
            value={hoursFilter}
            onChange={(val) => setHoursFilter(val === "all" ? "all" : Number(val))}
            placeholder="Carga horária"
            getLabel={(val) => (val === "all" ? "Todas as cargas horárias" : `${val}h/dia`)}
          />
        </div>
      </div>

      <ul>
        {filteredJobs.map((job) => {
          const filledPercentage = Math.round(((job.totalVacancies - job.remainingVacancies) / job.totalVacancies) * 100);
          const hasLinks = job.establishment?.socialLinks && Object.keys(job.establishment.socialLinks).length > 0;

          return (
            <li key={job.id} className={`job-item ${job.status}`}>
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className={`status ${job.status}`}>{getStatusLabel(job.status)}</span>
              </div>

              <p className="description">{job.description}</p>

              <div className="companyWrapper">
                <MdStore className="companyIcon" />
                <p className="establishment">{job.establishment?.name ?? "Estabelecimento não informado"}</p>
              </div>

              <p className="vacancy">Vagas: {job.remainingVacancies}/{job.totalVacancies}</p>

              <div className="vacancy-bar">
                <div
                  className="vacancy-fill"
                  style={{
                    width: `${filledPercentage}%`,
                    backgroundColor: getBarColor(job.remainingVacancies, job.totalVacancies),
                  }}
                />
              </div>

              <div className="icon-text">
                <MdSchool className="icon" />
                <p>
                  {{
                    none: "Sem exigência",
                    fundamental: "Ensino Fundamental",
                    middle: "Ensino Médio",
                    higher: "Ensino Superior",
                    incompleteHigher: "Superior (incompleto aceito)",
                  }[job.educationLevel] || job.educationLevel}
                </p>
              </div>

              <div className="icon-text">
                <MdOutlineAccessTimeFilled className="icon" />
                {job.workingHoursPerDay}h/dia
              </div>

              <div className="job-buttons">
                {hasLinks && (
                  <button className="contacts-btn" onClick={() => openContacts(job.establishment!.socialLinks!)}>
                    Contatos
                  </button>
                )}
                {job.link && (
                  <a href={job.link} target="_blank" rel="noopener noreferrer">
                    <button>Ver Mais</button>
                  </a>
                )}
              </div>

              {job.expiration && (
                <>
                  <div className="expiration-spacer"></div>
                  <p className="expiration">Expira em: {formatDateBR(job.expiration)}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="pagination-controls">
        <div>
          <button className={page > 0 ? "" : "disabled-btn" } onClick={() => setPage((old) => Math.max(old - 1, 0))} disabled={page === 0}>
            <IoIosArrowBack/>
          </button>

        
        {isFetching ? 
          <span style={{display: 'flex', justifyContent: 'center'}}>
            <ImSpinner9 style={{width: 35, height: 35}} className="spinner-icon" />
          </span>
         : 
          <>
            <span>Página {page + 1}</span>
          </>
        }
        
        <button className={hasMore ? "" : "disabled-btn"} onClick={() => setPage((old) => (hasMore ? old + 1 : old))} disabled={isPlaceholderData || !hasMore}>
          <IoIosArrowForward/>
        </button>
        
        </div>
      </div>

      {contactsOpen && selectedLinks && (
        <div className="contacts-overlay" onClick={closeContacts}>
          <div className="contacts-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Contatos</h3>
            <ul className="contacts-list">
              {Object.entries(selectedLinks).map(([key, value]) => {
                const iconMap: Record<string, JSX.Element> = {
                  whatsapp: <FaWhatsapp className="contact-icon whatsapp" />,
                  instagram: <FaInstagram className="contact-icon instagram" />,
                  email: <MdEmail className="contact-icon email" />,
                  facebook: <FaFacebook className="contact-icon facebook" />,
                  linkedin: <FaLinkedin className="contact-icon linkedin" />,
                };

                if (key === "email") {
                  return (
                    <li key={key} className="contact-item">
                      <a href={`mailto:${value}`} target="_blank" rel="noopener noreferrer">
                        {iconMap[key]}
                      </a>
                      <span>{value}</span>
                    </li>
                  );
                }

                return (
                  <li key={key} className="contact-item">
                    <a href={value} target="_blank" rel="noopener noreferrer">
                      {iconMap[key]}
                    </a>
                    <span>{value}</span>
                  </li>
                );
              })}
            </ul>
            <button onClick={closeContacts}>Fechar</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobList;
