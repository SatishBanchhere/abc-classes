import {db} from '@/lib/firebase';
import {collection, doc, getDocs, setDoc, writeBatch} from 'firebase/firestore';
import {Chapter} from "@/types/Chapter";
import {SubjectData} from "@/types/SubjectData";


export async function getExam(): Promise<string[]> {
    try {
        const examsRef = collection(db, "exams");
        const examsSnapShot = await getDocs(examsRef);
        return examsSnapShot.docs.map(doc => doc.id) as string[];
    } catch (error) {
        console.error("Error fetching exams: ", error);
        return [];
    }
}

export async function getSubjectForExam(examName: string): Promise<SubjectData> {
    const result: SubjectData = {};
    try {
        const examKey = examName.toUpperCase();
        if (!examKey) return {};
        const subjectsRef = collection(db, `questions_${examKey}`);
        const subjectsSnap = await getDocs(subjectsRef);
        for (const subjectDoc of subjectsSnap.docs) {
            const subjectName = subjectDoc.id;
            result[subjectName] = await getChaptersFromExamSubject(examName, subjectName);
        }
        return result;
    } catch (error) {
        console.error("Error fetching subjects: ", error);
        return {};
    }
}

export async function getChaptersFromExamSubject(examName: string, subjectName: string): Promise<Chapter[]> {
    const result: Chapter[] = [];
    try {
        const examKey = examName.toUpperCase();
        if (!examKey) return [];
        const topicsRef = collection(db, `questions_${examKey}/${subjectName}/topics`);
        const topicsSnapShot = await getDocs(topicsRef);
        for (const topicDoc of topicsSnapShot.docs) {
            const chapterName = topicDoc.id;
            const subtopicsRef = collection(db, `questions_${examKey}/${subjectName}/topics/${chapterName}/subtopics`);
            const subtopicsSnap = await getDocs(subtopicsRef);
            const subtopicNames = subtopicsSnap.docs.map(doc => doc.id);
            result.push({
                chapter: chapterName,
                subtopics: subtopicNames,
                number: 0
            })
        }
        return result;
    } catch (error) {
        console.error("Error fetching subjects: ", error);
        return [];
    }
}

type Subtopic = {
    name: string;
    totalQuestions: number;
};

type Chapter = {
    name: string;
    totalQuestions: number;
    subtopics: Subtopic[];
};

type Subject = {
    name: string;
    chapters: Chapter[];
};

type Exam = {
    name: string;
    subjects: Subject[];
};

export async function getAllExamData(): Promise<Exam[]> {
    try {
        console.log("🚀 Fetching all exams...");

        // 1️⃣ Fetch all exams
        const examsSnap = await getDocs(collection(db, "exams"));
        console.log(`📥 Exams fetched: ${examsSnap.size} docs`);

        const exams = examsSnap.docs.map((doc) => doc.id);
        console.log("📝 Exam IDs:", exams);

        // 2️⃣ For each exam, fetch subjects
        const allExamData = await Promise.all(
            exams.map(async (examName) => {
                console.log(`\n🔎 Processing exam: ${examName}`);

                const subjectsSnap = await getDocs(collection(db, `questions_${examName}`));
                console.log(`📥 Subjects fetched for exam '${examName}': ${subjectsSnap.size} docs`);

                const subjects = await Promise.all(
                    subjectsSnap.docs.map(async (subjectDoc) => {
                        const subjectName = subjectDoc.id;
                        console.log(`  📚 Subject: ${subjectName}`);

                        // 3️⃣ Fetch chapters for this subject
                        const chaptersSnap = await getDocs(
                            collection(db, `questions_${examName}/${subjectName}/topics`)
                        );
                        console.log(`    📥 Chapters fetched for subject '${subjectName}': ${chaptersSnap.size} docs`);

                        const chapters = await Promise.all(
                            chaptersSnap.docs.map(async (chapterDoc) => {
                                const chapterName = chapterDoc.id;
                                const chapterData = chapterDoc.data();
                                console.log(`    🔖 Chapter: ${chapterName}`, chapterData);

                                // 4️⃣ Fetch subtopics for this chapter
                                const subtopicsSnap = await getDocs(
                                    collection(db, `questions_${examName}/${subjectName}/topics/${chapterName}/subtopics`)
                                );
                                console.log(`      📥 Subtopics fetched for chapter '${chapterName}': ${subtopicsSnap.size} docs`);

                                const subtopics = subtopicsSnap.docs.map((subtopicDoc) => {
                                    const subtopicData = subtopicDoc.data();
                                    console.log(`        📝 Subtopic: ${subtopicDoc.id}`, subtopicData);

                                    return {
                                        name: subtopicDoc.id,
                                        totalQuestions: subtopicData.totalQuestions || 0,
                                    };
                                });

                                return {
                                    name: chapterName,
                                    totalQuestions: chapterData.totalQuestions || 0,
                                    subtopics,
                                };
                            })
                        );

                        return {
                            name: subjectName,
                            chapters,
                        };
                    })
                );

                return {
                    name: examName,
                    subjects,
                };
            })
        );

        console.log("✅ Final structured exam data:", allExamData);
        return allExamData;
    } catch (error) {
        console.error("❌ Error fetching all exam data:", error);
        return [];
    }
}


export async function addNewExam(examName: string): Promise<boolean> {
    try {
        const examKey = examName.toUpperCase();
        const examRef = doc(db, "exams", examKey);
        await setDoc(examRef, {
            name: examName,
            createdAt: new Date(),
            status: "active"
        });
        return true;
    } catch (error) {
        console.error("Error adding new exam: ", error);
        return false;
    }
}

export async function addNewsubject(examName: string, subjectName: string): Promise<boolean> {
    try {
        const examKey = examName.toUpperCase();
        const subjectRef = doc(db, `questions_${examKey}`, subjectName);
        await setDoc(subjectRef, {
            name: subjectName,
            createdAt: new Date(),
            status: "active"
        })
        return true;
    } catch (error) {
        console.error("Error adding new subject: ", error);
        return false;
    }
}

export async function addNewChapters(examName: string, subjectName: string, chapterNameList: [string, number][]): Promise<boolean> {
    try {
        const examKey = examName.toUpperCase();
        const batch = writeBatch(db);

        chapterNameList.forEach(([chapterName, Value]) => {
            const chapterRef = doc(db, `questions_${examKey}/${subjectName}/topics`, chapterName);
            batch.set(chapterRef, {
                name: chapterName,
                index: Value,
                createdAt: new Date(),
                status: "active"
            });
        })

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error adding chapter: ", error);
        return false;
    }
}

export async function addNewSubtopics(examName: string, subjectName: string, chapterName: string, subtopics: [string, number][]): Promise<boolean> {
    try {
        const examKey = examName.toUpperCase();
        const batch = writeBatch(db);

        subtopics.forEach(([subtopic, value]) => {
            const subtopicRef = doc(db, `questions_${examKey}/${subjectName}/topics/${chapterName}/subtopics`, subtopic);
            batch.set(subtopicRef, {
                name: subtopic,
                index: value,
                createdAt: new Date(),
                status: "active"
            });
        })

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error adding new subtopics", error);
        return false;
    }
}