import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    try {
        const auth = JSON.parse(localStorage.getItem("auth") || "null");
        const jwtToken = auth?.jwtToken;

        if (jwtToken) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${jwtToken}`;
        }
    } catch (error) {
        console.warn("Failed to attach auth token", error);
    }

    return config;
});

export default api;
