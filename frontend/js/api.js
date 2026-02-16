// Base API configuration
const API_BASE = 'http://localhost:9180/api';

const api = {
    // Generic request handler
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Directory endpoints
    directories: {
        getAll: () => api.request('/directories'),
        getActive: () => api.request('/directories/active'),
        create: (data) => api.request('/directories', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/directories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/directories/${id}`, { method: 'DELETE' })
    },

    // SharePoint endpoints
    sharepoint: {
        getAll: () => api.request('/sharepoint-configs'),
        getActive: () => api.request('/sharepoint-configs/active'),
        getById: (id) => api.request(`/sharepoint-configs/${id}`),
        create: (data) => api.request('/sharepoint-configs', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => api.request(`/sharepoint-configs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => api.request(`/sharepoint-configs/${id}`, { method: 'DELETE' })
    },

    // Protocol endpoints
    protocols: {
        getAll: () => api.request('/protocols')
    },

    // Sync endpoint
    sync: {
        execute: () => api.request('/sync')
    }
};