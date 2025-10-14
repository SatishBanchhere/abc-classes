// app/test/[id]/layout.tsx
import { ReactNode } from 'react'
import { getTestById } from '@/lib/data-fetcher'
import { TestProvider } from './TestContext'

type TestLayoutProps = {
    children: ReactNode
    params: {
        id: string
    }
}

export default async function TestLayout({ children, params }: TestLayoutProps) {
    const testId = params.id
    const dataFromAPI = await getTestById(testId)

    function fixTimestamps(obj: any): any {
        if (Array.isArray(obj)) return obj.map(fixTimestamps)
        if (obj !== null && typeof obj === 'object') {
            const newObj: any = {}
            for (const key in obj) {
                const value = obj[key]
                if (
                    value &&
                    typeof value === 'object' &&
                    '_seconds' in value &&
                    '_nanoseconds' in value
                ) {
                    newObj[key] = new Date(value._seconds * 1000).toISOString()
                } else {
                    newObj[key] = fixTimestamps(value)
                }
            }
            return newObj
        }
        return obj
    }

    const data = fixTimestamps(dataFromAPI)

    return (

        <TestProvider data={data} testId={testId}>
            {children}
        </TestProvider>
    )
}
