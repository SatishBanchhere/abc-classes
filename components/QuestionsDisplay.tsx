"use client";

import React from "react";

type Question = {
    question_no: number;
    question_type: "mcq" | "integer";
    question_description: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    option4: string | null;
};

type Props = {
    questions: Question[];
};

export default function QuestionsDisplay({ questions }: Props) {
    return (
        <div className="space-y-6 px-6 py-10 max-w-4xl mx-auto">
            {questions.map((q) => (
                <div key={q.question_no} className="bg-white shadow rounded-xl p-6 border">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-800">Question {q.question_no}</h2>
                        <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
              {q.question_type}
            </span>
                    </div>

                    <div
                        className="prose max-w-none mb-0"
                        dangerouslySetInnerHTML={{ __html: q.question_description }}
                    />

                    {q.question_type === "mcq" && (
                        <div className="mt-2 space-y-2 text-gray-700">
                            {q.option1 && (
                                <div className="border px-4 py-2 rounded-md bg-gray-50">
                                    A. <span dangerouslySetInnerHTML={{ __html: q.option1.replace(/<p[^>]*>|<\/p>/g, "") }} />
                                </div>
                            )}
                            {q.option2 && (
                                <div className="border px-4 py-2 rounded-md bg-gray-50">
                                    B. <span dangerouslySetInnerHTML={{ __html: q.option2.replace(/<p[^>]*>|<\/p>/g, "") }} />
                                </div>
                            )}
                            {q.option3 && (
                                <div className="border px-4 py-2 rounded-md bg-gray-50">
                                    C. <span dangerouslySetInnerHTML={{ __html: q.option3.replace(/<p[^>]*>|<\/p>/g, "") }} />
                                </div>
                            )}
                            {q.option4 && (
                                <div className="border px-4 py-2 rounded-md bg-gray-50">
                                    D. <span dangerouslySetInnerHTML={{ __html: q.option4.replace(/<p[^>]*>|<\/p>/g, "") }} />
                                </div>
                            )}
                        </div>

                    )}

                </div>
            ))}
        </div>
    );
}
