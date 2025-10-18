import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CognitiveMetrics {
  logicalReasoning: number;
  workingMemory: number;
  processingSpeed: number;
  patternRecognition: number;
  spatialIntelligence: number;
  verbalComprehension: number;
  executiveFunction: number;
  emotionalIntelligence: number;
  adaptiveLearning: number;
  criticalThinking: number;
}

interface SessionMetrics {
  startTime: number;
  endTime: number;
  totalPauses: number;
  averageResponseTime: number;
  confidenceLevels: number[];
  difficultyProgression: number[];
  responseAccuracy: number[];
}

interface UserResponse {
  questionId: string;
  answer: any;
  confidence: number;
  timeSpent: number;
  timestamp: number;
}

interface AnalysisRequest {
  sessionMetrics: SessionMetrics;
  finalScores: CognitiveMetrics;
  totalTime: number;
  questionCount: number;
  adaptiveHistory: string[];
  userResponses: UserResponse[];
}

class CognitiveAnalysisEngine {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });
  }

  async generateExecutiveReport1(data: AnalysisRequest): Promise<string> {
    const prompt = this.buildEnterprisePrompt(data);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return await response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate cognitive analysis report');
    }
  }

  private buildEnterprisePrompt(data: AnalysisRequest): string {
    const {
      sessionMetrics,
      finalScores,
      totalTime,
      questionCount,
      adaptiveHistory,
      userResponses
    } = data;

    const avgConfidence = sessionMetrics.confidenceLevels.length > 0 
      ? sessionMetrics.confidenceLevels.reduce((a, b) => a + b, 0) / sessionMetrics.confidenceLevels.length 
      : 5;

    const avgAccuracy = sessionMetrics.responseAccuracy.length > 0
      ? sessionMetrics.responseAccuracy.reduce((a, b) => a + b, 0) / sessionMetrics.responseAccuracy.length
      : 0.5;

    return `
  # EXECUTIVE COGNITIVE ASSESSMENT ANALYSIS

  You are an enterprise-grade cognitive psychologist and AI analyst specializing in executive assessment for Fortune 500 companies. Analyze this comprehensive cognitive assessment data:

  ## Raw Performance Data:
  - **Assessment Duration**: ${Math.round(totalTime / 1000 / 60)} minutes
  - **Questions Completed**: ${questionCount}
  - **Adaptive Question Path**: ${adaptiveHistory.join(' → ')}
  - **Average Response Time**: ${Math.round(sessionMetrics.averageResponseTime)} seconds
  - **Average Confidence**: ${avgConfidence.toFixed(1)}/10
  - **Overall Accuracy**: ${(avgAccuracy * 100).toFixed(1)}%

  ## Cognitive Domain Scores (0-100):
  ${Object.entries(finalScores).map(([domain, score]) => 
    `- **${domain.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}**: ${score.toFixed(1)}`
  ).join('\n')}

  ## Detailed Performance Metrics:
  - **Response Patterns**: ${userResponses.map(r => `${r.questionId}(${r.timeSpent}s, conf:${r.confidence})`).join(', ')}
  - **Difficulty Progression**: ${sessionMetrics.difficultyProgression.join(' → ')}
  - **Confidence Levels**: ${sessionMetrics.confidenceLevels.join(', ')}

  ---

  ## Analysis Requirements:

  Generate a comprehensive executive cognitive assessment report with the following sections:

  ### 🎯 EXECUTIVE SUMMARY
  Provide a 2-3 sentence executive summary suitable for C-suite consumption, highlighting:
  - Overall cognitive capability percentile (compare to executive population)
  - Top 2 cognitive strengths for leadership roles
  - Primary development opportunity

  ### 🧠 DETAILED COGNITIVE PROFILE ANALYSIS

  Analyze each cognitive domain with specific scores and percentile rankings based on executive population norms.

  ### 📊 LEADERSHIP EFFECTIVENESS PREDICTION
  Rate effectiveness in 5 key areas on a 1-5 scale:
  - Strategic Decision Making
  - Team Leadership & Management
  - Innovation & Change Management
  - Crisis Management & Resilience
  - Stakeholder Communication

  ### 🚀 DEVELOPMENT RECOMMENDATIONS
  Provide specific recommendations for:
  - Immediate Actions (0-3 months)
  - Medium-term Development (3-12 months)
  - Long-term Strategic Growth (1-3 years)

  ### 🎯 ROLE OPTIMIZATION MATRIX
  Recommend optimal leadership positions and organizational culture matches.

  ### ⚠️ RISK ASSESSMENT & MITIGATION
  Identify potential cognitive blind spots and stress response patterns.

  ---

  **CRITICAL REQUIREMENT**: At the end of your narrative report, you MUST include a JSON data block for chart generation. Output EXACTLY this structure in a fenced code block marked \`\`\`json:

  \`\`\`json
  {
    "summary": {
      "overallPercentile": [number 1-100],
      "topStrengths": ["strength1", "strength2"],
      "primaryDevelopment": "development area",
      "executiveRating": "A+/A/B+/B/C+"
    },
    "domains": [
      { "name": "Logical Reasoning", "score": ${finalScores.logicalReasoning.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Working Memory", "score": ${finalScores.workingMemory.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Processing Speed", "score": ${finalScores.processingSpeed.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Spatial Intelligence", "score": ${finalScores.spatialIntelligence.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Emotional Intelligence", "score": ${finalScores.emotionalIntelligence.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Adaptive Learning", "score": ${finalScores.adaptiveLearning.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Verbal Comprehension", "score": ${finalScores.verbalComprehension.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Executive Function", "score": ${finalScores.executiveFunction.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Pattern Recognition", "score": ${finalScores.patternRecognition.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" },
      { "name": "Critical Thinking", "score": ${finalScores.criticalThinking.toFixed(1)}, "percentile": [calculate percentile], "trend": "stable/improving/declining" }
    ],
    "leadership": [
      { "area": "Strategic Decision Making", "rating": [1-5], "confidence": "high/medium/low" },
      { "area": "Team Leadership & Management", "rating": [1-5], "confidence": "high/medium/low" },
      { "area": "Innovation & Change Management", "rating": [1-5], "confidence": "high/medium/low" },
      { "area": "Crisis Management & Resilience", "rating": [1-5], "confidence": "high/medium/low" },
      { "area": "Stakeholder Communication", "rating": [1-5], "confidence": "high/medium/low" }
    ],
    "dataQuality": {
      "flags": [${totalTime < 60000 ? '"Very short duration"' : ''}, ${sessionMetrics.averageResponseTime < 5 ? '"Unusually fast responses"' : ''}, ${avgConfidence === sessionMetrics.confidenceLevels[0] ? '"Flat confidence levels"' : ''}].filter(Boolean),
      "severity": "${totalTime < 60000 || sessionMetrics.averageResponseTime < 5 ? 'high' : 'low'}",
      "validityScore": [0-100],
      "recommendations": ["recommendation1", "recommendation2"]
    },
    "timeseries": {
      "questions": [
        ${userResponses.map((r, i) => `{ "id": "${r.questionId}", "time": ${r.timeSpent}, "confidence": ${r.confidence}, "difficulty": ${sessionMetrics.difficultyProgression[i] || 3}, "accuracy": ${sessionMetrics.responseAccuracy[i] || 0.5} }`).join(', ')}
      ]
    },
    "recommendations": {
      "immediate": ["action1", "action2", "action3"],
      "mediumTerm": ["development1", "development2"],
      "longTerm": ["growth1", "growth2"]
    },
    "roleMatches": [
      { "role": "Chief Strategy Officer", "match": [percentage], "reasoning": "brief explanation" },
      { "role": "Head of Innovation", "match": [percentage], "reasoning": "brief explanation" },
      { "role": "Chief Operating Officer", "match": [percentage], "reasoning": "brief explanation" }
    ]
  }
  \`\`\`

  Do not include any text after the JSON code block. Ensure all numbers are valid and all arrays contain the exact number of items specified.
  `;
  }

  private extractChartData(reportText: string): any | null {
    try {
      // Extract JSON block from markdown fenced code
      const jsonMatch = reportText.match(/``````/);
      if (!jsonMatch) return null;
      
      const jsonString = jsonMatch[1].trim();
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse chart data from report:', error);
      return null;
    }
  }

  async generateExecutiveReport(data: AnalysisRequest): Promise<{ report: string; chartData: any | null }> {
  const prompt = this.buildEnterprisePrompt(data);
  
  try {
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const reportText = await response.text();
    
    // Extract chart data
    const chartData = this.extractChartData(reportText);
    
    // Clean report text (remove JSON block)
    const cleanReport = reportText.replace(/``````/g, '').trim();
    
    return {
      report: cleanReport,
      chartData
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate cognitive analysis report');
  }
}


}

export async function POST(request: NextRequest) {
  try {
    const data: AnalysisRequest = await request.json();
    
    if (!data.sessionMetrics || !data.finalScores || !data.userResponses) {
      return NextResponse.json(
        { 
          error: 'Invalid request data: missing required fields',
          required: ['sessionMetrics', 'finalScores', 'userResponses']
        },
        { status: 400 }
      );
    }

    if (data.questionCount <= 0 || data.totalTime <= 0) {
      return NextResponse.json(
        { error: 'Invalid assessment data: questionCount and totalTime must be positive' },
        { status: 400 }
      );
    }

    const analysisEngine = new CognitiveAnalysisEngine();
    const { report, chartData } = await analysisEngine.generateExecutiveReport(data);

    console.log(`Assessment completed: ${data.questionCount} questions in ${Math.round(data.totalTime / 1000)}s`);

    return NextResponse.json({
      success: true,
      report,
      chartData, // NEW: Include chart data
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        questionCount: data.questionCount,
        totalDuration: data.totalTime,
        cognitiveScores: data.finalScores,
        sessionId: `session_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Cognitive analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = process.env.NODE_ENV === 'development' ? {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    } : { error: 'Internal server error during cognitive analysis' };
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}


// Health check endpoint
export async function GET() {
  try {
    // Test Gemini API connection
    const testConnection = process.env.GEMINI_API_KEY ? true : false;
    
    return NextResponse.json({
      status: 'healthy',
      service: 'cognitive-analysis-api',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      geminiApiConnected: testConnection
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Service check failed'
    }, { status: 503 });
  }
}

// Configure runtime and caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for AI processing
