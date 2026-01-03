export interface Comment {
    id: string;
    author: string;
    authorRank?: string;
    authorPoints?: string;
    authorClasses?: string;
    date: string;
    contentHtml: string;
    avatarUrl: string;
    upvotes: number;
    isHighlighted: boolean;
    isLiked: boolean;
    replyTo?: string;
    hasVoted?: 'up' | 'down' | null;
    canVote?: boolean;
}

export interface User {
    username: string;
    token?: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

export interface SearchParams {
    user?: string;
    comment?: string;
    is_reg?: string;
    points?: string;
    fromdate?: string;
    todate?: string;
}

export interface SearchResult {
    id: string;
    author: string;
    isRegistered: boolean;
    points: number;
    date: string;
    contentHtml: string;
    pageNo: number;
    link: string;
}
