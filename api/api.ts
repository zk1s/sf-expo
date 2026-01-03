import { Comment } from '@/types';
import { parse } from 'node-html-parser';
import { fetchWithCookie } from './client';

const BASE_URL = 'https://forum.sodika.dk';

const toAbsoluteUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/${url}`;
};

export const getComments = async (pageNo: number = 1): Promise<Comment[]> => {
    const url = `${BASE_URL}/index.php?pageNo=${pageNo}`;
    const response = await fetchWithCookie(url);
    const html = await response.text();
    const root = parse(html);

    const comments: Comment[] = [];
    const commentElements = root.querySelectorAll('.comment');

    for (const el of commentElements) {
        const id = el.getAttribute('rel') || '';
        if (!id) continue;

        const authorEl = el.querySelector('.header strong');
        const author = authorEl?.text.trim() || 'Unknown';
        const headerSpan = authorEl?.parentNode;
        const title = headerSpan?.getAttribute('title') || '';

        let authorRank = '';
        let authorPoints = '';
        if (title) {
            const parts = title.split(' ');
            if (parts.length >= 2) {
                authorPoints = parts[parts.length - 2];
                authorRank = parts.slice(0, parts.length - 2).join(' ');
            }
        }

        const authorClasses = authorEl?.getAttribute('class') || '';

        const dateEl = el.querySelector('.header .date');
        const date = dateEl?.text.trim() || '';

        const imgEl = el.querySelector('.content .left img');
        const avatarSrc = imgEl?.getAttribute('src');
        const avatarUrl = toAbsoluteUrl(avatarSrc);

        const contentDiv = el.querySelector('.content .right .innerDiv');
        if (contentDiv) {
            const images = contentDiv.querySelectorAll('img');
            images.forEach((img) => {
                const src = img.getAttribute('src');
                if (src) {
                    img.setAttribute('src', toAbsoluteUrl(src));
                }
            });
        }

        const contentHtml = contentDiv?.innerHTML || '';

        const votesEl = el.querySelector(`.votes-${id}`);
        const votesText = votesEl?.text.trim() || '0';
        const upvotes = parseInt(votesText, 10) || 0;

        const isHighlighted = el.classList.contains('highlighted');

        const canVote = !el.classList.contains('novote');

        const upvoteBtn = el.querySelector('.upvote');
        const downvoteBtn = el.querySelector('.downvote');

        let hasVoted: 'up' | 'down' | null = null;
        if (upvoteBtn?.classList.contains('selected-vote')) hasVoted = 'up';
        if (downvoteBtn?.classList.contains('selected-vote')) hasVoted = 'down';

        comments.push({
            id,
            author,
            authorRank,
            authorPoints,
            authorClasses,
            date,
            contentHtml,
            avatarUrl,
            upvotes,
            isHighlighted,
            isLiked: false,
            canVote,
            hasVoted
        });
    }

    return comments;
};

export const login = async (username: string, password: string): Promise<boolean> => {
    const loginUrl = `${BASE_URL}/index.php?page=login`;
    const pageResponse = await fetchWithCookie(loginUrl);
    const pageHtml = await pageResponse.text();
    const root = parse(pageHtml);

    const tokenInput = root.querySelector('input[name="token"]');
    const token = tokenInput?.getAttribute('value');

    if (!token) {
        console.error('Could not find login token');
        return false;
    }

    const formData = new URLSearchParams();
    formData.append('token', token);
    formData.append('name', username);
    formData.append('password', password);

    const postResponse = await fetchWithCookie(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    const respText = await postResponse.text();
    return respText.includes('page=logout');
};

export const getLastPageNumber = async (): Promise<number> => {
    const url = `${BASE_URL}/index.php`;
    const response = await fetchWithCookie(url);
    const html = await response.text();
    const root = parse(html);

    const activePageEl = root.querySelector('.paginator a.active');
    let maxPage = 1;
    if (activePageEl) {
        maxPage = parseInt(activePageEl.text, 10) || 1;
    }

    const pageLinks = root.querySelectorAll('.paginator a');
    pageLinks.forEach((link) => {
        const txt = link.text;
        const num = parseInt(txt, 10);
        if (!isNaN(num) && num > maxPage) maxPage = num;
    });

    return maxPage;
};


export const postComment = async (nickname: string, message: string): Promise<boolean> => {
    const url = `${BASE_URL}/index.php`;
    const pageResponse = await fetchWithCookie(url);
    const pageHtml = await pageResponse.text();
    const root = parse(pageHtml);

    const tokenInput = root.querySelector('input[name="token"]');
    const token = tokenInput?.getAttribute('value');

    if (!token) {
        console.error('Could not find posting token');
        return false;
    }

    const formData = new URLSearchParams();
    formData.append('token', token);
    formData.append('name', nickname);
    formData.append('comment', message);
    formData.append('email', '');
    formData.append('phone', '');
    formData.append('address', '');
    formData.append('url', '');
    formData.append('website', '');

    await fetchWithCookie(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    return true;
};

export interface UserProfile {
    username: string;
    avatarUrl?: string;
    signature: string;
    authCode: string;
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
    const url = `${BASE_URL}/index.php?page=profile`;
    const response = await fetchWithCookie(url);
    const html = await response.text();
    const root = parse(html);

    const usernameEl = root.querySelector('.username');
    const username = usernameEl?.text.trim() || '';

    const avatarImg = root.querySelector('img[src^="uploads/"]');
    const avatarUrl = avatarImg ? toAbsoluteUrl(avatarImg.getAttribute('src')) : undefined;

    const signatureInput = root.querySelector('input[name="signature"]');
    const signature = signatureInput?.getAttribute('value') || '';

    const authCodeEl = root.querySelectorAll('em')[1];
    const authCode = authCodeEl?.text.trim() || '';

    if (!username) return null;

    return {
        username,
        avatarUrl,
        signature,
        authCode,
    };
};

export const updateUserProfile = async (signature: string, imageUri?: string): Promise<boolean> => {
    const url = `${BASE_URL}/index.php?page=profile`;
    const pageResponse = await fetchWithCookie(url);
    const pageHtml = await pageResponse.text();
    const root = parse(pageHtml);

    const tokenInput = root.querySelector('input[name="token"]');
    const token = tokenInput?.getAttribute('value');

    if (!token) {
        console.error('Could not find profile token');
        return false;
    }

    const formData = new FormData();
    formData.append('form-action', 'update-user');
    formData.append('token', token);
    formData.append('signature', signature);

    if (imageUri) {
        const filename = imageUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
        } as any);
    }

    await fetchWithCookie(url, {
        method: 'POST',
        body: formData as any,
    });

    return true;
};

export const uploadToCatbox = async (uri: string): Promise<string | null> => {
    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');

        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('fileToUpload', {
            uri,
            name: filename,
            type,
        } as any);

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Catbox upload failed');
        }

        const url = await response.text();
        return url.trim();
    } catch (e) {
        console.error('Error uploading to catbox:', e);
        return null;
    }
};

export const voteComment = async (id: string, direction: 'up' | 'down'): Promise<string> => {
    const url = `${BASE_URL}/index.php`;
    const pageResponse = await fetchWithCookie(url);
    const pageHtml = await pageResponse.text();
    const root = parse(pageHtml);

    const tokenInput = root.querySelector('input[name="token"]');
    const token = tokenInput?.getAttribute('value');

    if (!token) {
        return 'auth_error';
    }

    const formData = new URLSearchParams();
    formData.append('action', 'voteComment');
    formData.append('id', id);
    formData.append('direction', direction);
    formData.append('token', token);

    const response = await fetchWithCookie(`${BASE_URL}/include/ajax.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    });

    const result = await response.text();
    return result;
};
