import axios from "axios";
import { toast } from "react-toastify";

// ─── Instance ─────────────────────────────────────────────────────────────────

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ─── Interceptors ─────────────────────────────────────────────────────────────

// Intercepta todas as respostas de erro da API globalmente.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // Loga o erro detalhado no console para facilitar o debug.
    console.error(
      `[API Error] ${method} ${url} → ${status}`,
      error.response?.data ?? error.message
    );

    // Exibe um toast de erro específico com base no status da resposta.
    if (status >= 500) {
      toast.error("Erro interno do servidor. Tente novamente mais tarde.");
    } else if (status === 404) {
      toast.error("Recurso não encontrado.");
    } else if (status === 401 || status === 403) {
      toast.error("Você não tem permissão para realizar esta ação.");
    } else if (!status) {
      toast.error("Sem conexão com o servidor. Verifique sua internet.");
    }

    return Promise.reject(error);
  }
);

export default API;