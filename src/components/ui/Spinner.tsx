const Spinner = ({
    message = "Loading...",
    size = "md",
}: {
    message?: string;
    size?: "sm" | "md" | "lg";
}) => {
    const sizeClasses = {
        sm: "h-6 w-6 border-2",
        md: "h-10 w-10 border-4",
        lg: "h-14 w-14 border-4",
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
            <div className="text-center space-y-3">
                <div
                    className={`mx-auto animate-spin rounded-full border-slate-200 border-t-blue-600 ${sizeClasses[size]}`}
                />
                {message && <p className="text-sm">{message}</p>}
            </div>
        </div>
    );
};

export default Spinner;
