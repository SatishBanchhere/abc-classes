import { Suspense } from "react";

export default function PrintLayout({ children }) {
    return (
        <Suspense fallback={<div>Loading test...</div>}>
            {children}
        </Suspense>
    );
}