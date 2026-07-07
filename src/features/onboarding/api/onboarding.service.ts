import api from "../../../lib/axios";

import type {
    CreateOrganizationRequest,
    CreateOrganizationResponse,
} from "../types/onboarding.types";

export const createOrganization = async (
    payload: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> => {
    const { data } = await api.post<CreateOrganizationResponse>("/organization/create", payload);

    return data;
};
