"use client";

import { useEffect, useState, useMemo } from "react";

type TopicCount = {
    topicName: string;
    totalQuestions: number;
    _id?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    category?: string;
    lastUpdated?: string;
    averageScore?: number;
    completionRate?: number;
    rank?: number;
    questionTypes?: string[];
    difficulties?: string[];
};

type SubjectStats = {
    subjectName: string;
    totalQuestions: number;
    topicCount: number;
    avgDifficulty: string;
};

type DashboardData = {
    topics: TopicCount[];
    subjects: SubjectStats[];
    difficultyDistribution: { _id: string; count: number }[];
    questionTypeDistribution: { _id: string; count: number }[];
    recentActivity: { _id: { date: string }; count: number }[];
    summary: {
        totalQuestions: number;
        totalTopics: number;
        totalSubjects: number;
        averageQuestionsPerTopic: number;
        examType: string;
    };
};

type StatsData = {
    topics: TopicCount[];
    totalQuestions: number;
    totalTopics: number;
    averageQuestionsPerTopic: number;
    mostPopularTopic: string;
    leastPopularTopic: string;
    lastUpdated: string;
};

export default function EnhancedDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof TopicCount>('totalQuestions');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [view, setView] = useState<'overview' | 'topics' | 'subjects' | 'analytics'>('topics');
    const [selectedExam, setSelectedExam] = useState<"JEE MAINS" | "NEET">("JEE MAINS");

    useEffect(() => {
        let intervalId;

        async function fetchData() {
            try {
                const res = await fetch(`/api/get-stats?examType=${selectedExam}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const json = await res.json();
                setData(json);
                setError(null);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        intervalId = setInterval(fetchData, 60 * 1000);
        return () => clearInterval(intervalId);
    }, [selectedExam]);

    useEffect(()=>{
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedDifficulty('all');
    }, [selectedExam])

    // Computed statistics
    const stats = useMemo((): StatsData | null => {
        if (!data) return null;

        const totalQuestions = data.summary.totalQuestions;
        const totalTopics = data.summary.totalTopics;
        const averageQuestionsPerTopic = data.summary.averageQuestionsPerTopic;

        const sortedByQuestions = [...data.topics].sort((a, b) => b.totalQuestions - a.totalQuestions);
        const mostPopularTopic = sortedByQuestions[0]?.topicName || 'N/A';
        const leastPopularTopic = sortedByQuestions[sortedByQuestions.length - 1]?.topicName || 'N/A';

        return {
            topics: data.topics,
            totalQuestions,
            totalTopics,
            averageQuestionsPerTopic,
            mostPopularTopic,
            leastPopularTopic,
            lastUpdated: new Date().toLocaleString()
        };
    }, [data]);

    // Filtered and sorted data
    const filteredAndSortedData = useMemo(() => {
        if (!data) return [];

        let filtered = data.topics.filter(topic => {
            const matchesSearch = topic.topicName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
            const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        return filtered.sort((a, b) => {
            const aValue = a[sortField] || 0;
            const bValue = b[sortField] || 0;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return sortOrder === 'asc' ?
                (aValue as number) - (bValue as number) :
                (bValue as number) - (aValue as number);
        });
    }, [data, searchTerm, selectedCategory, selectedDifficulty, sortField, sortOrder]);

    const categories = useMemo(() => {
        if (!data) return [];
        //@ts-ignore
        return [...new Set(data.topics.map(topic => topic.category))].filter(Boolean);
    }, [data]);

    const difficulties = ['Easy', 'Medium', 'Hard'];

    const handleSort = (field: keyof TopicCount) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const getSortIcon = (field: keyof TopicCount) => {
        if (sortField !== field) return '↕️';
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'text-green-600 bg-green-100 border-green-200';
            case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            case 'Hard': return 'text-red-600 bg-red-100 border-red-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getCompletionColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-8">
                        {/* Header Skeleton */}
                        <div className="text-center space-y-4">
                            <div className="h-12 bg-gray-200 rounded-lg mx-auto w-96"></div>
                            <div className="h-6 bg-gray-200 rounded-lg mx-auto w-64"></div>
                        </div>

                        {/* Stats Cards Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-white rounded-xl shadow-lg"></div>
                            ))}
                        </div>

                        {/* Content Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 h-96 bg-white rounded-xl shadow-lg"></div>
                            <div className="h-96 bg-white rounded-xl shadow-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data || !stats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="bg-white rounded-2xl border border-red-200 shadow-xl p-12 text-center max-w-md">
                    <div className="text-red-500 text-8xl mb-6">⚠️</div>
                    <h2 className="text-3xl font-bold text-red-800 mb-4">Oops! Something went wrong</h2>
                    <p className="text-red-700 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Enhanced Header */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg border border-blue-100">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-4">
                            📊 Advanced Learning Analytics
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Comprehensive insights into your <span className="font-semibold text-blue-600">{selectedExam}</span> question database with real-time statistics, advanced filtering, and interactive visualizations
                    </p>
                    <div className="flex justify-center">
                        <select
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value as 'JEE MAINS' | 'NEET')}
                            className="px-6 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg font-semibold text-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <option value="JEE MAINS">JEE MAINS</option>
                            <option value="NEET">NEET</option>
                        </select>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                        <div className="flex space-x-2">
                            {(['overview', 'topics', 'subjects', 'analytics'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setView(tab)}
                                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        view === tab
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Questions</p>
                                <p className="text-4xl font-bold mb-2">{stats.totalQuestions.toLocaleString()}</p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-blue-100">Live Data - {selectedExam}</span>
                                </div>
                            </div>
                            <div className="text-5xl opacity-80">❓</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium mb-1">Total Topics</p>
                                <p className="text-4xl font-bold mb-2">{stats.totalTopics}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-green-100">Across {data.summary.totalSubjects} subjects</span>
                                </div>
                            </div>
                            <div className="text-5xl opacity-80">📚</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium mb-1">Avg Questions/Topic</p>
                                <p className="text-4xl font-bold mb-2">{stats.averageQuestionsPerTopic}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-purple-100">Well distributed</span>
                                </div>
                            </div>
                            <div className="text-5xl opacity-80">📈</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-medium mb-1">Categories</p>
                                <p className="text-4xl font-bold mb-2">{categories.length}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-orange-100">Subject areas</span>
                                </div>
                            </div>
                            <div className="text-5xl opacity-80">🏷️</div>
                        </div>
                    </div>
                </div>

                {/* View-specific Content */}
                {view === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Insights */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                🎯 Quick Insights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                                    <div className="text-3xl mb-2">🏆</div>
                                    <p className="text-sm text-gray-600 mb-2">Most Popular Topic</p>
                                    <p className="font-bold text-lg text-blue-600">{stats.mostPopularTopic}</p>
                                </div>
                                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                                    <div className="text-3xl mb-2">📉</div>
                                    <p className="text-sm text-gray-600 mb-2">Needs Attention</p>
                                    <p className="font-bold text-lg text-orange-600">{stats.leastPopularTopic}</p>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty Distribution */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                ⚡ Difficulty Breakdown
                            </h3>
                            <div className="space-y-4">
                                {data.difficultyDistribution.map((item) => {
                                    const percentage = (item.count / stats.totalQuestions) * 100;
                                    return (
                                        <div key={item._id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getDifficultyColor(item._id)}`}>
                                                    {item._id}
                                                </span>
                                                <span className="text-sm font-bold text-gray-700">
                                                    {item.count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${
                                                        item._id === 'Easy' ? 'bg-green-500' :
                                                            item._id === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'topics' && (
                    <>
                        {/* Enhanced Controls */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                {/* Search */}
                                <div className="flex-1 min-w-80">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search topics..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                                        />
                                        <div className="absolute left-4 top-4 text-gray-400 text-xl">🔍</div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex gap-4">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-40"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-32"
                                    >
                                        <option value="all">All Difficulties</option>
                                        {difficulties.map(diff => (
                                            <option key={diff} value={diff}>{diff}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-semibold text-blue-600">{filteredAndSortedData.length}</span> of <span className="font-semibold">{data.topics.length}</span> topics
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Table */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-8 py-6 text-left">
                                            <button
                                                onClick={() => handleSort('topicName')}
                                                className="flex items-center gap-3 font-bold text-gray-800 hover:text-blue-600 transition-colors group"
                                            >
                                                📘 Topic Name
                                                <span className="text-sm opacity-50 group-hover:opacity-100">{getSortIcon('topicName')}</span>
                                            </button>
                                        </th>
                                        <th className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => handleSort('category')}
                                                className="flex items-center gap-3 font-bold text-gray-800 hover:text-blue-600 transition-colors mx-auto group"
                                            >
                                                🏷️ Category
                                                <span className="text-sm opacity-50 group-hover:opacity-100">{getSortIcon('category')}</span>
                                            </button>
                                        </th>
                                        <th className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => handleSort('difficulty')}
                                                className="flex items-center gap-3 font-bold text-gray-800 hover:text-blue-600 transition-colors mx-auto group"
                                            >
                                                ⚡ Difficulty
                                                <span className="text-sm opacity-50 group-hover:opacity-100">{getSortIcon('difficulty')}</span>
                                            </button>
                                        </th>
                                        <th className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleSort('totalQuestions')}
                                                className="flex items-center gap-3 font-bold text-gray-800 hover:text-blue-600 transition-colors ml-auto group"
                                            >
                                                ❓ Questions
                                                <span className="text-sm opacity-50 group-hover:opacity-100">{getSortIcon('totalQuestions')}</span>
                                            </button>
                                        </th>
                                        <th className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleSort('averageScore')}
                                                className="flex items-center gap-3 font-bold text-gray-800 hover:text-blue-600 transition-colors ml-auto group"
                                            >
                                                📊 Performance
                                                <span className="text-sm opacity-50 group-hover:opacity-100">{getSortIcon('averageScore')}</span>
                                            </button>
                                        </th>
                                        <th className="px-8 py-6 text-center">
                                            <span className="font-bold text-gray-800">📈 Progress</span>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                    {filteredAndSortedData.map((topic, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">
                                                        {topic.topicName}
                                                    </div>
                                                    {topic.rank && (
                                                        <div className="flex items-center gap-2">
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                                                    Rank #{topic.rank}
                                                                </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                                        {topic.category}
                                                    </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getDifficultyColor(topic.difficulty || 'Medium')}`}>
                                                        {topic.difficulty}
                                                    </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-4">
                                                        <span className="font-bold text-2xl text-gray-900 group-hover:text-blue-700 transition-colors">
                                                            {topic.totalQuestions.toLocaleString()}
                                                        </span>
                                                    <div
                                                        className="h-3 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full shadow-sm"
                                                        style={{
                                                            width: `${Math.max(12, (topic.totalQuestions / Math.max(...data.topics.map(t => t.totalQuestions))) * 80)}px`
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="space-y-1">
                                                        <span className="font-bold text-lg text-gray-700">
                                                            {topic.averageScore}%
                                                        </span>
                                                    <div className="text-xs text-gray-500">
                                                        Avg Score
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-3 max-w-20">
                                                        <div
                                                            className={`h-3 rounded-full shadow-sm ${getCompletionColor(topic.completionRate || 0)}`}
                                                            style={{ width: `${topic.completionRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-600 min-w-12">
                                                            {topic.completionRate}%
                                                        </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {view === 'subjects' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.subjects.map((subject, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 p-8"
                            >
                                <div className="text-center space-y-4">
                                    <div className="text-4xl mb-4">📖</div>
                                    <h3 className="font-bold text-2xl text-gray-900">
                                        {subject.subjectName}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {subject.totalQuestions.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-blue-700 font-medium">Questions</div>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                            <div className="text-2xl font-bold text-green-600">
                                                {subject.topicCount}
                                            </div>
                                            <div className="text-sm text-green-700 font-medium">Topics</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getDifficultyColor(subject.avgDifficulty)}`}>
                                            Avg: {subject.avgDifficulty}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Question Type Distribution */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                📊 Question Types
                            </h3>
                            <div className="space-y-4">
                                {data.questionTypeDistribution.map((item, idx) => {
                                    const percentage = (item.count / stats.totalQuestions) * 100;
                                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
                                    return (
                                        <div key={item._id} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item._id}
                                                </span>
                                                <span className="text-sm font-bold text-gray-700">
                                                    {item.count} ({percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${colors[idx % colors.length]}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                📈 Overall Activity
                            </h3>
                            {data.recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {data.recentActivity.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                            <span className="text-sm font-medium text-gray-700">
                                                {new Date(item._id.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">
                                                +{item.count} questions
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-4">📝</div>
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Enhanced Footer */}
                <div className="text-center text-sm text-gray-500 bg-gradient-to-r from-white to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        <span className="flex items-center gap-2">
                            📅 Last updated: {stats.lastUpdated}
                        </span>
                        <span className="flex items-center gap-2">
                            🔄 Data refreshes automatically
                        </span>
                        <span className="flex items-center gap-2">
                            💡 Click column headers to sort
                        </span>
                        <span className="flex items-center gap-2">
                            🎯 Exam: {selectedExam}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}