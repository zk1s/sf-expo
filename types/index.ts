export interface Comment {
    id: string;
    author: string;
    authorRank?: string;
    authorPoints?: string;
    date: string;
    contentHtml: string;
    avatarUrl: string;
    upvotes: number;
    isHighlighted: boolean;
    isLiked: boolean;
    replyTo?: string;
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
