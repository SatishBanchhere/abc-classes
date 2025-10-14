import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';
// import { ExamType } from '@/types/';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType') as ExamType;
        const endpoint = searchParams.get('endpoint');

        if (!examType || !['JEE', 'NEET'].includes(examType)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Valid exam type (JEE or NEET) is required' 
            }, { status: 400 });
        }

        const connection = await connectDB(examType);
        const { Subject, Topic, Subtopic, Question } = getModels(connection);

        // Handle different endpoints in single route
        switch (endpoint) {
            case 'overview':
                return getOverviewData(Subject, Question);
            case 'subjects':
                return getSubjectsData(Subject, Topic, Question);
            case 'topics':
                const subjectId = searchParams.get('subjectId');
                return getTopicsData(Topic, Subtopic, Question, subjectId);
            case 'subtopics':
                const topicId = searchParams.get('topicId');
                return getSubtopicsData(Subtopic, Question, topicId);
            case 'questions':
                return getQuestionsData(Question, searchParams);
            case 'analytics':
                return getDetailedAnalytics(Subject, Topic, Subtopic, Question);
            case 'timeline':
                return getTimelineData(Question, searchParams);
            default:
                // Return complete dashboard data
                return getCompleteDashboard(Subject, Topic, Subtopic, Question);
        }
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to fetch dashboard data', 
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

async function getOverviewData(Subject: any, Question: any) {
    const [totalStats, difficultyStats, typeStats, recentActivity] = await Promise.all([
        // Basic counts
        Promise.all([
            Subject.countDocuments({}),
            Question.countDocuments({}),
            Question.distinct('topicId').then((topics: any) => topics.length),
            Question.distinct('subtopicName').then((subtopics: any) => subtopics.length)
        ]),
        
        // Difficulty distribution
        Question.aggregate([
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 },
                    percentage: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$count' },
                    difficulties: { $push: { difficulty: '$_id', count: '$count' } }
                }
            },
            {
                $project: {
                    difficulties: {
                        $map: {
                            input: '$difficulties',
                            as: 'diff',
                            in: {
                                difficulty: '$$diff.difficulty',
                                count: '$$diff.count',
                                percentage: { $round: [{ $multiply: [{ $divide: ['$$diff.count', '$total'] }, 100] }, 1] }
                            }
                        }
                    }
                }
            }
        ]),

        // Question type distribution
        Question.aggregate([
            { $group: { _id: '$questionType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),

        // Recent activity (last 30 days)
        Question.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    subjects: { $addToSet: '$subjectName' },
                    topics: { $addToSet: '$topicName' },
                    difficulties: { $push: '$difficulty' }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ])
    ]);

    return NextResponse.json({
        success: true,
        data: {
            totals: {
                subjects: totalStats[0],
                questions: totalStats[1], 
                topics: totalStats[2],
                subtopics: totalStats[3]
            },
            difficultyDistribution: difficultyStats[0]?.difficulties || [],
            questionTypeDistribution: typeStats,
            recentActivity: recentActivity
        }
    });
}

async function getSubjectsData(Subject: any, Topic: any, Question: any) {
    const subjects = await Subject.aggregate([
        {
            $lookup: {
                from: 'topics',
                localField: 'subjectId', 
                foreignField: 'subjectId',
                as: 'topics'
            }
        },
        {
            $lookup: {
                from: 'questions',
                localField: 'subjectId',
                foreignField: 'subjectId', 
                as: 'questions'
            }
        },
        {
            $project: {
                subjectId: 1,
                name: 1,
                examType: 1,
                topicCount: { $size: '$topics' },
                totalQuestions: { $size: '$questions' },
                createdAt: 1,
                lastUpdated: { 
                    $max: {
                        $map: {
                            input: '$questions',
                            as: 'q',
                            in: '$$q.createdAt'
                        }
                    }
                },
                difficultyBreakdown: {
                    $reduce: {
                        input: '$questions',
                        initialValue: { Easy: 0, Medium: 0, Hard: 0 },
                        in: {
                            Easy: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Easy'] },
                                    { $add: ['$$value.Easy', 1] },
                                    '$$value.Easy'
                                ]
                            },
                            Medium: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Medium'] },
                                    { $add: ['$$value.Medium', 1] },
                                    '$$value.Medium'
                                ]
                            },
                            Hard: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Hard'] },
                                    { $add: ['$$value.Hard', 1] },
                                    '$$value.Hard'
                                ]
                            }
                        }
                    }
                },
                questionTypes: {
                    $reduce: {
                        input: '$questions',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[
                                        {
                                            k: '$$this.questionType',
                                            v: {
                                                $add: [
                                                    { $ifNull: [{ $getField: { field: '$$this.questionType', input: '$$value' } }, 0] },
                                                    1
                                                ]
                                            }
                                        }
                                    ]]
                                }
                            ]
                        }
                    }
                },
                dailyActivity: {
                    $reduce: {
                        input: '$questions',
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                '$$value',
                                {
                                    $arrayToObject: [[
                                        {
                                            k: { $dateToString: { format: '%Y-%m-%d', date: '$$this.createdAt' } },
                                            v: {
                                                $add: [
                                                    { $ifNull: [{ $getField: { field: { $dateToString: { format: '%Y-%m-%d', date: '$$this.createdAt' } }, input: '$$value' } }, 0] },
                                                    1
                                                ]
                                            }
                                        }
                                    ]]
                                }
                            ]
                        }
                    }
                }
            }
        },
        { $sort: { totalQuestions: -1 } }
    ]);

    return NextResponse.json({ success: true, data: subjects });
}

async function getTopicsData(Topic: any, Subtopic: any, Question: any, subjectId: string | null) {
    if (!subjectId) {
        return NextResponse.json({ success: false, error: 'Subject ID required' }, { status: 400 });
    }

    const topics = await Topic.aggregate([
        { $match: { subjectId } },
        {
            $lookup: {
                from: 'subtopics',
                localField: 'topicId',
                foreignField: 'topicId',
                as: 'subtopics'
            }
        },
        {
            $lookup: {
                from: 'questions', 
                localField: 'topicId',
                foreignField: 'topicId',
                as: 'questions'
            }
        },
        {
            $project: {
                topicId: 1,
                name: 1,
                subjectId: 1,
                subjectName: 1,
                examType: 1,
                subtopicCount: { $size: '$subtopics' },
                totalQuestions: { $size: '$questions' },
                subtopicNames: '$subtopics.name',
                createdAt: 1,
                difficultyBreakdown: {
                    $reduce: {
                        input: '$questions',
                        initialValue: { Easy: 0, Medium: 0, Hard: 0 },
                        in: {
                            Easy: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Easy'] },
                                    { $add: ['$$value.Easy', 1] },
                                    '$$value.Easy'
                                ]
                            },
                            Medium: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Medium'] },
                                    { $add: ['$$value.Medium', 1] },
                                    '$$value.Medium'
                                ]
                            },
                            Hard: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Hard'] },
                                    { $add: ['$$value.Hard', 1] },
                                    '$$value.Hard'
                                ]
                            }
                        }
                    }
                }
            }
        },
        { $sort: { totalQuestions: -1 } }
    ]);

    return NextResponse.json({ success: true, data: topics });
}

async function getSubtopicsData(Subtopic: any, Question: any, topicId: string | null) {
    if (!topicId) {
        return NextResponse.json({ success: false, error: 'Topic ID required' }, { status: 400 });
    }

    const subtopics = await Subtopic.aggregate([
        { $match: { topicId } },
        {
            $lookup: {
                from: 'questions',
                let: { 
                    subtopicName: '$name',
                    topicId: '$topicId',
                    subjectId: '$subjectId'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$subtopicName', '$$subtopicName'] },
                                    { $eq: ['$topicId', '$$topicId'] },
                                    { $eq: ['$subjectId', '$$subjectId'] }
                                ]
                            }
                        }
                    }
                ],
                as: 'questions'
            }
        },
        {
            $project: {
                name: 1,
                topicId: 1,
                topicName: 1, 
                subjectId: 1,
                examType: 1,
                totalQuestions: { $size: '$questions' },
                createdAt: 1,
                difficultyBreakdown: {
                    $reduce: {
                        input: '$questions',
                        initialValue: { Easy: 0, Medium: 0, Hard: 0 },
                        in: {
                            Easy: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Easy'] },
                                    { $add: ['$$value.Easy', 1] },
                                    '$$value.Easy'
                                ]
                            },
                            Medium: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Medium'] },
                                    { $add: ['$$value.Medium', 1] },
                                    '$$value.Medium'
                                ]
                            },
                            Hard: {
                                $cond: [
                                    { $eq: ['$$this.difficulty', 'Hard'] },
                                    { $add: ['$$value.Hard', 1] },
                                    '$$value.Hard'
                                ]
                            }
                        }
                    }
                }
            }
        },
        { $sort: { totalQuestions: -1 } }
    ]);

    return NextResponse.json({ success: true, data: subtopics });
}

async function getQuestionsData(Question: any, searchParams: URLSearchParams) {
    const subjectId = searchParams.get('subjectId');
    const topicId = searchParams.get('topicId');
    const subtopicName = searchParams.get('subtopicName');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const matchConditions: any = {};
    if (subjectId) matchConditions.subjectId = subjectId;
    if (topicId) matchConditions.topicId = topicId;
    if (subtopicName) matchConditions.subtopicName = subtopicName;

    const skip = (page - 1) * limit;

    const [questions, totalCount] = await Promise.all([
        Question.find(matchConditions)
            .select({
                questionNo: 1,
                questionType: 1,
                difficulty: 1,
                questionDescription: 1,
                options: 1,
                correctAnswer: 1,
                solution: 1,
                subjectName: 1,
                topicName: 1,
                subtopicName: 1,
                locked: 1,
                createdAt: 1,
                updatedAt: 1
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        
        Question.countDocuments(matchConditions)
    ]);

    const questionsWithPreview = questions.map((q: any) => ({
        ...q,
        questionPreview: q.questionDescription.substring(0, 150) + (q.questionDescription.length > 150 ? '...' : ''),
        createdAtFormatted: new Date(q.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }));

    return NextResponse.json({
        success: true,
        data: {
            questions: questionsWithPreview,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalQuestions: totalCount,
                hasMore: skip + questions.length < totalCount
            }
        }
    });
}

async function getDetailedAnalytics(Subject: any, Topic: any, Subtopic: any, Question: any) {
    const analytics = await Promise.all([
        // Daily question creation trend (last 30 days)
        Question.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    difficulties: {
                        $push: '$difficulty'
                    },
                    subjects: { $addToSet: '$subjectName' },
                    questionTypes: { $push: '$questionType' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    count: 1,
                    subjectCount: { $size: '$subjects' },
                    difficultyBreakdown: {
                        $reduce: {
                            input: '$difficulties',
                            initialValue: { Easy: 0, Medium: 0, Hard: 0 },
                            in: {
                                Easy: {
                                    $cond: [
                                        { $eq: ['$$this', 'Easy'] },
                                        { $add: ['$$value.Easy', 1] },
                                        '$$value.Easy'
                                    ]
                                },
                                Medium: {
                                    $cond: [
                                        { $eq: ['$$this', 'Medium'] },
                                        { $add: ['$$value.Medium', 1] },
                                        '$$value.Medium'
                                    ]
                                },
                                Hard: {
                                    $cond: [
                                        { $eq: ['$$this', 'Hard'] },
                                        { $add: ['$$value.Hard', 1] },
                                        '$$value.Hard'
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { date: -1 } },
            { $limit: 30 }
        ]),

        // Subject-wise weekly trends
        Question.aggregate([
            {
                $group: {
                    _id: {
                        subject: '$subjectName',
                        week: { 
                            $dateToString: { 
                                format: '%Y-W%U', 
                                date: '$createdAt' 
                            } 
                        }
                    },
                    count: { $sum: 1 },
                    avgDifficulty: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$difficulty', 'Easy'] }, then: 1 },
                                    { case: { $eq: ['$difficulty', 'Medium'] }, then: 2 },
                                    { case: { $eq: ['$difficulty', 'Hard'] }, then: 3 }
                                ],
                                default: 2
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$_id.subject',
                    weeklyData: {
                        $push: {
                            week: '$_id.week',
                            count: '$count',
                            avgDifficulty: { $round: ['$avgDifficulty', 2] }
                        }
                    },
                    totalQuestions: { $sum: '$count' }
                }
            },
            { $sort: { totalQuestions: -1 } }
        ]),

        // Question length analytics
        Question.aggregate([
            {
                $project: {
                    subjectName: 1,
                    difficulty: 1,
                    questionLength: { $strLenCP: '$questionDescription' },
                    hasOptions: { $ne: ['$options', null] },
                    hasSolution: { $ne: ['$solution', null] },
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: {
                        subject: '$subjectName',
                        difficulty: '$difficulty'
                    },
                    avgLength: { $avg: '$questionLength' },
                    minLength: { $min: '$questionLength' },
                    maxLength: { $max: '$questionLength' },
                    count: { $sum: 1 },
                    withOptions: { $sum: { $cond: ['$hasOptions', 1, 0] } },
                    withSolutions: { $sum: { $cond: ['$hasSolution', 1, 0] } }
                }
            },
            {
                $project: {
                    subject: '$_id.subject',
                    difficulty: '$_id.difficulty',
                    avgLength: { $round: ['$avgLength', 0] },
                    minLength: 1,
                    maxLength: 1,
                    count: 1,
                    optionRate: { $round: [{ $multiply: [{ $divide: ['$withOptions', '$count'] }, 100] }, 1] },
                    solutionRate: { $round: [{ $multiply: [{ $divide: ['$withSolutions', '$count'] }, 100] }, 1] }
                }
            },
            { $sort: { subject: 1, difficulty: 1 } }
        ])
    ]);

    return NextResponse.json({
        success: true,
        data: {
            dailyTrends: analytics[0],
            subjectWeeklyTrends: analytics[1],
            questionMetrics: analytics[2]
        }
    });
}

async function getTimelineData(Question: any, searchParams: URLSearchParams) {
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeline = await Question.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    hour: { $hour: '$createdAt' },
                    subject: '$subjectName'
                },
                count: { $sum: 1 },
                questions: {
                    $push: {
                        id: '$_id',
                        questionNo: '$questionNo', 
                        difficulty: '$difficulty',
                        questionType: '$questionType',
                        topicName: '$topicName',
                        subtopicName: '$subtopicName',
                        preview: { $substr: ['$questionDescription', 0, 100] }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$_id.date',
                totalCount: { $sum: '$count' },
                hourlyBreakdown: {
                    $push: {
                        hour: '$_id.hour',
                        subject: '$_id.subject', 
                        count: '$count',
                        questions: '$questions'
                    }
                },
                subjects: { $addToSet: '$_id.subject' }
            }
        },
        {
            $project: {
                date: '$_id',
                totalCount: 1,
                subjectCount: { $size: '$subjects' },
                hourlyBreakdown: 1,
                peakHour: {
                    $let: {
                        vars: {
                            maxHour: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: '$hourlyBreakdown',
                                            cond: {
                                                $eq: [
                                                    '$$this.count',
                                                    { $max: '$hourlyBreakdown.count' }
                                                ]
                                            }
                                        }
                                    },
                                    0
                                ]
                            }
                        },
                        in: '$$maxHour.hour'
                    }
                }
            }
        },
        { $sort: { date: -1 } }
    ]);

    return NextResponse.json({
        success: true,
        data: {
            timeline,
            summary: {
                totalDays: days,
                dateRange: {
                    from: startDate.toISOString().split('T')[0],
                    to: new Date().toISOString().split('T')[0]
                }
            }
        }
    });
}

async function getCompleteDashboard(Subject: any, Topic: any, Subtopic: any, Question: any) {
    // Get all data for complete dashboard
    const [overview, subjects, analytics, timeline] = await Promise.all([
        getOverviewData(Subject, Question).then(res => res.json()),
        getSubjectsData(Subject, Topic, Question).then(res => res.json()),
        getDetailedAnalytics(Subject, Topic, Subtopic, Question).then(res => res.json()),
        getTimelineData(Question, new URLSearchParams('days=7')).then(res => res.json())
    ]);

    return NextResponse.json({
        success: true,
        data: {
            overview: overview.data,
            subjects: subjects.data,
            analytics: analytics.data,
            timeline: timeline.data
        }
    });
}
