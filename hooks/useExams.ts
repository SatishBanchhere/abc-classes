"use client"

import {useState, useEffect} from "react";
import {getExam} from "@/utils/fetchDataFromJson";

export function useExams(){
    const [exams, setExams]= useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchExams = async () => {
            try{
                const result:string[] = await getExam();
                setExams(result);
            }
            catch(error){
                setError("Failed to load exams");
                setExams([]);
            }
            finally {
                setLoading(false);
            }
        }

        fetchExams();
    }, [refetchTrigger])

    const refetch = () => {
        setRefetchTrigger(prev => !prev);
    }

    return { exams, loading, error, refetch };
}