export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    expiresIn: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
}