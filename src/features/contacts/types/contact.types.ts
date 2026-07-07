export interface Contact {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    secondaryEmail?: string;
    description?: string;
    note?: string;
    title?: string;
    department?: string;
    contactSource?: string | null;
    ContactSource?: string | null;
    country?: string;
    city?: string;
    state?: string;
    ownerId?: string;
}

export const CONTACT_SOURCES = [
    "LinkedIn",
    "Referral",
    "Cold Outreach",
    "Website",
    "Event",
    "Partner",
    "Other",
];

export const BLANK_CONTACT = {
    name: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    title: "",
    department: "",
    contactSource: "",
    country: "",
    city: "",
    state: "",
    description: "",
    note: "",
};
