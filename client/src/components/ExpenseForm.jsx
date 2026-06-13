import React, { useState } from "react";
import { motion } from "framer-motion";

const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];
const today = new Date().toISOString().split("T")[0];

function simpleCategorize(text) {
  if (!text) return { category: "", score: 0 };
  const t = text.toLowerCase();
  if (/food|lunch|dinner|breakfast|restaurant|cafe|coffee|snack/.test(t)) return { category: "Food", score: 0.9 };
  if (/uber|taxi|bus|metro|transport|flight|train|fuel|petrol|diesel/.test(t)) return { category: "Transport", score: 0.9 };
  if (/rent|bill|electric|utility|water|internet|phone|subscription|bills?/.test(t)) return { category: "Bills", score: 0.9 };
  if (/movie|netflix|concert|game|music|entertain|party|drink/.test(t)) return { category: "Entertainment", score: 0.9 };
  return { category: "Other", score: 0.2 };
}

export default function ExpenseForm({ onSubmit, initialData, onCancel, theme }) {
  const [form, setForm] = useState({
    amount: initialData?.amount || "",
    category: initialData?.category || "",
    date: initialData?.date || today,
    note: initialData?.note || "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleNoteChange(e) {
    const value = e.target.value;
    const suggested = simpleCategorize(value);
    setForm((p) => ({ ...p, note: value, category: p.category || (suggested.score >= 0.4 ? suggested.category : "") }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return setError("Amount must be a positive number");
    if (!form.category) return setError("Category is required");
    if (!form.date) return setError("Date is required");
    if (form.date > today) return setError("Date cannot be in the future");
    setError("");
    onSubmit(form);
    setForm({ amount: "", category: "", date: today, note: "" });
  }

  const suggestion = form.note ? simpleCategorize(form.note) : null;

  const s = theme || {};

  return (
    <motion.form initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} onSubmit={handleSubmit} style={{ background: s.cardBg || "#000", padding: 20, borderRadius: 12, color: s.text || "#fff", border: `1px solid ${s?.border || "#111"}` }}>
      <h3 style={{ margin: 0 }}>{initialData ? "Edit Expense" : "Add Expense"}</h3>
      {error ? <div style={{ color: s?.label || "#ef4444", marginTop: 8 }}>{error}</div> : null}

      <input name="amount" type="number" placeholder="Amount" value={form.amount} onChange={handleChange} style={{ marginTop: 12, padding: 8, width: "100%", background: s.inputBg || "#000", color: s.inputColor || "#fff", border: `1px solid ${s?.border || "#111"}` }} />

      <select name="category" value={form.category} onChange={handleChange} style={{ marginTop: 8, padding: 8, width: "100%", background: s.inputBg || "#000", color: s.inputColor || "#fff", border: `1px solid ${s?.border || "#111"}` }}>
        <option value="">Select Category</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <input name="date" type="date" value={form.date} onChange={handleChange} max={today} style={{ marginTop: 8, padding: 8, width: "100%", background: s.inputBg || "#000", color: s.inputColor || "#fff", border: `1px solid ${s?.border || "#111"}` }} />

      <input name="note" type="text" placeholder="Note (optional)" value={form.note} onChange={handleNoteChange} style={{ marginTop: 8, padding: 8, width: "100%", background: s.inputBg || "#000", color: s.inputColor || "#fff", border: `1px solid ${s?.border || "#111"}` }} />

      {suggestion && suggestion.category ? (
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ opacity: 0.8 }}>Suggested:</div>
          <button type="button" onClick={() => setForm((p) => ({ ...p, category: suggestion.category }))} style={{ padding: "6px 10px", borderRadius: 999, cursor: "pointer", background: s?.btnBg || "#fff", color: s?.btnText || "#ef4444", border: `1px solid ${s?.label || "#ef4444"}` }}>
            {suggestion.category} ({suggestion.score >= 0.66 ? "High" : suggestion.score >= 0.33 ? "Medium" : "Low"})
          </button>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="submit" style={{ flex: 1, padding: 10, borderRadius: 8, background: s?.btnBg || "#fff", color: s?.btnText || "#ef4444", border: `1px solid ${s?.label || "#ef4444"}` }}>{initialData ? "Update" : "Add"}</button>
        {onCancel ? <button type="button" onClick={onCancel} style={{ padding: 10, borderRadius: 8, background: s.inputBg || "#000", color: s.text || "#fff", border: `1px solid ${s?.border || "#111"}` }}>Cancel</button> : null}
      </div>
    </motion.form>
  );
}
