// src/components/JobList.tsx
import React, { useState } from "react";
import "./Joblist.scss";
import { CustomSelect } from "../../components/select/CustomSelect";

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
  },
  {
    id: 2,
    title: "Atendente de Restaurante",
    description: "Servir clientes e auxiliar na organização do salão",
    establishment: "Restaurante Sabor & Cia",
    status: "opened",
    totalVacancies: 3,
    remainingVacancies: 1,
    expiration: "2025-09-22",
    educationLevel: "Ensino Fundamental",
    workingHoursPerDay: 6,
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
  },
];

const JobList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<"all" | "opened" | "filled">("all");
  const [sortByVacancies, setSortByVacancies] = useState<"asc" | "desc">("desc");
  const [educationFilter, setEducationFilter] = useState<EducationLevel | "all">("all");
  const [hoursFilter, setHoursFilter] = useState<number | "all">("all");

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
    .sort((a, b) =>
      sortByVacancies === "desc"
        ? b.remainingVacancies - a.remainingVacancies
        : a.remainingVacancies - b.remainingVacancies
    );

  return (
    <section id="vagas" className="job-list">
      <h2>Vagas Disponíveis</h2>

      <div className="filters">
        <CustomSelect<"all" | "opened" | "filled">
          options={["all", "opened", "filled"]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Todos os status"
          getLabel={(val:  "all" | "opened" | "filled") =>
            val === "all" ? "Todos os status" : val === "opened" ? "Aberta" : "Preenchida"
          }
        />
        

        <CustomSelect<"asc" | "desc">
          options={["asc", "desc"]}
          value={sortByVacancies}
          onChange={setSortByVacancies}
          placeholder="Ordem de vagas"
          getLabel={(val: 'asc' | 'desc') =>
            val === "asc"
              ? "Vagas restantes crescente"
              : "Vagas restantes decrescente"
          }
        />

        <CustomSelect<EducationLevel | "all">
          options={["all", ...educationLevels]}
          value={educationFilter}
          onChange={setEducationFilter}
          placeholder="Todos os níveis"
        />

        <CustomSelect<number | "all">
          options={["all", 6, 8]}
          value={hoursFilter}
          onChange={(val: 'all' | number) => setHoursFilter(val === "all" ? "all" : Number(val))}
          placeholder="Todas as cargas horárias"
          getLabel={(val: 'all' | number) => (val === "all" ? "Todas as cargas horárias" : `${val}h/dia`)}
        />
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
              <p className="establishment">{job.establishment}</p>
              <p>
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
              <p>Expiração: {job.expiration || "Não informado"}</p>
              <p>Nível de Escolaridade: {job.educationLevel}</p>
              <p>Horas de Trabalho: {job.workingHoursPerDay}h/dia</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default JobList;
