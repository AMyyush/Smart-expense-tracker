import { useState } from "react";

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

export default function Filters({ filters, onChange, theme: t }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const selectStyle = {
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${t?.border || "#111"}`,
    fontSize: "14px",
    background: t?.inputBg || "#000",
    color: t?.inputColor || "#fff",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
      {/* Category Filter */}
      <select
        name="category"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        style={selectStyle}
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Month Filter */}
      <select
        value={filters.month || ""}
        onChange={(e) =>
          onChange({
            ...filters,
            month: e.target.value,
            year: filters.year || currentYear,
          })
        }
        style={selectStyle}
      >
        <option value="">All Months</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      {/* Year Filter */}
      <select
        value={filters.year || ""}
        onChange={(e) =>
          onChange({ ...filters, year: e.target.value })
        }
        style={selectStyle}
      >
        <option value="">All Years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* Clear Button */}
      {(filters.category || filters.month || filters.year) && (
        <button
          onClick={() => onChange({ category: "", month: "", year: "" })}
          style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: `1px solid ${t?.label || "#ef4444"}`,
              background: t?.btnBg || "#ffffff",
              color: t?.btnText || "#ef4444",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}