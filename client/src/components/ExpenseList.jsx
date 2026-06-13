import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_ICONS = {
  Food: "🍔", Transport: "🚕", Bills: "🏠",
  Entertainment: "🎬", Other: "🛒",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

export default function ExpenseList({ expenses, onEdit, onDelete, theme: t }) {
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = expenses.filter((e) =>
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.note.toLowerCase().includes(search.toLowerCase())
  );

  if (expenses.length === 0) {
    return (
      <div style={{
        textAlign: "center", padding: "40px",
        background: t?.cardBg || "#fff",
        borderRadius: "12px",
        border: `1px solid ${t?.border || "#ddd"}`,
      }}>
        <p style={{ fontSize: "40px", margin: 0 }}>💸</p>
        <p style={{ color: t?.subtext || "#888", margin: "8px 0 0 0" }}>
          No expenses found. Add one above!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Search */}
      <input
        type="text"
        placeholder="🔎 Search by category or note..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "12px 16px",
          borderRadius: "10px",
          border: `1px solid ${t?.border || "#ddd"}`,
          background: t?.inputBg || "#fff",
          color: t?.inputColor || "#000",
          fontSize: "14px",
          width: "100%",
          boxSizing: "border-box",
        }}
      />

      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "30px",
          background: t?.cardBg || "#fff",
          borderRadius: "12px",
          border: `1px solid ${t?.border || "#ddd"}`,
          color: t?.subtext || "#888",
        }}>
          No results found for "{search}"
        </div>
      ) : (
        <AnimatePresence>
          {filtered.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{
                background: t?.cardBg || "#fff",
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${t?.border || "#ddd"}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontWeight: "bold", fontSize: "16px", color: t?.label || "#ef4444" }}>
                  {CATEGORY_ICONS[expense.category] || "💸"} {expense.category}
                </span>
                <span style={{ fontSize: "13px", color: t?.subtext || "#888" }}>
                  {expense.date}
                </span>
                {expense.note && (
                  <span style={{ fontSize: "13px", color: t?.subtext || "#aaa" }}>
                    📝 {expense.note}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                <span style={{ fontWeight: "bold", fontSize: "18px", color: t?.text || "#333" }}>
                  {formatCurrency(expense.amount)}
                </span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={() => onEdit(expense)} style={{
                    background: t?.btnBg || "#ffffff",
                    color: t?.btnText || "#ef4444",
                    border: `1px solid ${t?.label || "#ef4444"}`,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}>
                    ✏️ Edit
                  </button>

                  {confirmId === expense.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: t?.subtext || "#ffffff", fontSize: "13px" }}>Sure?</span>
                      <button onClick={() => { onDelete(expense.id); setConfirmId(null); }} style={{
                        background: t?.btnBg || "#ffffff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`,
                        padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                      }}>Yes</button>
                      <button onClick={() => setConfirmId(null)} style={{
                        background: t?.inputBg || "#000000", color: t?.text || "#ffffff",
                        border: `1px solid ${t?.border || "#111"}`,
                        padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px",
                      }}>No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(expense.id)} style={{
                      background: t?.btnBg || "#ffffff",
                      color: t?.btnText || "#ef4444",
                      border: `1px solid ${t?.label || "#ef4444"}`,
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}>
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}