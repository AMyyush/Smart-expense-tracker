import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const api = axios.create({ baseURL: API_BASE });

export const getExpenses = () => api.get("/expenses");
export const createExpense = (payload) => api.post("/expenses", payload);
export const updateExpense = (id, payload) => api.put(`/expenses/${id}`, payload);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getSummary = () => api.get("/expenses/summary");
export const setIncome = (income) => api.post("/income", { income });

export default api;
