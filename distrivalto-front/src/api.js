const BASE = 'http://localhost:8000'

async function req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw await res.json()
    return res.json()
}

export const api = {
    getSession: () => req('GET', '/api/session/'),
    login: (data) => req('POST', '/api/auth/login/', data),
    register: (data) => req('POST', '/api/auth/register/', data),
    logout: () => req('POST', '/api/auth/logout/'),
    updateMe: (data) => req('PATCH', '/api/auth/me/', data),
    createChat: (data) => req('POST', '/api/chats/', data),
    getChat: (id) => req('GET', `/api/chats/${id}/`),
    sendMessage: (chatId, data) => req('POST', `/api/chats/${chatId}/messages/`, data),
    deleteChat: (id) => req('DELETE', `/api/chats/${id}/`),
    getDashboard: () => req('GET', '/api/admin/dashboard/'),
    getAdminChats:      (offset = 0, limit = 10) => req('GET', `/api/admin/chats/?offset=${offset}&limit=${limit}`),
    getAdminChat:       (id) => req('GET', `/api/admin/chats/${id}/`),
    deleteAdminChat:    (id) => req('DELETE', `/api/admin/chats/${id}/`),
    getAdminUsers:    () => req('GET', '/api/admin/users/'),
    createAdminUser:  (data) => req('POST', '/api/admin/users/', data),
    updateAdminUser:  (id, data) => req('PATCH', `/api/admin/users/${id}/`, data),
    deleteAdminUser:  (id) => req('DELETE', `/api/admin/users/${id}/`),
    getAdminSettings: () => req('GET', '/api/admin/settings/'),
    saveAdminSettings:(data) => req('PATCH', '/api/admin/settings/', data),
    verifyApiKey:     () => req('POST', '/api/admin/settings/verify-key/'),
}
