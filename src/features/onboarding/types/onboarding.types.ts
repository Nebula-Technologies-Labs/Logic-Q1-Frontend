export interface CreateOrganizationRequest {
    name: string;
    category: string;
    country: string;
    websiteUrl: string;
}

export interface CreateOrganizationResponse {
    status: boolean;
    message: string;
}
