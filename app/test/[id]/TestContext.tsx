// app/test/[id]/TestContext.tsx
'use client'

import { createContext, useContext } from 'react'

const TestContext = createContext<{ data: any, testId: string } | undefined>(undefined)

export const useTest = () => {
    const ctx = useContext(TestContext)
    if (!ctx) throw new Error('useTest must be used within a TestProvider')
    return ctx
}

export const TestProvider = ({ children, data, testId }: any) => {
    return (
        <TestContext.Provider value={{ data, testId }}>
            {children}
        </TestContext.Provider>
    )
}
