const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Simple typed fetch wrapper
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let token: string | null = null
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    // Handle form data encoding for login which expects x-www-form-urlencoded
    // If request has no body or body is not FormData/URLSearchParams, we assume JSON unless specified
    let body = options.body

    const response = await fetch(`${API_URL}/api/v1${endpoint}`, {
        ...options,
        headers,
        body
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || 'API request failed')
    }

    return response.json()
}

export const api = {
    auth: {
        login: (data: any) => {
            const params = new URLSearchParams()
            for (const key in data) {
                params.append(key, data[key])
            }
            return apiFetch<any>('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            })
        },
        register: (data: any) => apiFetch<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    },
    community: {
        getThreads: () => apiFetch<any[]>('/forum/threads'),
        getThread: (id: string) => apiFetch<any>(`/forum/threads/${id}`),
        createThread: (data: any) => apiFetch<any>('/forum/threads', { method: 'POST', body: JSON.stringify(data) }),
        createComment: (threadId: string, data: any) => apiFetch<any>(`/forum/threads/${threadId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
    },
    learning: {
        getModules: (params?: { category?: string; difficulty?: string; query?: string }) => {
            const queryString = params ? '?' + new URLSearchParams(params as any).toString() : ''
            return apiFetch<any>(`/learning/modules${queryString}`)
        },
        getModule: (id: string) => apiFetch<any>(`/learning/modules/${id}`),
        getProgress: () => apiFetch<any>('/learning/progress'),
        getStats: () => apiFetch<any>('/learning/stats'),
        updateProgress: (moduleId: string, data: any) => apiFetch<any>(`/learning/modules/${moduleId}/progress`, { 
            method: 'PUT', 
            body: JSON.stringify(data) 
        }),
    },
    users: {
        getProfile: () => apiFetch<any>('/users/me'),
        updateProfile: (data: any) => apiFetch<any>('/users/me', { 
            method: 'PUT', 
            body: JSON.stringify(data) 
        }),
    }
}
