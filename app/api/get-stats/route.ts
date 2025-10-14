// app/api/get-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { getModels } from "@/lib/models";

export async function GET(req: NextRequest) {
     try {
          const {searchParams} = new URL(req.url);
          const examType = searchParams.get('examType') || "JEE MAINS";
          const connection = await connectDB(examType);
          const { Question } = getModels(connection);

          // Parallel aggregation queries for better performance
          const [
               topicStats,
               subjectStats,
               difficultyStats,
               questionTypeStats,
               recentQuestions,
               topicDifficultyBreakdown
          ] = await Promise.all([
               // Topic-wise statistics
               Question.aggregate([
                    {
                         $group: {
                              _id: "$topicName",
                              totalQuestions: { $sum: 1 },
                              subjectName: { $first: "$subjectName" },
                              topicId: { $first: "$topicId" },
                              subjectId: { $first: "$subjectId" },
                              avgDifficulty: {
                                   $avg: {
                                        $switch: {
                                             branches: [
                                                  { case: { $eq: ["$difficulty", "Easy"] }, then: 1 },
                                                  { case: { $eq: ["$difficulty", "Medium"] }, then: 2 },
                                                  { case: { $eq: ["$difficulty", "Hard"] }, then: 3 }
                                             ],
                                             default: 2
                                        }
                                   }
                              },
                              lastUpdated: { $max: "$updatedAt" },
                              questionTypes: { $addToSet: "$questionType" },
                              difficulties: { $addToSet: "$difficulty" }
                         }
                    },
                    { $sort: { totalQuestions: -1 } }
               ]),

               // Subject-wise statistics
               Question.aggregate([
                    {
                         $group: {
                              _id: "$subjectName",
                              totalQuestions: { $sum: 1 },
                              topics: { $addToSet: "$topicName" },
                              topicCount: { $addToSet: "$topicName" },
                              avgDifficulty: {
                                   $avg: {
                                        $switch: {
                                             branches: [
                                                  { case: { $eq: ["$difficulty", "Easy"] }, then: 1 },
                                                  { case: { $eq: ["$difficulty", "Medium"] }, then: 2 },
                                                  { case: { $eq: ["$difficulty", "Hard"] }, then: 3 }
                                             ],
                                             default: 2
                                        }
                                   }
                              }
                         }
                    },
                    {
                         $project: {
                              _id: 1,
                              totalQuestions: 1,
                              topics: 1,
                              topicCount: { $size: "$topicCount" },
                              avgDifficulty: 1
                         }
                    },
                    { $sort: { totalQuestions: -1 } }
               ]),

               // Difficulty distribution
               Question.aggregate([
                    {
                         $group: {
                              _id: "$difficulty",
                              count: { $sum: 1 }
                         }
                    },
                    { $sort: { _id: 1 } }
               ]),

               // Question type distribution
               Question.aggregate([
                    {
                         $group: {
                              _id: "$questionType",
                              count: { $sum: 1 }
                         }
                    },
                    { $sort: { count: -1 } }
               ]),

               // Recent questions (last 7 days)
               Question.aggregate([
                    {
                         $match: {
                              createdAt: {
                                   $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                              }
                         }
                    },
                    {
                         $group: {
                              _id: {
                                   date: {
                                        $dateToString: {
                                             format: "%Y-%m-%d",
                                             date: "$createdAt"
                                        }
                                   }
                              },
                              count: { $sum: 1 }
                         }
                    },
                    { $sort: { "_id.date": 1 } }
               ]),

               // Topic-wise difficulty breakdown
               Question.aggregate([
                    {
                         $group: {
                              _id: {
                                   topicName: "$topicName",
                                   difficulty: "$difficulty"
                              },
                              count: { $sum: 1 }
                         }
                    },
                    {
                         $group: {
                              _id: "$_id.topicName",
                              difficulties: {
                                   $push: {
                                        difficulty: "$_id.difficulty",
                                        count: "$count"
                                   }
                              },
                              totalQuestions: { $sum: "$count" }
                         }
                    },
                    { $sort: { totalQuestions: -1 } }
               ])
          ]);

          // Calculate enhanced metrics
          const totalQuestions = await Question.countDocuments();
          const totalTopics = topicStats.length;
          const totalSubjects = subjectStats.length;

          // Process topic stats with enhanced data
          const enhancedTopicStats = topicStats.map((topic: { avgDifficulty: number; _id: any; subjectName: any; lastUpdated: { toISOString: () => any; }; questionTypes: any; difficulties: any; }, index: number) => {
               const difficultyMap = ["Easy", "Medium", "Hard"];
               const avgDifficultyText = difficultyMap[Math.round(topic.avgDifficulty) - 1] || "Medium";

               return {
                    ...topic,
                    topicName: topic._id,
                    category: topic.subjectName,
                    difficulty: avgDifficultyText,
                    lastUpdated: topic.lastUpdated?.toISOString() || new Date().toISOString(),
                    averageScore: Math.floor(Math.random() * 40 + 60), // Simulated - replace with actual data
                    completionRate: Math.floor(Math.random() * 50 + 50), // Simulated - replace with actual data
                    rank: index + 1,
                    questionTypes: topic.questionTypes,
                    difficulties: topic.difficulties
               };
          });

          return NextResponse.json({
               topics: enhancedTopicStats,
               subjects: subjectStats.map((subject: { _id: any; avgDifficulty: number; }) => ({
                    ...subject,
                    subjectName: subject._id,
                    avgDifficulty: ["Easy", "Medium", "Hard"][Math.round(subject.avgDifficulty) - 1] || "Medium"
               })),
               difficultyDistribution: difficultyStats,
               questionTypeDistribution: questionTypeStats,
               recentActivity: recentQuestions,
               topicDifficultyBreakdown,
               summary: {
                    totalQuestions,
                    totalTopics,
                    totalSubjects,
                    averageQuestionsPerTopic: Math.round(totalQuestions / totalTopics),
                    examType
               }
          });

     } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          return NextResponse.json(
              { error: "Failed to fetch dashboard statistics" },
              { status: 500 }
          );
     }
}