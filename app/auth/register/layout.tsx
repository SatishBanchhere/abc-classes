import { cookies } from 'next/headers'
import {redirect} from "next/navigation";
import React, {ReactNode} from "react";
import {ReadonlyRequestCookies} from "next/dist/server/web/spec-extension/adapters/request-cookies";
import {RequestCookie, RequestCookies} from "next/dist/compiled/@edge-runtime/cookies";

type RegisterLayoutProps = {
    children: ReactNode;
}

async function RegisterLayout({children}:RegisterLayoutProps) {
    const cookieStore:ReadonlyRequestCookies = await cookies()
    const session_cookie:RequestCookie | undefined = cookieStore.get("refresh_token");

    if(session_cookie){
        redirect('/')
    }

    return (
        <>
            {children}
        </>
    );
}

export default RegisterLayout;
