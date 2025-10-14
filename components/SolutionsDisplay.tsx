"use client";

import React from "react";

type Solution = {
    question_no: number;
    solution: string;
    answer: string;
};

type Props = {
    solutions: Solution[];
};

export default function SolutionsDisplay({ solutions }: Props) {
    return (
        <div className="space-y-8 px-6 py-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">Detailed Solutions</h1>

            {solutions.map((sol) => (
                <div key={sol.question_no} className="bg-white shadow rounded-xl p-6 border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Solution for Question {sol.question_no}
                        </h2>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                            Answer: {sol.answer}
                        </span>
                    </div>

                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: sol.solution }}
                    />
                </div>
            ))}
        </div>
    );
}