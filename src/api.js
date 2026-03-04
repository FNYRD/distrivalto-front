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
}
