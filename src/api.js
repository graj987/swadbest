import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json"
  },

  // increased from 10s
  timeout: 30000
});


/* ================= REQUEST ================= */

API.interceptors.request.use(
  (config) => {

    const accessToken =
      localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);



/* ================= RESPONSE ================= */

API.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest =
      error.config || {};

    const status =
      error.response?.status;



    /* -------- handle expired token -------- */

    if (
      status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        const refreshToken =
          localStorage.getItem(
            "refreshToken"
          );


        // no refresh token? do NOT hard logout here
        if (!refreshToken) {
          console.warn(
            "No refresh token available."
          );

          return Promise.reject(error);
        }


        // Requires backend route:
        // POST /api/users/refresh
        const refreshResponse =
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/refresh`,
            { refreshToken }
          );


        const newAccessToken =
          refreshResponse.data?.accessToken;


        if (!newAccessToken) {
          throw new Error(
            "No new access token returned"
          );
        }


        localStorage.setItem(
          "accessToken",
          newAccessToken
        );


        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;


        // retry original failed request
        return API(originalRequest);

      } catch (refreshError) {

        console.warn(
          "Refresh token failed:",
          refreshError?.message
        );

        // Optional:
        // only clear + redirect if you WANT
        // localStorage.clear();
        // window.location.href="/login";

        return Promise.reject(
          refreshError
        );
      }
    }



    /* -------- optional logging -------- */

    if (status === 404) {
      console.warn(
        "Route not found:",
        originalRequest?.url
      );
    }

    if (
      error.code === "ECONNABORTED"
    ) {
      console.warn(
        "Request timeout:",
        originalRequest?.url
      );
    }


    return Promise.reject(error);
  }
);


export default API;