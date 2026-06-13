import {
  BarChart, Bar, Cell, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid
} from "recharts";
import { useState } from "react";
import { motion } from "framer-motion";
import { setIncome } from "../services/api";
import * as XLSX from "xlsx";

const COLORS = ["#ef4444", "#b91c1c", "#7f1d1d", "#4b0000", "#2b0000"];

const CATEGORY_ICONS = {
  Food: "🍔", Transport: "🚕", Bills: "🏠",
  Entertainment: "🎬", Other: "🛒",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

export default function Summary({ summary, expenses, onIncomeUpdate, theme: t }) {
  const [incomeInput, setIncomeInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [budgets, setBudgets] = useState({});
  const [budgetInput, setBudgetInput] = useState({});
  const [showBudget, setShowBudget] = useState(false);

  if (!summary) return null;

  const { totalThisMonth, perCategory, highest, monthlyIncome, remaining } = summary;

  const barData = [
    ...Object.entries(perCategory).map(([name, value]) => ({ name, value })),
  ];

  const insights = [];
  Object.entries(perCategory).forEach(([cat, amt]) => {
    if (budgets[cat] && amt > budgets[cat]) {
      insights.push(`⚠️ ${CATEGORY_ICONS[cat] || "💸"} ${cat} budget exceeded! Spent ${formatCurrency(amt)} vs budget ${formatCurrency(budgets[cat])}`);
    }
  });
  if (monthlyIncome > 0 && totalThisMonth > monthlyIncome * 0.8)
    insights.push("⚠️ You've spent over 80% of your monthly income!");
  if (monthlyIncome > 0 && remaining > monthlyIncome * 0.5)
    insights.push("✅ Great job! You still have more than 50% of your income remaining.");
  if (highest && monthlyIncome > 0 && highest.amount > monthlyIncome * 0.2)
    insights.push(`💡 Your highest expense (${formatCurrency(highest.amount)} on ${highest.category}) is over 20% of your income.`);

  const monthlyTrend = {};
  (expenses || []).forEach((e) => {
    const month = e.date.slice(0, 7);
    monthlyTrend[month] = (monthlyTrend[month] || 0) + e.amount;
  });
  const trendData = Object.entries(monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  // Projection: average monthly spend -> next month estimate (after trendData computed)
  const months = trendData.map((d) => d.total);
  const avg = months.length ? months.reduce((a, b) => a + b, 0) / months.length : 0;
  const projection = Math.round(avg);
  if (projection > 0) insights.unshift(`📌 Projection: next month's spend ≈ ${formatCurrency(projection)}`);

  const handleIncomeSubmit = async () => {
    if (!incomeInput || incomeInput <= 0) return;
    await setIncome(incomeInput);
    setIncomeInput("");
    setEditing(false);
    onIncomeUpdate();
  };

  const handleExportCSV = () => {
    const data = (expenses || []).map((e) => ({
      Date: e.date, Category: e.category, Amount: e.amount, Note: e.note,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "expenses.xlsx");
  };

  const remainingColor = remaining < 0 ? (t?.label || "#ef4444") : (t?.text || "#ffffff");
  const card = { background: t?.cardBg2 || "#0b0b0b", padding: "14px", borderRadius: "12px", flex: 1, minWidth: "120px", border: `1px solid ${t?.border || "#111"}` };

  // Simple anomaly detection: flag expenses > 3x median as anomalies
  const amounts = (expenses || []).map((e) => e.amount).sort((a, b) => a - b);
  const median = amounts.length ? amounts[Math.floor(amounts.length / 2)] : 0;
  const anomalies = (expenses || []).filter((e) => median > 0 && e.amount > median * 3);
  if (anomalies.length > 0) insights.unshift(`🚨 ${anomalies.length} unusual large expense(s) detected. Check them.`);

  // Budget recommendations (simple): suggest category budget = max(categorySpend * 1.2, avgSpend * 1.1)
  const avgSpend = amounts.length ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;
  const recs = Object.entries(perCategory).map(([cat, amt]) => ({ cat, recommended: Math.round(Math.max(amt * 1.2, avgSpend * 1.1)) }));

  return (
    <div style={{ background: t?.cardBg || "#000", padding: "20px", borderRadius: "16px", border: `1px solid ${t?.border || "#111"}`, display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Income Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: t?.cardBg2 || "#0b0b0b", padding: "16px", borderRadius: "12px", border: `1px solid ${t?.border || "#111"}` }}>
        <div>
          <p style={{ margin: 0, fontSize: "13px", color: t?.subtext || "#aaa" }}>💰 Monthly Income</p>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: t?.accent || "#ef4444" }}>
            {monthlyIncome > 0 ? formatCurrency(monthlyIncome) : "Not set"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleExportCSV} style={{ background: t?.btnBg || "#ffffff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`, padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
            ⬇ Export Excel
          </button>
          <button onClick={() => setEditing(!editing)} style={{ background: t?.btnBg || "#ffffff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`, padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
            {editing ? "Cancel" : "Set Income"}
          </button>
        </div>
      </div>

      {editing && (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="number"
            placeholder="Enter monthly income (₹)"
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: `1px solid ${t?.border || "#111"}`, background: t?.inputBg || "#000", color: t?.inputColor || "#fff", fontSize: "14px" }}
          />
          <button onClick={handleIncomeSubmit} style={{ background: t?.btnBg || "#fff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`, padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            Save
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={card}>
          <p style={{ margin: 0, fontSize: "12px", color: t?.subtext || "#aaa" }}>📅 Spent This Month</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: t?.text || "#fff" }}>{formatCurrency(totalThisMonth)}</p>
        </div>
        <div style={{ ...card, borderLeft: `3px solid ${remainingColor}` }}>
          <p style={{ margin: 0, fontSize: "12px", color: t?.subtext || "#aaa" }}>{remaining >= 0 ? "✅ Remaining" : "⚠️ Overspent"}</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: remainingColor }}>
            {monthlyIncome > 0 ? formatCurrency(Math.abs(remaining)) : "—"}
          </p>
        </div>
        <div style={card}>
          <p style={{ margin: 0, fontSize: "12px", color: t?.subtext || "#aaa" }}>🔺 Highest</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: "bold", color: t?.text || "#fff" }}>{highest ? formatCurrency(highest.amount) : "—"}</p>
          {highest && <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: t?.subtext || "#aaa" }}>{CATEGORY_ICONS[highest.category]} {highest.category}</p>}
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <motion.div layout style={{ flex: 1, minWidth: "260px", background: t?.cardBg2 || "#0b0b0b", padding: "16px", borderRadius: "12px", border: `1px solid ${t?.border || "#111"}` }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>📊 Expense Breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t?.border || "#111"} />
              <XAxis dataKey="name" stroke={t?.subtext || "#aaa"} fontSize={12} />
              <YAxis stroke={t?.subtext || "#aaa"} fontSize={12} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="value" fill={t?.accent || COLORS[0]}>
                {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {trendData.length > 1 && (
            <motion.div layout style={{ flex: 1, minWidth: "260px", background: t?.cardBg2 || "#0b0b0b", padding: "16px", borderRadius: "12px", border: `1px solid ${t?.border || "#111"}` }}>
            <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>📈 Monthly Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={t?.border || "#111"} />
                <XAxis dataKey="month" stroke={t?.subtext || "#aaa"} fontSize={11} />
                <YAxis stroke={t?.subtext || "#aaa"} fontSize={11} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke={t?.accent || "#ef4444"} strokeWidth={2} dot={{ fill: t?.accent || "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Category Breakdown */}
      <div>
        <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>🗂 Category Breakdown</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(perCategory).map(([cat, amt], i) => (
            <div key={cat} style={{ background: t?.cardBg2 || "#0b0b0b", padding: "10px 14px", borderRadius: "8px", minWidth: "110px", border: `1px solid ${t?.border || "#111"}`, borderLeft: `4px solid ${COLORS[i % COLORS.length]}` }}>
              <p style={{ margin: 0, fontSize: "12px", color: t?.subtext || "#aaa" }}>{CATEGORY_ICONS[cat] || "💸"} {cat}</p>
              <p style={{ margin: "4px 0 0 0", fontWeight: "bold", fontSize: "15px", color: COLORS[i % COLORS.length] }}>{formatCurrency(amt)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Goals */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <p style={{ margin: 0, fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>🎯 Budget Goals</p>
          <button onClick={() => setShowBudget(!showBudget)} style={{ background: t?.btnBg || "#ffffff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`, padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
            {showBudget ? "Hide" : "Set Budgets"}
          </button>
        </div>
        {showBudget && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
            {["Food", "Transport", "Bills", "Entertainment", "Other"].map((cat) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: t?.text || "#ccc", fontSize: "13px", minWidth: "120px" }}>{CATEGORY_ICONS[cat]} {cat}</span>
                <input
                  type="number"
                  placeholder="Budget (₹)"
                  value={budgetInput[cat] || ""}
                  onChange={(e) => setBudgetInput({ ...budgetInput, [cat]: e.target.value })}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: `1px solid ${t?.border || "#111"}`, background: t?.inputBg || "#000", color: t?.inputColor || "#fff", fontSize: "13px" }}
                />
                <button onClick={() => setBudgets({ ...budgets, [cat]: parseFloat(budgetInput[cat]) })}
                  style={{ background: t?.btnBg || "#ffffff", color: t?.btnText || "#ef4444", border: `1px solid ${t?.label || "#ef4444"}`, padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                  Set
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.entries(perCategory).map(([cat, amt]) => {
            const budget = budgets[cat];
            if (!budget) return null;
            const pct = Math.min((amt / budget) * 100, 100);
            const color = pct >= 100 ? (t?.label || "#ef4444") : (t?.label || "#ef4444");
            return (
              <div key={cat} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: t?.text || "#ccc", fontSize: "13px" }}>{CATEGORY_ICONS[cat]} {cat}</span>
                  <span style={{ color, fontSize: "13px" }}>{formatCurrency(amt)} / {formatCurrency(budget)}</span>
                </div>
                <div style={{ background: t?.inputBg || "#000", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.3s ease" }} />
                </div>
              </div>
            );
          })}
          {/* Recommendations */}
          <div style={{ marginTop: 12 }}>
            <p style={{ margin: 0, fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>💡 Budget Recommendations</p>
            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  {recs.map((r) => (
                    <div key={r.cat} style={{ background: t?.cardBg2 || "#0b0b0b", padding: 8, borderRadius: 8, border: `1px solid ${t?.border || "#111"}` }}>
                      <div style={{ fontSize: 13, color: t?.subtext || "#aaa" }}>{r.cat}</div>
                      <div style={{ fontWeight: "bold", color: t?.accent || "#ef4444" }}>{formatCurrency(r.recommended)}</div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: t?.cardBg2 || "#0b0b0b", padding: "16px", borderRadius: "12px", border: `1px solid ${t?.border || "#111"}` }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: t?.text || "#ccc", fontSize: "14px" }}>🤖 AI Spending Insights</p>
          {insights.map((msg, i) => (
            <motion.div key={i} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }} style={{ padding: "10px 14px", marginBottom: "8px", borderRadius: "8px", background: t?.inputBg || "#0b0b0b", color: t?.text || "#ccc", fontSize: "13px", borderLeft: `3px solid ${t?.label || "#ef4444"}` }}>
              {msg}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}