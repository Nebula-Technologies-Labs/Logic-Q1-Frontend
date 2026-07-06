import { useState, useCallback, type FormEvent } from "react";

import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { createOrganization } from "../api";

import type { CreateOrganizationRequest } from "../types/onboarding.types";

import "./Onboarding.css";

type FieldErrors = Partial<Record<keyof CreateOrganizationRequest, string>>;

const INITIAL_FORM: CreateOrganizationRequest = {
    name: "",
    category: "",
    country: "",
    websiteUrl: "",
};

const Onboarding = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [form, setForm] = useState<CreateOrganizationRequest>(INITIAL_FORM);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const updateField = useCallback((field: keyof CreateOrganizationRequest, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setApiError(null);
    }, []);

    const validate = useCallback((): boolean => {
        const errors: FieldErrors = {};

        if (!form.name.trim()) {
            errors.name = "Organization name is required";
        }

        if (!form.category.trim()) {
            errors.category = "Category is required";
        }

        if (!form.country.trim()) {
            errors.country = "Country is required";
        }

        if (!form.websiteUrl.trim()) {
            errors.websiteUrl = "Website URL is required";
        } else {
            try {
                const url = form.websiteUrl.trim();
                const withProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
                new URL(withProtocol);
            } catch {
                errors.websiteUrl = "Please enter a valid URL";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) return;

        setApiError(null);
        setSubmitting(true);

        try {
            const websiteUrl = form.websiteUrl.trim();
            const payload: CreateOrganizationRequest = {
                name: form.name.trim(),
                category: form.category.trim(),
                country: form.country.trim(),
                websiteUrl: websiteUrl.match(/^https?:\/\//) ? websiteUrl : `https://${websiteUrl}`,
            };

            await createOrganization(payload);

            // Re-fetch user so orgId gets populated in context
            await refreshUser();

            setSuccess(true);

            // Brief pause to show success, then redirect
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1800);
        } catch (cause) {
            let message =
                "Something went wrong while creating your organization. Please try again.";
            if (isAxiosError(cause) && cause.response?.data?.message) {
                message = cause.response.data.message;
            } else if (cause instanceof Error) {
                message = cause.message;
            }
            setApiError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Success Screen ───
    if (success) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-bg" />
                <div className="onboarding-card">
                    <div className="onboarding-success">
                        <div className="onboarding-success-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="onboarding-success-title">You're all set!</h2>
                        <p className="onboarding-success-text">
                            Your organization has been created successfully.
                            <br />
                            Redirecting you to the dashboard…
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Onboarding Form ───
    return (
        <div className="onboarding-page">
            <div className="onboarding-bg" />

            <div className="onboarding-card">
                {/* Header */}
                <div className="onboarding-header">
                    <img src="/assets/logo.png" alt="LogicQ1" className="onboarding-logo" />
                    <div className="onboarding-badge">Setup</div>
                    <h1 className="onboarding-title">Set Up Your Organization</h1>
                    <p className="onboarding-subtitle">
                        {user?.firstName ? `Welcome, ${user.firstName}! ` : ""}
                        Let's get your workspace ready in just a few steps.
                    </p>
                </div>

                {/* Progress */}
                <div className="onboarding-progress">
                    <div className="onboarding-progress-dot completed" />
                    <div className="onboarding-progress-dot active" />
                    <div className="onboarding-progress-dot" />
                </div>

                {/* Form */}
                <form
                    className="onboarding-form onboarding-step-enter"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Organization Name */}
                    <div className="onboarding-field">
                        <input
                            id="org-name"
                            type="text"
                            className={`onboarding-input${fieldErrors.name ? " has-error" : ""}`}
                            placeholder=" "
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            disabled={submitting}
                            autoFocus
                        />
                        <label htmlFor="org-name" className="onboarding-label">
                            Organization Name
                        </label>
                        {fieldErrors.name && (
                            <div className="onboarding-field-error">{fieldErrors.name}</div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="onboarding-field">
                        <input
                            id="org-category"
                            type="text"
                            className={`onboarding-input${fieldErrors.category ? " has-error" : ""}`}
                            placeholder=" "
                            value={form.category}
                            onChange={(e) => updateField("category", e.target.value)}
                            disabled={submitting}
                        />
                        <label htmlFor="org-category" className="onboarding-label">
                            Category
                        </label>
                        <div className="onboarding-helper">
                            e.g. Technology, Finance, Healthcare, Education
                        </div>
                        {fieldErrors.category && (
                            <div className="onboarding-field-error">{fieldErrors.category}</div>
                        )}
                    </div>

                    {/* Country */}
                    <div className="onboarding-field">
                        <input
                            id="org-country"
                            type="text"
                            className={`onboarding-input${fieldErrors.country ? " has-error" : ""}`}
                            placeholder=" "
                            value={form.country}
                            onChange={(e) => updateField("country", e.target.value)}
                            disabled={submitting}
                        />
                        <label htmlFor="org-country" className="onboarding-label">
                            Country
                        </label>
                        {fieldErrors.country && (
                            <div className="onboarding-field-error">{fieldErrors.country}</div>
                        )}
                    </div>

                    {/* Website URL */}
                    <div className="onboarding-field">
                        <input
                            id="org-website"
                            type="text"
                            className={`onboarding-input${fieldErrors.websiteUrl ? " has-error" : ""}`}
                            placeholder=" "
                            value={form.websiteUrl}
                            onChange={(e) => updateField("websiteUrl", e.target.value)}
                            disabled={submitting}
                        />
                        <label htmlFor="org-website" className="onboarding-label">
                            Website URL
                        </label>
                        {fieldErrors.websiteUrl && (
                            <div className="onboarding-field-error">{fieldErrors.websiteUrl}</div>
                        )}
                    </div>

                    {/* API Error */}
                    {apiError && <div className="onboarding-error-banner">{apiError}</div>}

                    {/* Submit */}
                    <button type="submit" className="onboarding-submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <span className="onboarding-spinner" />
                                Creating…
                            </>
                        ) : (
                            <>
                                Create Organization
                                <span className="arrow">→</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
