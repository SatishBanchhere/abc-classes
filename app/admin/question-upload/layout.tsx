// app/admin/question-upload/page.tsx (Server Component)
import {getAllExamData} from "@/utils/fetchDataFromJson"
import ClientPage from "./ClientPage"

export default async function Page() {
    const examData = await getAllExamData()
    console.log("Server data in page:", examData) // This should show your data

    return <ClientPage examData={examData} />
}
