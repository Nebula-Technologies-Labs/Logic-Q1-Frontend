import {
    type ReactNode,
} from "react";

import {
    BrowserRouter,
} from "react-router-dom";

import {
    AuthProvider,
} from "../features/auth/authContext";

const AppProviders = ({
    children,
}: {
    children: ReactNode;
}) => (
    <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
);

export default AppProviders;
