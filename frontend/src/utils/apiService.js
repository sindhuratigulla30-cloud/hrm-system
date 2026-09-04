/**
 * ============================================================
 * API SERVICE UTILITY
 * ============================================================
 * 
 * Centralized API call handler with error handling,
 * token management, and consistent response formatting.
 * 
 * Usage:
 * import apiService from './utils/apiService';
 * 
 * const data = await apiService.get('/api/employees');
 */

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Create axios instance with default configuration
 */
const instance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add token
 */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access denied");
    }

    return Promise.reject(error);
  }
);

/**
 * API Service object with methods for different HTTP verbs
 */
const apiService = {
  /**
   * GET request
   * @param {string} url - API endpoint
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async get(url, config = {}) {
    try {
      const response = await instance.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * POST request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async post(url, data = {}, config = {}) {
    try {
      const response = await instance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * PUT request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async put(url, data = {}, config = {}) {
    try {
      const response = await instance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * PATCH request
   * @param {string} url - API endpoint
   * @param {Object} data - Request data
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async patch(url, data = {}, config = {}) {
    try {
      const response = await instance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * DELETE request
   * @param {string} url - API endpoint
   * @param {Object} config - Axios config
   * @returns {Promise} Response data
   */
  async delete(url, config = {}) {
    try {
      const response = await instance.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Handle and format errors
   * @param {Error} error - Axios error
   * @returns {Object} Formatted error
   */
  handleError(error) {
    const formattedError = {
      message: "An error occurred",
      status: null,
      data: null,
    };

    if (error.response) {
      // Server responded with error status
      formattedError.status = error.response.status;
      formattedError.message =
        error.response.data?.message || error.message;
      formattedError.data = error.response.data;
    } else if (error.request) {
      // Request made but no response
      formattedError.message = "No response from server";
      formattedError.status = 0;
    } else {
      // Error in request setup
      formattedError.message = error.message;
    }

    return formattedError;
  },
};

export default apiService;
