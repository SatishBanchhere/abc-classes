"use client"

import {useEffect, useState} from "react";
import {getSubjectForExam} from "@/utils/fetchDataFromJson";
import {SubjectData} from "@/types/SubjectData";

export function useExamSubjects(examName: string){
    const [subjects, setSubjects] = useState<SubjectData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState<boolean>(true);

    useEffect(() => {
        if(!examName){
            return;
        }
        const fetchSubjects = async () => {
            setLoading(true);
            setError(null);

            try{
                const result:SubjectData = await getSubjectForExam(examName);
                setSubjects(result);
            }
            catch(error){
                setError("Failed to load subject");
                setSubjects({});
            }
            finally {
                setLoading(false);
            }
        }

        fetchSubjects();
    }, [examName, refetchTrigger]);

    const refetch = () => {
        setRefetchTrigger(prev => !prev);
    }

    return { subjects, loading, error, refetch };
}