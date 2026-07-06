export type RegistrationForm = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export const validateRegister = (
    formData: RegistrationForm,
    agreeTerms: boolean,
): Record<string, string> => {
    const errors: Record<string, string> = {};

    const nameRegex = /^[A-Za-z\s]+$/;

    // First Name Validation
    if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
    } else if (!nameRegex.test(formData.firstName.trim())) {
        errors.firstName = "First name cannot contain numbers or special characters";
    }

    // Last Name Validation
    if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
    } else if (!nameRegex.test(formData.lastName.trim())) {
        errors.lastName = "Last name cannot contain numbers or special characters";
    }

    // Email Validation
    if (!formData.email.trim()) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errors.email = "Please enter a valid email";
    }

    // Password Validation
    const password = formData.password;
    if (!password) {
        errors.password = "Password is required";
    } else {
        if (password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(password)) {
            errors.password = "Password must include at least one uppercase letter";
        } else if (!/[a-z]/.test(password)) {
            errors.password = "Password must include at least one lowercase letter";
        } else if (!/[0-9]/.test(password)) {
            errors.password = "Password must include at least one number";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.password = "Password must include at least one special character";
        }
    }

    // Terms Validation
    if (!agreeTerms) {
        errors.terms = "Please accept the Terms and Conditions";
    }

    return errors;
};
