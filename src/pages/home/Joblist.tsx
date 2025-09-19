// src/components/JobList.tsx
import React, { useState } from "react";
import "./Joblist.scss";
import { CustomSelect } from "../../components/select/CustomSelect";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { MdStore } from "react-icons/md";
import { MdSchool } from "react-icons/md";
import { useIsMobile } from "../../hooks/UseIsMobile";
import { IoIosArrowDown } from "react-icons/io";


type EducationLevel = "Ensino Fundamental" | "Ensino Médio" | "Ensino Superior";

interface Job {
  id: number;
  title: string;
  description: string;
  establishment: string;
  status: "opened" | "filled";
  totalVacancies: number;
  remainingVacancies: number;
  expiration: string | null;
  educationLevel: EducationLevel;
  workingHoursPerDay: number;
  createdDate: string
}

const educationLevels: EducationLevel[] = [
  "Ensino Fundamental",
  "Ensino Médio",
  "Ensino Superior",
];

const jobs: Job[] = [
  {
    id: 1,
    title: "Caixa de Supermercado",
    description: "Atendimento no caixa e organização do supermercado",
    establishment: "Supermercado Ferreira",
    status: "opened",
    totalVacancies: 5,
    remainingVacancies: 4,
    expiration: "2025-09-25",
    educationLevel: "Ensino Médio",
    workingHoursPerDay: 8,
    createdDate: "2025-09-10 10:30:00"
  },
  {
    id: 2,
    title: "Atendente de Restaurante",
    description: "Servir clientes e auxiliar na organização do salão",
    establishment: "Restaurante Sabor & Cia",
    status: "opened",
    totalVacancies: 3,
    remainingVacancies: 1,
    expiration: null,
    educationLevel: "Ensino Fundamental",
    workingHoursPerDay: 6,
    createdDate: "2025-09-10 09:30:00"
  },
  {
    id: 3,
    title: "Assistente Administrativo",
    description: "Suporte administrativo e organização de documentos",
    establishment: "Escritório Central",
    status: "filled",
    totalVacancies: 2,
    remainingVacancies: 0,
    expiration: "2025-09-20",
    educationLevel: "Ensino Superior",
    workingHoursPerDay: 8,
    createdDate: "2025-09-08 07:00:00",
  },
];

const formatDateBR = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // mês começa do 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


//import ShinyText from "../../components/shiny-text/ShinyText";

import ShinyText from "../../components/ShinyText";


const JobList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "opened" | "filled">("all");
  const [sortByVacancies, setSortByVacancies] = useState<"asc" | "desc" | 'recent'| 'old'>("recent");
  const [educationFilter, setEducationFilter] = useState<EducationLevel | "all">("all");
  const [hoursFilter, setHoursFilter] = useState<number | "all">("all");
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const getBarColor = (remaining: number, total: number) => {
    const percent = remaining / total;
    if (percent > 0.5) return "#28a745";
    if (percent > 0.2) return "#ffc107";
    return "#dc3545";
  };

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

  //return null

  return (
    <section id="vagas" className="job-list">
      <ShinyText 
        text="Vagas Disponíveis" 
        disabled={false} 
        speed={3} 
        className='h2' 
      />
      <div className={`filters-wrapper ${isMobile ? "mobile" : ""}`}>
        {isMobile && (
          <button
            className="filters-toggle"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <IoIosArrowDown
              className={`arrow ${filtersOpen ? "open" : ""}`}
            />
          </button>
        )}

        <div className={`filters ${filtersOpen || !isMobile ? "open" : ""}`}>
          <CustomSelect<"all" | "opened" | "filled">
            options={["all", "opened", "filled"]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Todos os status"
            getLabel={(val:  "all" | "opened" | "filled") =>
              val === "all" ? "Todos os status" : val === "opened" ? "Aberta" : "Preenchida"
            }
          />
          

          <CustomSelect<"asc" | "desc" | 'recent'| 'old'>
            options={['recent', 'old', "asc", "desc"]}
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

          <CustomSelect<EducationLevel | "all">
            options={["all", ...educationLevels]}
            value={educationFilter}
            onChange={setEducationFilter}
            placeholder="Todos os níveis"
            getLabel={(val)=>val === "all" ? "Todos os níveis" : val}
          />

          <CustomSelect<number | "all">
            options={["all", 3,4,5,6,7,8,9,10]}
            value={hoursFilter}
            onChange={(val: 'all' | number) => setHoursFilter(val === "all" ? "all" : Number(val))}
            placeholder="Todas as cargas horárias"
            getLabel={(val: 'all' | number) => (val === "all" ? "Todas as cargas horárias" : `${val}h/dia`)}
          />
        </div>
      </div>

      <ul>
        {filteredJobs.map((job) => {
          const filledPercentage = Math.round(
            ((job.totalVacancies - job.remainingVacancies) / job.totalVacancies) * 100
          );
          return (
            <li key={job.id} className={`job-item ${job.status}`}>
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className={`status ${job.status}`}>
                  {job.status === "opened" ? "Aberta" : "Preenchida"}
                </span>
              </div>
              <p className="description">{job.description}</p>
              <div className="companyWrapper">
                <MdStore className="companyIcon" />
                <p className="establishment">{job.establishment}</p>
              </div>
              <p className="vacancy">
                Vagas: {job.remainingVacancies}/{job.totalVacancies}
              </p>
              <div className="vacancy-bar">
                <div
                  className="vacancy-fill"
                  style={{
                    width: `${filledPercentage}%`,
                    backgroundColor: getBarColor(job.remainingVacancies, job.totalVacancies),
                  }}
                ></div>
              </div>
              <div className="icon-text">
                <MdSchool className="icon" />
                <p>{job.educationLevel}</p>
              </div>
              
              <div className="icon-text">
                <MdOutlineAccessTimeFilled className="icon" />
                {job.workingHoursPerDay}h/dia
              </div>

              <button>Ver Mais</button>
              {job.expiration && (
                <>
                <div className="expiration-spacer"></div>
                <p className="expiration">Expiração: {formatDateBR(job.expiration)}</p>
                </>
              )}
              
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default JobList;
