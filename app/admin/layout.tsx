import { getHomePageData } from "@/lib/data-fetcher";
import ClientLayout from "./ClientLayout"
import { ReactNode } from "react";

export default async function AdminDashboardPage({children}: {children: ReactNode}){
    const homeData = await getHomePageData();
    console.log({homeData})
    return (
        <ClientLayout homeData={homeData} children={children}/>
    )
}