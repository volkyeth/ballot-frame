export interface BallotOption {
    id: string;
    text: string;
    votes: number;
    voters: number[]; // Array of FIDs who voted for this option
}

export interface Ballot {
    id: string;
    question: string;
    options: BallotOption[];
    createdBy: number; // FID of the creator
    createdAt: number; // Unix timestamp
    expiresAt: number; // Unix timestamp
    closed: boolean;
}

export enum BallotDuration {
    ONE_DAY = 1,
    TWO_DAYS = 2,
    THREE_DAYS = 3,
}

// Calculate expiration timestamp based on duration in days
export function calculateExpirationTimestamp(durationInDays: BallotDuration): number {
    const now = Date.now();
    return now + durationInDays * 24 * 60 * 60 * 1000;
}

// Check if a ballot is expired
export function isBallotExpired(ballot: Ballot): boolean {
    return Date.now() > ballot.expiresAt;
}

// Format a timestamp to a human-readable date
export function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
}

// Generate a unique ID for a ballot or option
export function generateId(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
} 