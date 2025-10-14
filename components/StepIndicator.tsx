"use client"

import {Check, CheckIcon, Sparkles} from "lucide-react"
import { useState, useEffect } from "react"

interface Step {
    number: number
    title: string
    description: string
}

interface StepIndicatorProps {
    steps: Step[]
    currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    const [animatedStep, setAnimatedStep] = useState(1)

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedStep(currentStep)
        }, 100)
        return () => clearTimeout(timer)
    }, [currentStep])

    return (
        <div className="relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 opacity-70 animate-pulse" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-30 animate-bounce`}
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${10 + (i % 2) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-8 mx-4">
                {/* Header */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="h-6 w-6 text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Progress Journey
                        </h2>
                        <Sparkles className="h-6 w-6 text-indigo-500 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                    </div>
                </div>

                <nav aria-label="Progress">
                    <ol className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-8 sm:space-y-0">
                        {steps.map((step, stepIdx) => (
                            <li key={step.number} className={`relative flex-1 ${stepIdx !== steps.length - 1 ? "sm:pr-8" : ""}`}>
                                {/* Connection line for desktop */}
                                {stepIdx !== steps.length - 1 && (
                                    <div className="hidden sm:block absolute top-6 left-12 right-0 h-1 -z-10">
                                        <div className="h-full bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out ${
                                                    step.number < animatedStep ? 'w-full' : 'w-0'
                                                }`}
                                                style={{
                                                    background: step.number < animatedStep
                                                        ? 'linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6, #06b6d4)'
                                                        : undefined,
                                                    backgroundSize: '200% 100%',
                                                    animation: step.number < animatedStep ? 'shimmer 2s infinite' : undefined
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Connection line for mobile */}
                                {stepIdx !== steps.length - 1 && (
                                    <div className="block sm:hidden absolute top-16 left-6 w-1 h-16">
                                        <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`w-full bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out ${
                                                    step.number < animatedStep ? 'h-full' : 'h-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="relative flex items-start">
                                    {/* Step circle */}
                                    <div className="relative flex-shrink-0">
                                        <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full border-3 transition-all duration-500 transform ${
                                                step.number < animatedStep
                                                    ? "border-purple-500 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-2xl shadow-purple-500/50 scale-110"
                                                    : step.number === animatedStep
                                                        ? "border-indigo-500 bg-white shadow-2xl shadow-indigo-500/30 ring-4 ring-purple-100 scale-105 animate-pulse"
                                                        : "border-gray-300 bg-white shadow-lg hover:shadow-xl hover:scale-105"
                                            }`}
                                        >
                                            {step.number < animatedStep ? (
                                                <CheckIcon className="h-6 w-6 text-white drop-shadow-sm" />
                                            ) : (
                                                <span
                                                    className={`text-sm font-bold transition-colors duration-300 ${
                                                        step.number === animatedStep
                                                            ? "text-indigo-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                          {step.number}
                        </span>
                                            )}
                                        </div>

                                        {/* Glowing effect for completed steps */}
                                        {step.number < animatedStep && (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 animate-ping" />
                                        )}

                                        {/* Current step glow */}
                                        {step.number === animatedStep && (
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-30 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Step content */}
                                    <div className="ml-4 min-w-0 flex-1">
                                        <p
                                            className={`text-lg font-bold mb-1 transition-all duration-300 ${
                                                step.number <= animatedStep
                                                    ? "text-gray-900"
                                                    : "text-gray-500"
                                            } ${
                                                step.number === animatedStep
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                                    : ""
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                        <p className={`text-sm transition-colors duration-300 ${
                                            step.number <= animatedStep ? "text-gray-600" : "text-gray-400"
                                        }`}>
                                            {step.description}
                                        </p>

                                        {/* Progress indicator text */}
                                        {step.number === animatedStep && (
                                            <div className="mt-2 flex items-center space-x-1">
                                                <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-medium text-indigo-600">In Progress</span>
                                            </div>
                                        )}

                                        {step.number < animatedStep && (
                                            <div className="mt-2 flex items-center space-x-1">
                                                <CheckIcon className="h-3 w-3 text-green-500" />
                                                <span className="text-xs font-medium text-green-600">Completed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </nav>

                {/* Progress bar at bottom */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                        <span className="text-sm font-bold text-indigo-600">
              {Math.round(((animatedStep - 1) / (steps.length - 1)) * 100)}%
            </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${((animatedStep - 1) / (steps.length - 1)) * 100}%`,
                                background: 'linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6)',
                                backgroundSize: '200% 100%',
                                animation: animatedStep > 1 ? 'shimmer 3s infinite' : undefined
                            }}
                        />
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
        </div>
    )
}