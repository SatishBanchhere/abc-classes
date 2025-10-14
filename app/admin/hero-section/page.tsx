import { getHomePageData } from "@/lib/data-fetcher";
import ClientPage from "./ClientPage"

export default async function AdminDashboardPage(){
    const homeData = await getHomePageData();
    console.log({homeData})
    return (
        <ClientPage homeData={homeData}/>
    )
}