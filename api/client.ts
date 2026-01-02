let currentCookie = '';
let cookieChangeListener: ((cookie: string) => void) | null = null;

export const setCookie = (cookie: string) => {
    currentCookie = cookie;
    if (cookieChangeListener) cookieChangeListener(cookie);
};

export const setCookieListener = (listener: (cookie: string) => void) => {
    cookieChangeListener = listener;
};

export const getCookie = () => currentCookie;

export const clearCookie = () => {
    currentCookie = '';
};

export const fetchWithCookie = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (currentCookie) {
        headers.append('Cookie', currentCookie);
    }

    if (!headers.has('User-Agent')) {
        headers.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
        const cookies = setCookieHeader.split(',').map(c => c.split(';')[0].trim());
        currentCookie = cookies.join('; ');
        if (cookieChangeListener) cookieChangeListener(currentCookie);
    }

    return response;
};
