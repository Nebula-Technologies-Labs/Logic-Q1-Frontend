export const validateLogin = (
    email: string,
    password: string
): Record<string, string> => {

    const errors: Record<string, string> = {};

    if (!email.trim()) {

        errors.email =
            "Email is required";

    } else {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {

            errors.email =
                "Please enter a valid email";

        }

    }

    if (!password.trim()) {

        errors.password =
            "Password is required";

    }

    return errors;

};