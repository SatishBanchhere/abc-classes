"use client"

import {useState, useEffect} from "react";
import {Chapter} from "@/types/Chapter";
import {getChaptersFromExamSubject} from "@/utils/fetchDataFromJson";

export function useExamSubjectChapters(examName:string, subjectName:string){
    const [data, setData] = useState<Chapter[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState<boolean>(true);

    useEffect(() => {
        if(!examName || !subjectName){
            return;
        }
        const fetchChapters = async () => {
            setLoading(true);
            setError(null);
            try{
                const result:Chapter[] = await getChaptersFromExamSubject(examName, subjectName);
                setData(result);
            }
            catch(err){
                setError("Failed to load chapters");
                setData([]);
            }
            finally{
                setLoading(false);
            }
        }

        fetchChapters();
    }, [examName, subjectName, refetchTrigger]);

    const refetch = () => {
        setRefetchTrigger(prev => !prev);
    }

    return {data, loading, error, refetch};
}