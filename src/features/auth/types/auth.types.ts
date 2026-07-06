export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
}

export interface AuthUser {
    id: string;

    email: string;

    firstName: string;

    lastName: string;

    profileImage: string | null;

    jobTitle: string | null;

    phoneNumber: string | null;

    department: string | null;

    onBoarded: boolean;

    emailVerified: boolean;

    orgId: string | null;

    roleId: string | null;
}

export interface AuthResponse {
    status: boolean;

    message: string;

    token: string;

    user: AuthUser;
}
