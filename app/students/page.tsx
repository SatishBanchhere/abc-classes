"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import MainNav from "@/components/main-nav"
import StudentDashboard from "@/app/students/student-dashboard"
import axios, { type AxiosResponse } from "axios"
import type { studentDataType } from "@/app/types/students"
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust based on your path
import { getAuth } from "firebase/auth";

const initialStudentData: studentDataType = {
    name: "",
    email: "",
    password: "",
    phone_number: "",
    phone_parent: "",
    exam_type: "",
    role: "",
    batch: "",
    userId: ""
}

export default function Home() {
    const router = useRouter()
    const [studentData, setStudentData] = useState<studentDataType>(initialStudentData)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) throw new Error("User not logged in");

                const docRef = doc(db, "students", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const studentData:studentDataType = {...docSnap.data(), userId: user.uid} as studentDataType;
                    console.log("Student Data From Page:", studentData);
                    setStudentData(studentData);
                } else {
                    console.log("No such student document!");
                    return null;
                }
            } catch (error) {
                console.error("Failed to fetch student data:", error);
                return null;
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudentData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
                <div className="text-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-[#1a73e8] to-[#4285f4] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
            <MainNav studentData={studentData} />
            <StudentDashboard studentData={studentData} />
        </div>
    )
}
