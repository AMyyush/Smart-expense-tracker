const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "expenses.json");

let expenses = [];
let monthlyIncome = 0;

function loadData() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw || "{}");
      expenses = parsed.expenses || [];
      monthlyIncome = parsed.monthlyIncome || 0;
    } else {
      saveData();
    }
  } catch (err) {
    console.error("Failed to load data:", err);
    expenses = [];
    monthlyIncome = 0;
  }
}

function saveData() {
  try {
    const payload = { expenses, monthlyIncome };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save data:", err);
  }
}

// initialize data from disk
loadData();

// GET all expenses
app.get("/expenses", (req, res) => {
  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  res.json(sorted);
});

// POST new expense
app.post("/expenses", (req, res) => {
  const { amount, category, date, note } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ error: "Amount must be a positive number" });
  if (!category)
    return res.status(400).json({ error: "Category is required" });
  if (!date)
    return res.status(400).json({ error: "Date is required" });
  if (new Date(date) > new Date())
    return res.status(400).json({ error: "Date cannot be in the future" });

  const newExpense = {
    id: uuidv4(),
    amount: parseFloat(amount),
    category,
    date,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  saveData();
  res.status(201).json(newExpense);
});

// PUT update expense
app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const { amount, category, date, note } = req.body;
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Expense not found" });
  if (!amount || amount <= 0)
    return res.status(400).json({ error: "Amount must be a positive number" });
  if (!category)
    return res.status(400).json({ error: "Category is required" });
  if (new Date(date) > new Date())
    return res.status(400).json({ error: "Date cannot be in the future" });

  expenses[index] = {
    ...expenses[index],
    amount: parseFloat(amount),
    category,
    date,
    note: note || "",
  };
  saveData();
  res.json(expenses[index]);
});

// DELETE expense
app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1)
    return res.status(404).json({ error: "Expense not found" });
  expenses.splice(index, 1);
  saveData();
  res.json({ message: "Expense deleted successfully" });
});

// GET summary
app.get("/expenses/summary", (req, res) => {
  const now = new Date();
  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const totalThisMonth = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  const perCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const highest =
    expenses.length > 0
      ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max))
      : null;

  res.json({
    totalThisMonth,
    perCategory,
    highest,
    monthlyIncome,
    remaining: monthlyIncome - totalThisMonth,
  });
});

// SET monthly income
app.post("/income", (req, res) => {
  const { income } = req.body;
  if (!income || income < 0)
    return res.status(400).json({ error: "Invalid income amount" });
  monthlyIncome = parseFloat(income);
  saveData();
  res.json({ monthlyIncome });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});