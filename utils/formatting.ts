import { Comment } from '@/types';
import { parse } from 'node-html-parser';

export const formatReply = (comment: Comment): string => {
    const root = parse(comment.contentHtml);

    root.querySelectorAll('.quote').forEach(el => el.remove());

    root.querySelectorAll('br').forEach(br => {
        br.replaceWith('\n');
    });

    let content = root.text;

    content = content.trim();

    return `[quote=${comment.author}]${content}[/quote]\n`;
};
