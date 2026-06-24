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

    const errors: Record<
        string,
        string
    > = {};

    if (!formData.firstName.trim()) {

        errors.name =
            "Name is required";

    } else if (
        formData.firstName.trim().length < 2
    ) {

        errors.name =
            "Name must be at least 2 characters";

    }

    if (!formData.email.trim()) {

        errors.email =
            "Email is required";

    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            formData.email.trim()
        )
    ) {

        errors.email =
            "Please enter a valid email";

    }

    if (!formData.password) {

        errors.password =
            "Password is required";

    } else if (
        formData.password.length < 8
    ) {

        errors.password =
            "Password must be at least 8 characters";

    }

    if (!agreeTerms) {

        errors.terms =
            "Please accept the Terms and Conditions";

    }

    return errors;
};