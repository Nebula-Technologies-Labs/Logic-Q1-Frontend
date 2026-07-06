import {
    type ReactNode,
} from "react";

import {
    Provider,
} from "react-redux";

import {
    BrowserRouter,
} from "react-router-dom";

import {
    AuthProvider,
} from "../features/auth/authContext";

import store from "./store";

const AppProviders = ({
    children,
}: {
    children: ReactNode;
}) => (
    <BrowserRouter>
        <Provider store={store}>
            <AuthProvider>{children}</AuthProvider>
        </Provider>
    </BrowserRouter>
);

export default AppProviders;
