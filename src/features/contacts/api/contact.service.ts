import api from "@/lib/axios";
import type { Contact } from "../types/contact.types";

export const getContactsByOrg = async (orgId: string): Promise<Contact[]> => {
    const { data } = await api.get<{ contacts: Contact[] }>(`/contact/org/${orgId}/`);
    return data.contacts || [];
};

export const createContact = async (payload: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.post<Contact>("/contact/create", payload);
    return data;
};

export const updateContact = async (id: string, payload: Partial<Contact>): Promise<Contact> => {
    const { data } = await api.put<Contact>(`/contact/${id}`, payload);
    return data;
};

export const deleteContact = async (id: string): Promise<void> => {
    await api.delete(`/contact/${id}`);
};
