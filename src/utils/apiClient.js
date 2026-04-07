/**
 * API Client Utility
 * Provides centralized API request handler with authentication
 */

import { getCurrentUser } from "./authHelpers";

// Prefer explicit backend URL when provided (recommended for local dev).
// Examples:
//   VITE_API_BASE_URL=http://localhost:8082
// If not provided, fall back to Vite proxy via relative /api.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL
  ? `${String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, "")}/api`
  : "/api";

/**
 * Get authorization headers with JWT token
 */
const getAuthHeaders = () => {
  const user = getCurrentUser();
  const headers = {
    "Content-Type": "application/json",
  };

  if (user && user.token) {
    headers["Authorization"] = `Bearer ${user.token}`;
  }

  return headers;
};

/**
 * Generic API request handler
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let details = "";
      try {
        const text = await response.text();
        details = text ? ` - ${text}` : "";
      } catch {
        // ignore
      }

      if (response.status === 401) {
        localStorage.removeItem("loanflow_auth");
        window.location.href = "/login";
      }

      throw new Error(`API Error: ${response.status} ${response.statusText}${details}`);
    }

    // Some endpoints may return 204 (No Content)
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint) => {
  return apiRequest(endpoint, { method: "GET" });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request
 */
export const apiPatch = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, { method: "DELETE" });
};
