import { Comment } from '@/types';

export const formatReply = (comment: Comment): string => {
    let content = comment.contentHtml;

    content = content.replace(/<div class=['"]quote['"]>[\s\S]*?<\/div>/gi, "");
    content = content.replace(/<br\s*\/?>/gi, "\n");
    content = content.replace(/<[^>]+>/g, "");
    content = content.replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');

    content = content.trim();

    return `[quote=${comment.author}]${content}[/quote]\n`;
};
