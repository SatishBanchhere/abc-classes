import ClientPage from "./ClientPage"
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Student } from "@/types/Student";

const fetchStudents = async (): Promise<Student[]> => {
    console.log("🚀 fetchStudents called...");

    try {
        const snapshot = await getDocs(collection(db, "students"));
        console.log(`📥 Fetched ${snapshot.size} student docs from Firestore`);
        const data = snapshot.docs.map((doc) => {
        const raw = doc.data();

        return {
            id: doc.id,
            ...raw,
            createdAt: raw.createdAt instanceof Timestamp
            ? raw.createdAt.toDate().toISOString()
            : raw.createdAt ?? null,
        };
        }) as Student[];

        console.log("✅ Final mapped data:", data);

        console.log("📦 setStudents called");
        return data;
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        return [];
    } finally {
        console.log("⏳ setLoading(false) called");
    }
};

export default async function AdminDashboardPage(){
    const studentsData:Student[] = await fetchStudents();
    console.log({studentsData})
    return (
        <ClientPage studentsData={studentsData}/>
    )
}