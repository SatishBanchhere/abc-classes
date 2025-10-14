'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, TrendingUp, BarChart3, Users, BookOpen, 
    FileText, Target, Activity, ChevronDown, ChevronRight, 
    Plus, Minus, Lock, Unlock, AlertCircle, CheckCircle,
    Filter, RefreshCw, Download, Eye, EyeOff
} from 'lucide-react';

interface DashboardState {
    examType: 'JEE' | 'NEET';
    loading: boolean;
    data: any;
    activeTab: string;
    expandedItems: Set<string>;
    selectedDateRange: number;
    filters: {
        difficulty: string;
        questionType: string;
        dateRange: string;
    };
}

const Dashboard: React.FC = () => {
    const [state, setState] = useState<DashboardState>({
        examType: 'JEE',
        loading: true,
        data: null,
        activeTab: 'overview',
        expandedItems: new Set(),
        selectedDateRange: 30,
        filters: {
            difficulty: 'all',
            questionType: 'all', 
            dateRange: '30'
        }
    });

    const fetchDashboardData = async (examType: 'JEE' | 'NEET', endpoint = 'complete') => {
        setState(prev => ({ ...prev, loading: true }));
        
        try {
            const response = await fetch(`/api/dashboard?examType=${examType}&endpoint=${endpoint}&days=${state.selectedDateRange}`);
            const result = await response.json();
            
            if (result.success) {
                setState(prev => ({ ...prev, data: result.data, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchDashboardData(state.examType);
    }, [state.examType, state.selectedDateRange]);

    const toggleExpanded = (id: string) => {
        setState(prev => {
            const newExpanded = new Set(prev.expandedItems);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return { ...prev, expandedItems: newExpanded };
        });
    };

    const MetricCard: React.FC<{
        title: string; 
        value: string | number; 
        icon: React.ReactNode; 
        trend?: string;
        color?: string;
        subtitle?: string;
    }> = ({ title, value, icon, trend, color = 'bg-blue-500', subtitle }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${color} text-white`}>
                    {icon}
                </div>
                {trend && (
                    <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
    );

    const TimelineCard: React.FC<{ item: any }> = ({ item }) => (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-l-green-400">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{item.date}</h4>
                <div className="flex gap-2">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.totalCount} questions
                    </span>
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {item.subjectCount} subjects
                    </span>
                </div>
            </div>
            
            {item.peakHour !== undefined && (
                <p className="text-sm text-gray-600 mb-3">
                    Peak activity: {item.peakHour}:00 - {item.peakHour + 1}:00
                </p>
            )}

            <div className="space-y-2">
                {item.hourlyBreakdown?.slice(0, 5).map((hour: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{hour.hour}:00 - {hour.subject}</span>
                        <span className="font-medium text-gray-900">{hour.count} Qs</span>
                    </div>
                ))}
                {item.hourlyBreakdown?.length > 5 && (
                    <button
                        onClick={() => toggleExpanded(`timeline-${item.date}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        {state.expandedItems.has(`timeline-${item.date}`) ? 'Show less' : `+${item.hourlyBreakdown.length - 5} more`}
                    </button>
                )}
            </div>
        </div>
    );

    const DifficultyChart: React.FC<{ data: any[] }> = ({ data }) => (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Difficulty Distribution</h3>
            <div className="space-y-4">
                {data?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded ${
                                item.difficulty === 'Easy' ? 'bg-green-500' :
                                item.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="font-medium">{item.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                        item.difficulty === 'Easy' ? 'bg-green-500' :
                                        item.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${item.percentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium w-12">{item.count}</span>
                            <span className="text-xs text-gray-500 w-12">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const SubjectDetailCard: React.FC<{ subject: any }> = ({ subject }) => {
        const subjectKey = `subject-${subject.subjectId}`;
        const isExpanded = state.expandedItems.has(subjectKey);

        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(subjectKey)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            <h3 className="font-semibold text-lg">{subject.name}</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {subject.totalQuestions} Qs
                            </span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                                {subject.topicCount} Topics
                            </span>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {/* Difficulty Breakdown */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Difficulty Breakdown</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600">Easy:</span>
                                        <span className="font-medium">{subject.difficultyBreakdown?.Easy || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-yellow-600">Medium:</span>
                                        <span className="font-medium">{subject.difficultyBreakdown?.Medium || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-red-600">Hard:</span>
                                        <span className="font-medium">{subject.difficultyBreakdown?.Hard || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Question Types */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Question Types</h4>
                                <div className="space-y-1">
                                    {Object.entries(subject.questionTypes || {}).map(([type, count]: [string, any]) => (
                                        <div key={type} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{type}:</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Recent Activity</h4>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {Object.entries(subject.dailyActivity || {})
                                        .sort(([a], [b]) => b.localeCompare(a))
                                        .slice(0, 7)
                                        .map(([date, count]: [string, any]) => (
                                            <div key={date} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}:</span>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {subject.lastUpdated && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                    Last updated: {new Date(subject.lastUpdated).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (state.loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading comprehensive dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {state.examType} Exam Analytics Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Comprehensive analysis and insights • Last updated: {new Date().toLocaleString('en-IN')}
                            </p>
                        </div>
                        
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <select
                                value={state.selectedDateRange}
                                onChange={(e) => setState(prev => ({ ...prev, selectedDateRange: parseInt(e.target.value) }))}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                            >
                                <option value={7}>Last 7 days</option>
                                <option value={30}>Last 30 days</option>
                                <option value={90}>Last 90 days</option>
                            </select>
                            
                            <button
                                onClick={() => setState(prev => ({ ...prev, examType: prev.examType === 'JEE' ? 'NEET' : 'JEE' }))}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                    state.examType === 'JEE' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-green-600 text-white'
                                }`}
                            >
                                Switch to {state.examType === 'JEE' ? 'NEET' : 'JEE'}
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                                { id: 'subjects', label: 'Subject Analysis', icon: <BookOpen className="w-4 h-4" /> },
                                { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
                                { id: 'analytics', label: 'Deep Analytics', icon: <TrendingUp className="w-4 h-4" /> }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setState(prev => ({ ...prev, activeTab: tab.id }))}
                                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        state.activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overview Tab */}
                {state.activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                title="Total Questions"
                                value={state.data?.overview?.totals?.questions || 0}
                                icon={<FileText className="w-6 h-6" />}
                                color="bg-blue-500"
                                subtitle="Across all subjects"
                            />
                            <MetricCard
                                title="Total Subjects" 
                                value={state.data?.overview?.totals?.subjects || 0}
                                icon={<BookOpen className="w-6 h-6" />}
                                color="bg-green-500"
                                subtitle="Active subjects"
                            />
                            <MetricCard
                                title="Total Topics"
                                value={state.data?.overview?.totals?.topics || 0}
                                icon={<Target className="w-6 h-6" />}
                                color="bg-purple-500"
                                subtitle="Covered topics"
                            />
                            <MetricCard
                                title="Total Subtopics"
                                value={state.data?.overview?.totals?.subtopics || 0}
                                icon={<Users className="w-6 h-6" />}
                                color="bg-orange-500"
                                subtitle="Detailed coverage"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DifficultyChart data={state.data?.overview?.difficultyDistribution} />
                            
                            {/* Question Types */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Question Type Distribution</h3>
                                <div className="space-y-3">
                                    {state.data?.overview?.questionTypeDistribution?.map((type: any, index: number) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="font-medium">{type._id}</span>
                                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {type.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Activity (Last {state.selectedDateRange} days)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {state.data?.overview?.recentActivity?.slice(0, 9).map((activity: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-gray-900">
                                                {new Date(activity._id).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                +{activity.count}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Subjects: {activity.subjects?.length || 0}</div>
                                            <div>Topics: {activity.topics?.length || 0}</div>
                                            <div className="flex gap-1 flex-wrap">
                                                {activity.difficulties?.slice(0, 3).map((diff: string, i: number) => (
                                                    <span key={i} className={`text-xs px-1 py-0.5 rounded ${
                                                        diff === 'Easy' ? 'bg-green-100 text-green-600' :
                                                        diff === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                        {diff}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subjects Tab */}
                {state.activeTab === 'subjects' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Subject-wise Analysis</h2>
                            <button 
                                onClick={() => fetchDashboardData(state.examType, 'subjects')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {state.data?.subjects?.map((subject: any) => (
                                <SubjectDetailCard key={subject.subjectId} subject={subject} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Timeline Tab */}
                {state.activeTab === 'timeline' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Question Creation Timeline</h2>
                            <div className="text-sm text-gray-600">
                                Showing {state.data?.timeline?.summary?.dateRange?.from} to {state.data?.timeline?.summary?.dateRange?.to}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {state.data?.timeline?.timeline?.map((item: any, index: number) => (
                                <TimelineCard key={index} item={item} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {state.activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4">Deep Analytics & Insights</h2>
                        </div>

                        {/* Daily Trends */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Daily Question Creation Trends</h3>
                            <div className="space-y-4">
                                {state.data?.analytics?.dailyTrends?.slice(0, 10).map((day: any, index: number) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-medium">{day.date}</h4>
                                                <p className="text-sm text-gray-600">{day.count} questions • {day.subjectCount} subjects</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-600">{day.count}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-green-600 font-medium">Easy: </span>
                                                {day.difficultyBreakdown?.Easy || 0}
                                            </div>
                                            <div>
                                                <span className="text-yellow-600 font-medium">Medium: </span>
                                                {day.difficultyBreakdown?.Medium || 0}
                                            </div>
                                            <div>
                                                <span className="text-red-600 font-medium">Hard: </span>
                                                {day.difficultyBreakdown?.Hard || 0}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Question Metrics */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Question Quality Metrics</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Length</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">With Options</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">With Solutions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {state.data?.analytics?.questionMetrics?.slice(0, 15).map((metric: any, index: number) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {metric.subject}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        metric.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                        metric.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {metric.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {metric.count}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {metric.avgLength} chars
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {metric.optionRate}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {metric.solutionRate}%
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
