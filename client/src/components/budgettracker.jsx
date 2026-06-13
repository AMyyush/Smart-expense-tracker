import { useEffect } from "react";
import { motion } from "framer-motion";

export default function BudgetTracker({
  budget,
  setBudget,
  totalExpense,
  theme: t,
}) {
  const remaining = budget - totalExpense;

  const percentage =
    budget > 0
      ? Math.min((totalExpense / budget) * 100, 100)
      : 0;

  useEffect(() => {
    localStorage.setItem("budget", budget);
  }, [budget]);

  return (
    <div style={{ ...styles.card, background: t?.cardBg || "#000", color: t?.text || "#fff", border: `1px solid ${t?.border || "#111"}` }}>
      <h2 style={styles.heading}>Monthly Budget Tracker</h2>

      <div style={styles.inputSection}>
        <label style={styles.label}>
          Set Monthly Budget (₹)
        </label>

        <input
          type="number"
          value={budget}
          onChange={(e) =>
            setBudget(Number(e.target.value))
          }
          placeholder="Enter Budget"
          style={styles.input}
        />
      </div>

      <div style={styles.stats}>
        <div style={styles.statBox}>
          <span>Total Budget</span>
          <strong>₹{budget}</strong>
        </div>

        <div style={styles.statBox}>
          <span>Spent</span>
          <strong>₹{totalExpense}</strong>
        </div>

        <div style={styles.statBox}>
          <span>Remaining</span>

          <strong style={{ color: remaining >= 0 ? t?.text || "#fff" : t?.label || "#ef4444" }}>
            ₹{remaining}
          </strong>
        </div>
      </div>

      <div style={styles.progressContainer}>
        <motion.div style={{ ...styles.progressFill }} animate={{ width: `${percentage}%`, background: t?.label || "#ef4444" }} transition={{ ease: "easeOut", duration: 0.6 }} />
      </div>

      <p style={styles.percentText}>
        {percentage.toFixed(1)}% of budget used
      </p>

      {percentage >= 100 && (
        <div style={styles.warning}>
          ⚠️ Budget Limit Exceeded
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: "20px",
    borderRadius: "16px",
    marginTop: "20px",
  },

  heading: {
    marginBottom: "20px",
    fontSize: "22px",
  },

  inputSection: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#fff",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #222",
    background: "#000",
    color: "#fff",
    fontSize: "16px",
  },

  stats: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  statBox: {
    flex: 1,
    minWidth: "120px",
    background: "#000",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  progressContainer: {
    height: "14px",
    background: "#2d3748",
    borderRadius: "20px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    transition: "0.5s ease",
  },

  percentText: {
    textAlign: "center",
    marginTop: "10px",
    color: "#bbb",
  },

  warning: {
    marginTop: "15px",
    textAlign: "center",
    color: "#ef4444",
    fontWeight: "bold",
  },
};