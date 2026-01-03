import { SearchParams, SearchResult } from '@/types';
import { parse } from 'node-html-parser';

export const searchComments = async (params: SearchParams): Promise<SearchResult[]> => {
    try {
        const queryParams = new URLSearchParams();
        if (params.user) queryParams.append('user', params.user);
        if (params.comment) queryParams.append('comment', params.comment);
        if (params.is_reg) queryParams.append('is_reg', params.is_reg);
        if (params.points) queryParams.append('points', params.points);
        if (params.fromdate) queryParams.append('fromdate', params.fromdate);
        if (params.todate) queryParams.append('todate', params.todate);

        const url = `https://komment.sodikereso.info/results/?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const html = await response.text();
        const root = parse(html);
        const commentDivs = root.querySelectorAll('.comment');

        const results: SearchResult[] = commentDivs.map(div => {
            const headerDiv = div.querySelector('div:first-child');
            const authorB = headerDiv?.querySelector('b');
            const author = authorB?.text.trim() || 'Ismeretlen';
            const isRegistered = authorB?.classList.contains('registered') || false;

            const headerText = headerDiv?.text || '';
            const pointsMatch = headerText.match(/\(([\d-]+)\)/);
            const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;

            const linkA = headerDiv?.querySelector('a');
            const link = linkA?.getAttribute('href') || '';

            const pageNoMatch = link.match(/pageNo=(\d+)/);
            const commentIdMatch = link.match(/comment-(\d+)/);

            const pageNo = pageNoMatch ? parseInt(pageNoMatch[1], 10) : 1;
            const commentId = commentIdMatch ? commentIdMatch[1] : '';

            const contentDiv = div.querySelector('div:nth-child(3)');
            const contentHtml = contentDiv?.innerHTML || '';

            const dateDiv = div.querySelector('div:nth-child(4)');
            const dateText = dateDiv?.text.replace(/[-]{3,}/g, '').trim() || '';

            return {
                id: commentId,
                author,
                isRegistered,
                points,
                date: dateText,
                contentHtml,
                pageNo,
                link
            };
        });

        return results;
    } catch (e) {
        console.error('Search API error:', e);
        return [];
    }
};
