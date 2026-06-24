import {
    useEffect,
} from "react";

import {
    useNavigate,
} from "react-router-dom";


import {
    storage,
} from "../../../utils/storage";

import {
    useAuth,
} from "../hooks";

export default function OAuthRedirect() {

    const navigate = useNavigate();

    const { login } = useAuth();

    useEffect(() => {

        const completeLogin =
            async () => {

                try {

                    const params =
                        new URLSearchParams(
                            window.location.search
                        );

                    const token =
                        params.get("token");

                    if(token==undefined){
                        throw new Error("Token not found in URL parameters");
                    }

                    await login(token);

                    navigate(
                        "/dashboard",
                        {
                            replace: true,
                        }
                    );

                } catch {

                    storage.clear();

                    navigate(
                        "/login"
                    );
                }
            };

        completeLogin();

    }, []);

    return (

        <div>

            Signing you in...

        </div>

    );
}