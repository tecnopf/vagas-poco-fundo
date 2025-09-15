import  { useState, useRef, useEffect } from "react";
import "./CustomSelect.scss";

interface CustomSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (val: T) => void;
  placeholder?: string;
  getLabel?: (val: T) => string;
}

export function CustomSelect<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = "Select",
  getLabel = (val) => String(val),
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      <button className="select-btn" onClick={() => setOpen((o) => !o)}>
        {value ? getLabel(value) : placeholder}
        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </button>
      {open && (
        <ul className="select-options">
          {options.map((opt) => (
            <li
              key={String(opt)}
              className={opt === value ? "selected" : ""}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {getLabel(opt)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
