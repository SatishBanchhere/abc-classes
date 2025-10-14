import React, {ReactNode} from "react";

type LoginLayoutProps = {
    children: ReactNode;
}

async function LoginLayout({children}:LoginLayoutProps) {

    return (
        <>
            {children}
        </>
    );
}

export default LoginLayout;
