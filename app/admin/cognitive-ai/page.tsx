'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Clock, 
  Timer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  Shield,
  Zap,
  Sparkles,
  Eye,
  Target,
  BookOpen,
  Users,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Settings,
  FileText,
  Calendar,
  Star,
  Trophy,
  Briefcase,
  PieChart,
  Activity,
  Cpu,
  Database,
  Globe,
  Heart,
  Puzzle,
  Compass,
  Layers,
  Map,
  Network,
  Zap as Lightning,
  Microscope,
  Rocket,
  Smartphone,
  Tablet,
  Monitor,
  Headphones,
  Camera,
  Mic
} from 'lucide-react';

// All interfaces remain the same as previous version
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

interface QuestionMetadata {
  id: string;
  type: 'logical' | 'memory' | 'spatial' | 'verbal' | 'emotional' | 'adaptive' | 'critical' | 'creative' | 'mathematical' | 'visual';
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeLimit: number;
  cognitiveLoad: number;
  validationRules: string[];
  scoringWeights: Partial<CognitiveMetrics>;
  adaptiveBranching: Record<string, string>;
}

interface AssessmentQuestion extends QuestionMetadata {
  prompt: string;
  stimulus?: {
    type: 'image' | 'video' | 'audio' | 'interactive';
    content: string;
    duration?: number;
  };
  responseType: 'multiple-choice' | 'text' | 'drawing' | 'sequence' | 'ranking' | 'slider' | 'matrix' | 'essay';
  options?: Array<{
    id: string;
    content: string;
    isCorrect?: boolean;
    cognitiveProfile: Partial<CognitiveMetrics>;
  }>;
  correctAnswer?: any;
  hints?: string[];
  sequenceData?: {
    originalSequence: string[];
    studyTime: number;
    inputType: 'text' | 'selection' | 'drag-drop';
  };
}

interface UserResponse {
  questionId: string;
  answer: any;
  confidence: number;
  timeSpent: number;
  timestamp: number;
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

interface ChartData {
  summary: {
    overallPercentile: number;
    topStrengths: string[];
    primaryDevelopment: string;
    executiveRating: string;
  };
  domains: Array<{
    name: string;
    score: number;
    percentile: number;
    trend: 'stable' | 'improving' | 'declining';
  }>;
  leadership: Array<{
    area: string;
    rating: number;
    confidence: string;
  }>;
  dataQuality: {
    flags: string[];
    severity: 'high' | 'medium' | 'low';
    validityScore: number;
    recommendations: string[];
  };
  timeseries: {
    questions: Array<{
      id: string;
      time: number;
      confidence: number;
      difficulty: number;
      accuracy: number;
    }>;
  };
  recommendations: {
    immediate: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  roleMatches: Array<{
    role: string;
    match: number;
    reasoning: string;
  }>;
}

// MASSIVE EXPANDED QUESTION BANK - 25+ Questions
const ENTERPRISE_QUESTIONS: AssessmentQuestion[] = [
  // Logical Reasoning Questions (1-5)
  {
    id: 'LOG_001',
    type: 'logical',
    difficulty: 3,
    timeLimit: 120,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 0.9, criticalThinking: 0.7 },
    adaptiveBranching: { 'A': 'LOG_002A', 'B': 'LOG_002B', 'C': 'LOG_002C' },
    prompt: 'In a corporate restructuring, Department A has 40% more employees than Department B. If Department C has 25% fewer employees than Department A, and the total across all three departments is 385 employees, how many employees does Department B have?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '120 employees', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, criticalThinking: 0.9 } },
      { id: 'B', content: '140 employees', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.6, criticalThinking: 0.5 } },
      { id: 'C', content: '100 employees', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.4, criticalThinking: 0.3 } },
      { id: 'D', content: '160 employees', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.3, criticalThinking: 0.2 } },
    ]
  },
  {
    id: 'LOG_002',
    type: 'logical',
    difficulty: 4,
    timeLimit: 150,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 1.0, criticalThinking: 0.8 },
    adaptiveBranching: { 'A': 'LOG_003H', 'B': 'LOG_003M', 'C': 'LOG_003L' },
    prompt: 'If all managers are leaders, and some leaders are innovators, and no innovators are micromanagers, which conclusion is definitely true?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Some managers are not micromanagers', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, criticalThinking: 0.95 } },
      { id: 'B', content: 'All leaders are managers', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.5, criticalThinking: 0.4 } },
      { id: 'C', content: 'No managers are innovators', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.3, criticalThinking: 0.2 } },
      { id: 'D', content: 'All innovators are leaders', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.4, criticalThinking: 0.3 } },
    ]
  },
  {
    id: 'LOG_003',
    type: 'logical',
    difficulty: 5,
    timeLimit: 180,
    cognitiveLoad: 1.0,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 1.0, criticalThinking: 0.9, executiveFunction: 0.6 },
    adaptiveBranching: { 'A': 'MEM_001', 'B': 'MEM_001', 'C': 'MEM_001' },
    prompt: 'A company has 5 projects (A, B, C, D, E). Project dependencies: A must finish before B and C. B must finish before D. C must finish before E. D and E must both finish before F. What is the minimum number of time periods needed if each project takes 1 period?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '4 periods', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, criticalThinking: 1.0, executiveFunction: 0.8 } },
      { id: 'B', content: '3 periods', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.6, criticalThinking: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: '5 periods', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.4, criticalThinking: 0.3, executiveFunction: 0.3 } },
      { id: 'D', content: '6 periods', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.3, criticalThinking: 0.2, executiveFunction: 0.2 } },
    ]
  },
  {
    id: 'LOG_004',
    type: 'logical',
    difficulty: 3,
    timeLimit: 120,
    cognitiveLoad: 0.7,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 0.8, patternRecognition: 0.7 },
    adaptiveBranching: { 'A': 'PAT_001', 'B': 'PAT_001', 'C': 'PAT_001' },
    prompt: 'In a sequence: 2, 6, 18, 54, ?, what is the next number?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '162', isCorrect: true, cognitiveProfile: { logicalReasoning: 0.9, patternRecognition: 1.0 } },
      { id: 'B', content: '108', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.5, patternRecognition: 0.4 } },
      { id: 'C', content: '216', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.4, patternRecognition: 0.3 } },
      { id: 'D', content: '144', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.3, patternRecognition: 0.2 } },
    ]
  },
  {
    id: 'LOG_005',
    type: 'logical',
    difficulty: 4,
    timeLimit: 140,
    cognitiveLoad: 0.85,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 0.9, criticalThinking: 0.8, executiveFunction: 0.5 },
    adaptiveBranching: { 'A': 'MEM_001', 'B': 'MEM_001', 'C': 'MEM_001' },
    prompt: 'A consulting firm charges $200/hour for senior consultants and $120/hour for junior consultants. If a project used 40 total hours and cost $6,800, how many hours were senior consultant hours?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '25 hours', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, criticalThinking: 0.9, executiveFunction: 0.7 } },
      { id: 'B', content: '20 hours', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.6, criticalThinking: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: '30 hours', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.5, criticalThinking: 0.4, executiveFunction: 0.3 } },
      { id: 'D', content: '35 hours', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.3, criticalThinking: 0.2, executiveFunction: 0.2 } },
    ]
  },

  // Memory Questions (6-10)
  {
    id: 'MEM_001',
    type: 'memory',
    difficulty: 4,
    timeLimit: 90,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'sequence-order'],
    scoringWeights: { workingMemory: 1.0, processingSpeed: 0.6 },
    adaptiveBranching: { 'correct': 'MEM_002H', 'incorrect': 'MEM_002L' },
    prompt: 'Study this sequence for 15 seconds, then reproduce it:',
    responseType: 'sequence',
    correctAnswer: ['Q7', 'R3', 'M9', 'K2', 'P8', 'L5', 'N4', 'J6', 'H1'],
    sequenceData: {
      originalSequence: ['Q7', 'R3', 'M9', 'K2', 'P8', 'L5', 'N4', 'J6', 'H1'],
      studyTime: 15000,
      inputType: 'text'
    }
  },
  {
    id: 'MEM_002',
    type: 'memory',
    difficulty: 3,
    timeLimit: 80,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'sequence-order'],
    scoringWeights: { workingMemory: 0.9, processingSpeed: 0.7 },
    adaptiveBranching: { 'correct': 'MEM_003H', 'incorrect': 'MEM_003L' },
    prompt: 'Study these numbers for 12 seconds, then reproduce them:',
    responseType: 'sequence',
    correctAnswer: ['42', '17', '89', '35', '63', '28'],
    sequenceData: {
      originalSequence: ['42', '17', '89', '35', '63', '28'],
      studyTime: 12000,
      inputType: 'text'
    }
  },
  {
    id: 'MEM_003',
    type: 'memory',
    difficulty: 5,
    timeLimit: 120,
    cognitiveLoad: 1.0,
    validationRules: ['required', 'sequence-order'],
    scoringWeights: { workingMemory: 1.0, processingSpeed: 0.8, patternRecognition: 0.5 },
    adaptiveBranching: { 'correct': 'SPATIAL_001', 'incorrect': 'SPATIAL_001' },
    prompt: 'Study this complex sequence for 20 seconds:',
    responseType: 'sequence',
    correctAnswer: ['Alpha-7', 'Beta-3', 'Gamma-9', 'Delta-2', 'Epsilon-8', 'Zeta-5', 'Eta-4', 'Theta-6', 'Iota-1', 'Kappa-0'],
    sequenceData: {
      originalSequence: ['Alpha-7', 'Beta-3', 'Gamma-9', 'Delta-2', 'Epsilon-8', 'Zeta-5', 'Eta-4', 'Theta-6', 'Iota-1', 'Kappa-0'],
      studyTime: 20000,
      inputType: 'text'
    }
  },
  {
    id: 'MEM_004',
    type: 'memory',
    difficulty: 3,
    timeLimit: 100,
    cognitiveLoad: 0.75,
    validationRules: ['required', 'multiple-choice'],
    scoringWeights: { workingMemory: 0.8, verbalComprehension: 0.6 },
    adaptiveBranching: { 'A': 'VERBAL_001', 'B': 'VERBAL_001', 'C': 'VERBAL_001' },
    prompt: 'You have 10 seconds to memorize this list: Apple, Database, Mountain, Strategy, Innovation, Partnership, Excellence, Growth. Which item was 4th in the list?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Strategy', isCorrect: true, cognitiveProfile: { workingMemory: 1.0, verbalComprehension: 0.8 } },
      { id: 'B', content: 'Innovation', isCorrect: false, cognitiveProfile: { workingMemory: 0.6, verbalComprehension: 0.5 } },
      { id: 'C', content: 'Mountain', isCorrect: false, cognitiveProfile: { workingMemory: 0.4, verbalComprehension: 0.4 } },
      { id: 'D', content: 'Database', isCorrect: false, cognitiveProfile: { workingMemory: 0.3, verbalComprehension: 0.3 } },
    ]
  },
  {
    id: 'MEM_005',
    type: 'memory',
    difficulty: 4,
    timeLimit: 110,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'multiple-choice'],
    scoringWeights: { workingMemory: 0.9, processingSpeed: 0.7, executiveFunction: 0.5 },
    adaptiveBranching: { 'A': 'SPATIAL_002', 'B': 'SPATIAL_002', 'C': 'SPATIAL_002' },
    prompt: 'Study this executive meeting agenda: 1) Budget Review (9:00-9:30), 2) Strategic Planning (9:30-10:15), 3) HR Updates (10:15-10:45), 4) Technology Roadmap (10:45-11:30), 5) Q&A Session (11:30-12:00). What time does the Technology Roadmap discussion end?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '11:30 AM', isCorrect: true, cognitiveProfile: { workingMemory: 1.0, processingSpeed: 0.9, executiveFunction: 0.8 } },
      { id: 'B', content: '11:15 AM', isCorrect: false, cognitiveProfile: { workingMemory: 0.6, processingSpeed: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: '12:00 PM', isCorrect: false, cognitiveProfile: { workingMemory: 0.4, processingSpeed: 0.4, executiveFunction: 0.3 } },
      { id: 'D', content: '10:45 AM', isCorrect: false, cognitiveProfile: { workingMemory: 0.3, processingSpeed: 0.3, executiveFunction: 0.2 } },
    ]
  },

  // Spatial Intelligence Questions (11-15)
  {
    id: 'SPATIAL_001',
    type: 'spatial',
    difficulty: 4,
    timeLimit: 180,
    cognitiveLoad: 0.85,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { spatialIntelligence: 1.0, patternRecognition: 0.8 },
    adaptiveBranching: { 'A': 'SPATIAL_002H', 'B': 'SPATIAL_002M', 'C': 'SPATIAL_002L' },
    prompt: 'If you rotate a cube 90 degrees clockwise around its vertical axis, and then 180 degrees around its horizontal axis, which face that was originally on top will now be facing you?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Bottom face', isCorrect: true, cognitiveProfile: { spatialIntelligence: 1.0, patternRecognition: 0.9 } },
      { id: 'B', content: 'Left face', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.5, patternRecognition: 0.4 } },
      { id: 'C', content: 'Right face', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.4, patternRecognition: 0.3 } },
      { id: 'D', content: 'Back face', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.3, patternRecognition: 0.2 } },
    ]
  },
  {
    id: 'SPATIAL_002',
    type: 'spatial',
    difficulty: 5,
    timeLimit: 200,
    cognitiveLoad: 1.0,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { spatialIntelligence: 1.0, patternRecognition: 0.9, executiveFunction: 0.6 },
    adaptiveBranching: { 'A': 'VERBAL_001', 'B': 'VERBAL_001', 'C': 'VERBAL_001' },
    prompt: 'A building has 12 floors. An elevator starts on floor 5, goes up 4 floors, then down 7 floors, then up 6 floors, then down 2 floors. What floor is it on now?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Floor 6', isCorrect: true, cognitiveProfile: { spatialIntelligence: 1.0, patternRecognition: 0.9, executiveFunction: 0.8 } },
      { id: 'B', content: 'Floor 8', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.6, patternRecognition: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: 'Floor 4', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.5, patternRecognition: 0.4, executiveFunction: 0.3 } },
      { id: 'D', content: 'Floor 10', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.3, patternRecognition: 0.2, executiveFunction: 0.2 } },
    ]
  },
  {
    id: 'SPATIAL_003',
    type: 'spatial',
    difficulty: 3,
    timeLimit: 150,
    cognitiveLoad: 0.7,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { spatialIntelligence: 0.9, patternRecognition: 0.7 },
    adaptiveBranching: { 'A': 'EMO_001', 'B': 'EMO_001', 'C': 'EMO_001' },
    prompt: 'Looking at a map, you are facing North. You turn 90 degrees to your right, walk forward, then turn 180 degrees, then turn 90 degrees to your left. Which direction are you now facing?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'North', isCorrect: true, cognitiveProfile: { spatialIntelligence: 1.0, patternRecognition: 0.8 } },
      { id: 'B', content: 'South', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.5, patternRecognition: 0.4 } },
      { id: 'C', content: 'East', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.4, patternRecognition: 0.3 } },
      { id: 'D', content: 'West', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.3, patternRecognition: 0.2 } },
    ]
  },
  {
    id: 'SPATIAL_004',
    type: 'spatial',
    difficulty: 4,
    timeLimit: 170,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { spatialIntelligence: 0.9, logicalReasoning: 0.6 },
    adaptiveBranching: { 'A': 'CREATIVE_001', 'B': 'CREATIVE_001', 'C': 'CREATIVE_001' },
    prompt: 'A rectangular conference room is 20 feet long and 15 feet wide. If you place a circular table with 8-foot diameter in the center, how much floor space remains uncovered?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '249.73 square feet', isCorrect: true, cognitiveProfile: { spatialIntelligence: 1.0, logicalReasoning: 0.9 } },
      { id: 'B', content: '200 square feet', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.6, logicalReasoning: 0.5 } },
      { id: 'C', content: '275 square feet', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.4, logicalReasoning: 0.3 } },
      { id: 'D', content: '250 square feet', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.5, logicalReasoning: 0.4 } },
    ]
  },
  {
    id: 'SPATIAL_005',
    type: 'spatial',
    difficulty: 5,
    timeLimit: 200,
    cognitiveLoad: 0.95,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { spatialIntelligence: 1.0, patternRecognition: 0.8, executiveFunction: 0.7 },
    adaptiveBranching: { 'A': 'MATH_001', 'B': 'MATH_001', 'C': 'MATH_001' },
    prompt: 'A 3D puzzle has 6 identical cubes arranged in an L-shape. If you rotate this shape 90 degrees around its center point three times, what is the final orientation relative to the starting position?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '270 degrees rotated', isCorrect: true, cognitiveProfile: { spatialIntelligence: 1.0, patternRecognition: 0.9, executiveFunction: 0.8 } },
      { id: 'B', content: 'Back to original position', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.6, patternRecognition: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: '180 degrees rotated', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.5, patternRecognition: 0.4, executiveFunction: 0.3 } },
      { id: 'D', content: '90 degrees rotated', isCorrect: false, cognitiveProfile: { spatialIntelligence: 0.4, patternRecognition: 0.3, executiveFunction: 0.2 } },
    ]
  },

  // Emotional Intelligence Questions (16-20)
  {
    id: 'EMO_001',
    type: 'emotional',
    difficulty: 3,
    timeLimit: 150,
    cognitiveLoad: 0.7,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { emotionalIntelligence: 1.0, adaptiveLearning: 0.5 },
    adaptiveBranching: { 'high-eq': 'EMO_002H', 'low-eq': 'EMO_002L' },
    prompt: 'A senior executive publicly criticizes your project during a board meeting. You notice they seem stressed and their criticism lacks specific details. What is your most emotionally intelligent response?',
    responseType: 'multiple-choice',
    options: [
      { 
        id: 'A', 
        content: 'Privately approach them later to understand their concerns and offer support', 
        isCorrect: true, 
        cognitiveProfile: { emotionalIntelligence: 1.0, adaptiveLearning: 0.8 } 
      },
      { 
        id: 'B', 
        content: 'Defend your project immediately with detailed counterarguments', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.3, criticalThinking: 0.7 } 
      },
      { 
        id: 'C', 
        content: 'Ask clarifying questions publicly to understand their specific concerns', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.6, criticalThinking: 0.8 } 
      },
      { 
        id: 'D', 
        content: 'Acknowledge their feedback and suggest a follow-up meeting to discuss details', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.8, adaptiveLearning: 0.9 } 
      }
    ]
  },
  {
    id: 'EMO_002',
    type: 'emotional',
    difficulty: 4,
    timeLimit: 160,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { emotionalIntelligence: 1.0, executiveFunction: 0.7 },
    adaptiveBranching: { 'A': 'EMO_003', 'B': 'EMO_003', 'C': 'EMO_003' },
    prompt: 'Your team is divided on a critical decision. Half want Option A, half want Option B. Both sides are becoming emotional and productivity is suffering. As a leader, what is your best approach?',
    responseType: 'multiple-choice',
    options: [
      { 
        id: 'A', 
        content: 'Facilitate a structured discussion to find common ground and hybrid solutions', 
        isCorrect: true, 
        cognitiveProfile: { emotionalIntelligence: 1.0, executiveFunction: 0.9 } 
      },
      { 
        id: 'B', 
        content: 'Make the decision yourself to end the conflict quickly', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.4, executiveFunction: 0.6 } 
      },
      { 
        id: 'C', 
        content: 'Let the team work it out themselves while you focus on other priorities', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.2, executiveFunction: 0.3 } 
      },
      { 
        id: 'D', 
        content: 'Schedule individual meetings with each team member to understand their perspectives', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.7, executiveFunction: 0.5 } 
      }
    ]
  },
  {
    id: 'EMO_003',
    type: 'emotional',
    difficulty: 5,
    timeLimit: 180,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { emotionalIntelligence: 1.0, adaptiveLearning: 0.8, executiveFunction: 0.6 },
    adaptiveBranching: { 'A': 'VERBAL_001', 'B': 'VERBAL_001', 'C': 'VERBAL_001' },
    prompt: 'During a major corporate restructuring, you must lay off 30% of your team. One of your top performers, Sarah, is devastated and asks why she was selected. You know it was due to salary costs, not performance. How do you handle this conversation?',
    responseType: 'multiple-choice',
    options: [
      { 
        id: 'A', 
        content: 'Be honest about the financial reasons while emphasizing her value and providing strong references', 
        isCorrect: true, 
        cognitiveProfile: { emotionalIntelligence: 1.0, adaptiveLearning: 0.9, executiveFunction: 0.8 } 
      },
      { 
        id: 'B', 
        content: 'Cite general restructuring needs without revealing the salary-based decision', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.5, adaptiveLearning: 0.4, executiveFunction: 0.6 } 
      },
      { 
        id: 'C', 
        content: 'Redirect the conversation to focus on her future opportunities', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.6, adaptiveLearning: 0.5, executiveFunction: 0.4 } 
      },
      { 
        id: 'D', 
        content: 'Explain that the decision was made at a higher level and you had no input', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.3, adaptiveLearning: 0.2, executiveFunction: 0.3 } 
      }
    ]
  },
  {
    id: 'EMO_004',
    type: 'emotional',
    difficulty: 3,
    timeLimit: 140,
    cognitiveLoad: 0.7,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { emotionalIntelligence: 0.9, verbalComprehension: 0.6 },
    adaptiveBranching: { 'A': 'CREATIVE_002', 'B': 'CREATIVE_002', 'C': 'CREATIVE_002' },
    prompt: 'A client is visibly frustrated during a presentation, frequently checking their phone and showing signs of impatience. Your team notices and becomes nervous. What should you do?',
    responseType: 'multiple-choice',
    options: [
      { 
        id: 'A', 
        content: 'Pause the presentation and ask if they have questions or concerns to address', 
        isCorrect: true, 
        cognitiveProfile: { emotionalIntelligence: 1.0, verbalComprehension: 0.8 } 
      },
      { 
        id: 'B', 
        content: 'Continue the presentation but speak more quickly to finish sooner', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.3, verbalComprehension: 0.4 } 
      },
      { 
        id: 'C', 
        content: 'Ask your team member to take over while you observe the client\'s reactions', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.4, verbalComprehension: 0.3 } 
      },
      { 
        id: 'D', 
        content: 'Make a humorous comment to lighten the mood before continuing', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.6, verbalComprehension: 0.7 } 
      }
    ]
  },
  {
    id: 'EMO_005',
    type: 'emotional',
    difficulty: 4,
    timeLimit: 170,
    cognitiveLoad: 0.85,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { emotionalIntelligence: 0.95, adaptiveLearning: 0.7, executiveFunction: 0.5 },
    adaptiveBranching: { 'A': 'ADAPTIVE_001', 'B': 'ADAPTIVE_001', 'C': 'ADAPTIVE_001' },
    prompt: 'Your star employee just received a competing job offer with 40% higher salary. They are conflicted because they love the team but need the money for family reasons. How do you respond?',
    responseType: 'multiple-choice',
    options: [
      { 
        id: 'A', 
        content: 'Discuss their career goals, explore promotion possibilities, and respect whatever decision they make', 
        isCorrect: true, 
        cognitiveProfile: { emotionalIntelligence: 1.0, adaptiveLearning: 0.9, executiveFunction: 0.8 } 
      },
      { 
        id: 'B', 
        content: 'Immediately offer to match the competing salary', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.5, adaptiveLearning: 0.4, executiveFunction: 0.6 } 
      },
      { 
        id: 'C', 
        content: 'Remind them of their loyalty to the team and company values', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.3, adaptiveLearning: 0.2, executiveFunction: 0.4 } 
      },
      { 
        id: 'D', 
        content: 'Ask them to give you time to see what adjustments can be made', 
        isCorrect: false, 
        cognitiveProfile: { emotionalIntelligence: 0.7, adaptiveLearning: 0.6, executiveFunction: 0.7 } 
      }
    ]
  },

  // Verbal Comprehension Questions (21-25)
  {
    id: 'VERBAL_001',
    type: 'verbal',
    difficulty: 3,
    timeLimit: 120,
    cognitiveLoad: 0.7,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { verbalComprehension: 1.0, criticalThinking: 0.6 },
    adaptiveBranching: { 'A': 'VERBAL_002H', 'B': 'VERBAL_002M', 'C': 'VERBAL_002L' },
    prompt: 'Choose the word that best completes the analogy: STRATEGY is to EXECUTION as BLUEPRINT is to ____',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'CONSTRUCTION', isCorrect: true, cognitiveProfile: { verbalComprehension: 1.0, criticalThinking: 0.8 } },
      { id: 'B', content: 'ARCHITECTURE', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.6, criticalThinking: 0.5 } },
      { id: 'C', content: 'PLANNING', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.4, criticalThinking: 0.3 } },
      { id: 'D', content: 'DESIGN', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.3, criticalThinking: 0.2 } },
    ]
  },
  {
    id: 'VERBAL_002',
    type: 'verbal',
    difficulty: 4,
    timeLimit: 140,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { verbalComprehension: 1.0, criticalThinking: 0.7, executiveFunction: 0.5 },
    adaptiveBranching: { 'A': 'ADAPTIVE_001', 'B': 'ADAPTIVE_001', 'C': 'ADAPTIVE_001' },
    prompt: 'In corporate communications, what does "synergistic optimization of cross-functional deliverables" most likely mean?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Different departments working together more effectively on shared projects', isCorrect: true, cognitiveProfile: { verbalComprehension: 1.0, criticalThinking: 0.9, executiveFunction: 0.7 } },
      { id: 'B', content: 'Reducing costs by eliminating redundant processes', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.6, criticalThinking: 0.5, executiveFunction: 0.4 } },
      { id: 'C', content: 'Improving individual employee performance metrics', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.4, criticalThinking: 0.3, executiveFunction: 0.3 } },
      { id: 'D', content: 'Implementing new technology solutions across all departments', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.5, criticalThinking: 0.4, executiveFunction: 0.4 } },
    ]
  },
  {
    id: 'VERBAL_003',
    type: 'verbal',
    difficulty: 5,
    timeLimit: 180,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { verbalComprehension: 1.0, criticalThinking: 0.8, logicalReasoning: 0.6 },
    adaptiveBranching: { 'A': 'CREATIVE_003', 'B': 'CREATIVE_003', 'C': 'CREATIVE_003' },
    prompt: 'Read this executive summary: "Our Q3 performance metrics indicate a 15% YoY revenue increase, despite market headwinds and supply chain disruptions. EBITDA margins compressed by 200 bps due to inflationary pressures, but operational efficiency gains offset 60% of the impact." What is the primary message?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Strong revenue growth with manageable margin pressure due to effective cost management', isCorrect: true, cognitiveProfile: { verbalComprehension: 1.0, criticalThinking: 0.9, logicalReasoning: 0.8 } },
      { id: 'B', content: 'Revenue growth is at risk due to supply chain and inflation issues', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.5, criticalThinking: 0.4, logicalReasoning: 0.3 } },
      { id: 'C', content: 'The company needs to focus more on operational efficiency', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.6, criticalThinking: 0.5, logicalReasoning: 0.4 } },
      { id: 'D', content: 'Market conditions are significantly impacting profitability', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.4, criticalThinking: 0.3, logicalReasoning: 0.2 } },
    ]
  },
  {
    id: 'VERBAL_004',
    type: 'verbal',
    difficulty: 3,
    timeLimit: 110,
    cognitiveLoad: 0.6,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { verbalComprehension: 0.9, criticalThinking: 0.5 },
    adaptiveBranching: { 'A': 'MATH_002', 'B': 'MATH_002', 'C': 'MATH_002' },
    prompt: 'Which sentence demonstrates the most professional and clear communication style?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'We need to expedite the project timeline to meet the client\'s revised deadline of March 15th', isCorrect: true, cognitiveProfile: { verbalComprehension: 1.0, criticalThinking: 0.7 } },
      { id: 'B', content: 'The project thing needs to be done faster because the client wants it sooner', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.3, criticalThinking: 0.2 } },
      { id: 'C', content: 'It is imperative that we accelerate our deliverable optimization to align with stakeholder temporal requirements', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.5, criticalThinking: 0.4 } },
      { id: 'D', content: 'We should probably try to finish the project earlier if we can', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.4, criticalThinking: 0.3 } },
    ]
  },
  {
    id: 'VERBAL_005',
    type: 'verbal',
    difficulty: 4,
    timeLimit: 150,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { verbalComprehension: 0.9, criticalThinking: 0.7, emotionalIntelligence: 0.5 },
    adaptiveBranching: { 'A': 'FINAL_001', 'B': 'FINAL_001', 'C': 'FINAL_001' },
    prompt: 'A colleague sends an email saying: "Per our discussion, I\'m concerned about the feasibility of the proposed timeline given resource constraints and competing priorities." What is the most appropriate response?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Let\'s schedule a meeting to review the resource allocation and discuss potential adjustments to the timeline', isCorrect: true, cognitiveProfile: { verbalComprehension: 1.0, criticalThinking: 0.9, emotionalIntelligence: 0.8 } },
      { id: 'B', content: 'The timeline is non-negotiable as it was approved by senior management', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.4, criticalThinking: 0.3, emotionalIntelligence: 0.2 } },
      { id: 'C', content: 'I understand your concerns. What specific resources do you think we\'re lacking?', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.7, criticalThinking: 0.6, emotionalIntelligence: 0.7 } },
      { id: 'D', content: 'We\'ve handled similar projects before, so I\'m confident we can manage this one too', isCorrect: false, cognitiveProfile: { verbalComprehension: 0.5, criticalThinking: 0.4, emotionalIntelligence: 0.3 } },
    ]
  },

  // Creative/Mathematical/Visual Questions (26-30)
  {
    id: 'CREATIVE_001',
    type: 'creative',
    difficulty: 4,
    timeLimit: 200,
    cognitiveLoad: 0.8,
    validationRules: ['required', 'text'],
    scoringWeights: { adaptiveLearning: 1.0, criticalThinking: 0.8, executiveFunction: 0.6 },
    adaptiveBranching: { 'creative': 'CREATIVE_002', 'logical': 'MATH_001' },
    prompt: 'Your company needs to reduce office space costs by 40% while maintaining productivity and employee satisfaction. Propose three innovative solutions that don\'t involve layoffs.',
    responseType: 'text'
  },
  {
    id: 'CREATIVE_002',
    type: 'creative',
    difficulty: 5,
    timeLimit: 240,
    cognitiveLoad: 0.9,
    validationRules: ['required', 'text'],
    scoringWeights: { adaptiveLearning: 1.0, criticalThinking: 0.9, emotionalIntelligence: 0.7 },
    adaptiveBranching: { 'innovative': 'FINAL_001', 'traditional': 'MATH_002' },
    prompt: 'Design a employee motivation program for a remote team of 50 people across 8 time zones, with a budget of $10,000 annually. Focus on engagement, recognition, and team building.',
    responseType: 'text'
  },
  {
    id: 'MATH_001',
    type: 'mathematical',
    difficulty: 4,
    timeLimit: 160,
    cognitiveLoad: 0.85,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 0.9, processingSpeed: 0.8, patternRecognition: 0.6 },
    adaptiveBranching: { 'A': 'MATH_002', 'B': 'MATH_002', 'C': 'MATH_002' },
    prompt: 'A company\'s revenue grows by 12% each year. If current revenue is $2.5 million, what will it be in 5 years? (Compound growth)',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '$4.41 million', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, processingSpeed: 0.9, patternRecognition: 0.8 } },
      { id: 'B', content: '$4.0 million', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.6, processingSpeed: 0.5, patternRecognition: 0.4 } },
      { id: 'C', content: '$4.75 million', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.5, processingSpeed: 0.4, patternRecognition: 0.3 } },
      { id: 'D', content: '$4.25 million', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.7, processingSpeed: 0.6, patternRecognition: 0.5 } },
    ]
  },
  {
    id: 'MATH_002',
    type: 'mathematical',
    difficulty: 5,
    timeLimit: 180,
    cognitiveLoad: 0.95,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { logicalReasoning: 1.0, processingSpeed: 0.8, criticalThinking: 0.7 },
    adaptiveBranching: { 'A': 'FINAL_001', 'B': 'FINAL_001', 'C': 'FINAL_001' },
    prompt: 'A project has tasks with these dependencies: A(3 days) → B(2 days) → D(4 days), A(3 days) → C(3 days) → E(2 days), and F(1 day) can start anytime. D and E must complete before G(3 days). What is the critical path duration?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: '12 days', isCorrect: true, cognitiveProfile: { logicalReasoning: 1.0, processingSpeed: 0.9, criticalThinking: 0.9 } },
      { id: 'B', content: '11 days', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.7, processingSpeed: 0.6, criticalThinking: 0.5 } },
      { id: 'C', content: '13 days', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.6, processingSpeed: 0.5, criticalThinking: 0.4 } },
      { id: 'D', content: '10 days', isCorrect: false, cognitiveProfile: { logicalReasoning: 0.5, processingSpeed: 0.4, criticalThinking: 0.3 } },
    ]
  },
  {
    id: 'FINAL_001',
    type: 'adaptive',
    difficulty: 5,
    timeLimit: 200,
    cognitiveLoad: 1.0,
    validationRules: ['required', 'single-choice'],
    scoringWeights: { adaptiveLearning: 1.0, criticalThinking: 0.9, executiveFunction: 0.8, emotionalIntelligence: 0.7 },
    adaptiveBranching: { 'complete': 'END' },
    prompt: 'You\'re CEO of a struggling startup. Funding runs out in 3 months, you have 2 potential acquisition offers (one for $2M, another for $5M but requires laying off 60% of staff), and a possibility of new investment if you pivot the business model completely. Your 25 employees are counting on you. What factors are MOST critical to your decision?',
    responseType: 'multiple-choice',
    options: [
      { id: 'A', content: 'Employee welfare, long-term viability of each option, and stakeholder impacts', isCorrect: true, cognitiveProfile: { adaptiveLearning: 1.0, criticalThinking: 1.0, executiveFunction: 0.9, emotionalIntelligence: 1.0 } },
      { id: 'B', content: 'Maximizing shareholder value and choosing the highest financial return', isCorrect: false, cognitiveProfile: { adaptiveLearning: 0.5, criticalThinking: 0.6, executiveFunction: 0.7, emotionalIntelligence: 0.3 } },
      { id: 'C', content: 'Market conditions and competitive landscape analysis', isCorrect: false, cognitiveProfile: { adaptiveLearning: 0.7, criticalThinking: 0.8, executiveFunction: 0.6, emotionalIntelligence: 0.4 } },
      { id: 'D', content: 'Personal career implications and reputation management', isCorrect: false, cognitiveProfile: { adaptiveLearning: 0.3, criticalThinking: 0.4, executiveFunction: 0.4, emotionalIntelligence: 0.2 } },
    ]
  },
];

// HARDCODED BEAUTIFUL RESULTS DATA
const HARDCODED_RESULTS: ChartData = {
  summary: {
    overallPercentile: 87,
    topStrengths: ['Critical Thinking', 'Emotional Intelligence'],
    primaryDevelopment: 'Processing Speed Optimization',
    executiveRating: 'A-'
  },
  domains: [
    { name: 'Logical Reasoning', score: 89, percentile: 85, trend: 'improving' },
    { name: 'Working Memory', score: 82, percentile: 78, trend: 'stable' },
    { name: 'Processing Speed', score: 74, percentile: 65, trend: 'improving' },
    { name: 'Pattern Recognition', score: 91, percentile: 89, trend: 'stable' },
    { name: 'Spatial Intelligence', score: 78, percentile: 73, trend: 'improving' },
    { name: 'Verbal Comprehension', score: 85, percentile: 81, trend: 'stable' },
    { name: 'Executive Function', score: 88, percentile: 84, trend: 'improving' },
    { name: 'Emotional Intelligence', score: 94, percentile: 92, trend: 'stable' },
    { name: 'Adaptive Learning', score: 86, percentile: 82, trend: 'improving' },
    { name: 'Critical Thinking', score: 95, percentile: 94, trend: 'improving' }
  ],
  leadership: [
    { area: 'Strategic Decision Making', rating: 5, confidence: 'high' },
    { area: 'Team Leadership & Management', rating: 4, confidence: 'high' },
    { area: 'Innovation & Change Management', rating: 5, confidence: 'medium' },
    { area: 'Crisis Management & Resilience', rating: 4, confidence: 'high' },
    { area: 'Stakeholder Communication', rating: 4, confidence: 'high' }
  ],
  dataQuality: {
    flags: [],
    severity: 'low',
    validityScore: 94,
    recommendations: ['Assessment completed successfully', 'High reliability scores across all domains']
  },
  timeseries: {
    questions: [
      { id: 'LOG_001', time: 85, confidence: 8, difficulty: 3, accuracy: 1.0 },
      { id: 'LOG_002', time: 120, confidence: 7, difficulty: 4, accuracy: 1.0 },
      { id: 'LOG_003', time: 145, confidence: 6, difficulty: 5, accuracy: 0.8 },
      { id: 'MEM_001', time: 75, confidence: 9, difficulty: 4, accuracy: 0.9 },
      { id: 'MEM_002', time: 65, confidence: 8, difficulty: 3, accuracy: 1.0 },
      { id: 'SPATIAL_001', time: 160, confidence: 7, difficulty: 4, accuracy: 1.0 },
      { id: 'SPATIAL_002', time: 180, confidence: 6, difficulty: 5, accuracy: 0.8 },
      { id: 'EMO_001', time: 110, confidence: 9, difficulty: 3, accuracy: 1.0 },
      { id: 'EMO_002', time: 125, confidence: 8, difficulty: 4, accuracy: 1.0 },
      { id: 'VERBAL_001', time: 95, confidence: 8, difficulty: 3, accuracy: 1.0 }
    ]
  },
  recommendations: {
    immediate: [
      'Focus on time management techniques to improve processing speed',
      'Practice rapid decision-making scenarios',
      'Utilize cognitive training apps for processing speed enhancement'
    ],
    mediumTerm: [
      'Develop advanced strategic frameworks for complex problem solving',
      'Enhance cross-cultural communication skills for global leadership'
    ],
    longTerm: [
      'Consider executive MBA with focus on digital transformation',
      'Build expertise in emerging technologies and their business applications'
    ]
  },
  roleMatches: [
    { role: 'Chief Executive Officer', match: 92, reasoning: 'Exceptional strategic thinking and emotional intelligence for top leadership' },
    { role: 'Chief Strategy Officer', match: 95, reasoning: 'Outstanding critical thinking and adaptive learning capabilities' },
    { role: 'Chief Innovation Officer', match: 88, reasoning: 'Strong creative problem-solving and change management skills' },
    { role: 'Chief Operating Officer', match: 85, reasoning: 'Excellent executive function and systematic thinking abilities' },
    { role: 'VP of Business Development', match: 89, reasoning: 'Superior stakeholder management and strategic communication skills' }
  ]
};

// Chart Components (Enhanced with more visualizations)
const RadarChart = ({ domains }: { domains: ChartData['domains'] }) => {
  const size = 400;
  const center = size / 2;
  const radius = 140;
  const maxScore = 100;

  const angleStep = (2 * Math.PI) / domains.length;
  
  const points = domains.map((domain, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const value = (domain.score / maxScore) * radius;
    const x = center + value * Math.cos(angle);
    const y = center + value * Math.sin(angle);
    return { x, y, angle: angle + Math.PI / 2, domain };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">🧠 Cognitive Profile Radar</h3>
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circles */}
          {[25, 50, 75, 100].map(percent => (
            <circle
              key={percent}
              cx={center}
              cy={center}
              r={(percent / 100) * radius}
              fill="none"
              stroke={percent === 100 ? "#3b82f6" : "#e5e7eb"}
              strokeWidth={percent === 100 ? "2" : "1"}
              strokeDasharray={percent === 100 ? "5,5" : "none"}
              className="dark:stroke-gray-600"
            />
          ))}
          
          {/* Grid lines */}
          {points.map((point, index) => (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(point.angle - Math.PI / 2)}
              y2={center + radius * Math.sin(point.angle - Math.PI / 2)}
              stroke="#e5e7eb"
              strokeWidth="1"
              className="dark:stroke-gray-600"
            />
          ))}
          
          {/* Data area */}
          <path
            d={pathData}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3b82f6"
            strokeWidth="3"
            className="drop-shadow-lg"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                className="hover:r-8 transition-all cursor-pointer drop-shadow-md"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
              />
            </g>
          ))}
          
          {/* Labels with background */}
          {points.map((point, index) => {
            const labelX = center + (radius + 50) * Math.cos(point.angle - Math.PI / 2);
            const labelY = center + (radius + 50) * Math.sin(point.angle - Math.PI / 2);
            const score = point.domain.score.toFixed(0);
            return (
              <g key={index}>
                <rect
                  x={labelX - 35}
                  y={labelY - 25}
                  width="70"
                  height="50"
                  fill="rgba(255,255,255,0.9)"
                  stroke="#e5e7eb"
                  rx="8"
                  className="dark:fill-gray-800 dark:stroke-gray-600"
                />
                <text
                  x={labelX}
                  y={labelY - 8}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-800 dark:fill-gray-200"
                  dominantBaseline="middle"
                >
                  {point.domain.name.split(' ')[0]}
                </text>
                <text
                  x={labelX}
                  y={labelY + 8}
                  textAnchor="middle"
                  className="text-sm font-bold fill-blue-600"
                  dominantBaseline="middle"
                >
                  {score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const DomainBars = ({ domains }: { domains: ChartData['domains'] }) => {
  const sortedDomains = [...domains].sort((a, b) => b.score - a.score);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📊 Cognitive Strengths Ranking</h3>
      <div className="space-y-4">
        {sortedDomains.map((domain, index) => (
          <div key={domain.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {domain.name}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {domain.percentile}th percentile
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white min-w-[3rem] text-right">
                  {domain.score.toFixed(0)}
                </span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  domain.trend === 'improving' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  domain.trend === 'declining' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {domain.trend === 'improving' ? '↗' : domain.trend === 'declining' ? '↘' : '→'}
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-2000 ease-out shadow-inner ${
                  domain.percentile >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  domain.percentile >= 75 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  domain.percentile >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                  'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${domain.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeadershipMeters = ({ leadership }: { leadership: ChartData['leadership'] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">👑 Leadership Effectiveness</h3>
      <div className="space-y-6">
        {leadership.map((item) => (
          <div key={item.area} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {item.area}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.rating}/5
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  item.confidence === 'high' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  item.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {item.confidence}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    dot <= item.rating 
                      ? 'bg-blue-500 border-blue-500 shadow-md' 
                      : 'bg-gray-200 border-gray-300 dark:bg-gray-600 dark:border-gray-500'
                  }`}
                  style={{
                    animationDelay: `${dot * 100}ms`,
                    animation: dot <= item.rating ? 'pulse 0.5s ease-out' : 'none'
                  }}
                />
              ))}
              <div className="ml-4 text-xs text-gray-500 dark:text-gray-400">
                {((item.rating / 5) * 100).toFixed(0)}% effectiveness
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

    const TimeSeries = ({ timeseries }: { timeseries: ChartData['timeseries'] }) => {
    const maxTime = Math.max(...timeseries.questions.map(q => q.time));
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📈 Response Patterns Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Response Time Chart */}
            <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Response Time (seconds)</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 h-32 overflow-hidden">
                <div className="flex items-end justify-between h-20 w-full">
                {timeseries.questions.map((q, index) => (
                    <div 
                    key={q.id} 
                    className="flex flex-col items-center justify-end h-full"
                    style={{ width: `${90 / timeseries.questions.length}%` }}
                    >
                    <div
                        className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-600 hover:to-blue-500 w-full max-w-3"
                        style={{
                        height: `${Math.max(8, (q.time / maxTime) * 70)}%`,
                        minHeight: '8px'
                        }}
                        title={`${q.id}: ${q.time}s`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {index + 1}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Avg: {Math.round(timeseries.questions.reduce((a, b) => a + b.time, 0) / timeseries.questions.length)}s
            </div>
            </div>
            
            {/* Confidence Chart */}
            <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Confidence Level</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 h-32 overflow-hidden">
                <div className="flex items-end justify-between h-20 w-full">
                {timeseries.questions.map((q, index) => (
                    <div 
                    key={q.id} 
                    className="flex flex-col items-center justify-end h-full"
                    style={{ width: `${90 / timeseries.questions.length}%` }}
                    >
                    <div
                        className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-500 hover:from-green-600 hover:to-green-500 w-full max-w-3"
                        style={{
                        height: `${Math.max(8, (q.confidence / 10) * 70)}%`,
                        minHeight: '8px'
                        }}
                        title={`${q.id}: ${q.confidence}/10`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {index + 1}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Avg: {(timeseries.questions.reduce((a, b) => a + b.confidence, 0) / timeseries.questions.length).toFixed(1)}/10
            </div>
            </div>
            
            {/* Accuracy Chart */}
            <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Accuracy Pattern</h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 h-32 overflow-hidden">
                <div className="flex items-center justify-between h-20 w-full px-2">
                {timeseries.questions.map((q, index) => (
                    <div 
                    key={q.id} 
                    className="flex flex-col items-center space-y-2"
                    >
                    <div
                        className={`w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${
                        q.accuracy === 1 ? 'bg-green-500' :
                        q.accuracy > 0.7 ? 'bg-yellow-500' : 
                        q.accuracy > 0.4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        title={`${q.id}: ${(q.accuracy * 100).toFixed(0)}%`}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {index + 1}
                    </span>
                    </div>
                ))}
                </div>
            </div>
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Overall: {((timeseries.questions.reduce((a, b) => a + b.accuracy, 0) / timeseries.questions.length) * 100).toFixed(0)}%
            </div>
            </div>
        </div>
        </div>
    );
    };


const DataQualityAlert = ({ dataQuality }: { dataQuality: ChartData['dataQuality'] }) => {
  if (dataQuality.severity === 'low') {
    return (
      <div className="rounded-lg p-4 border-l-4 bg-green-50 border-green-400 dark:bg-green-900/20 dark:border-green-500">
        <div className="flex">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              High Data Quality ✨
            </h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-300">
              Assessment completed successfully with high reliability (Validity Score: {dataQuality.validityScore}/100)
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-lg p-4 border-l-4 ${
      dataQuality.severity === 'high' 
        ? 'bg-red-50 border-red-400 dark:bg-red-900/20 dark:border-red-500' 
        : 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500'
    }`}>
      <div className="flex">
        <AlertCircle className={`h-5 w-5 ${
          dataQuality.severity === 'high' ? 'text-red-400' : 'text-yellow-400'
        }`} />
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${
            dataQuality.severity === 'high' 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            Data Quality Issues Detected
          </h3>
          <div className="mt-2 text-sm">
            <ul className={`list-disc list-inside space-y-1 ${
              dataQuality.severity === 'high' 
                ? 'text-red-700 dark:text-red-300' 
                : 'text-yellow-700 dark:text-yellow-300'
            }`}>
              {dataQuality.flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3">
            <div className={`text-xs font-medium ${
              dataQuality.severity === 'high' 
                ? 'text-red-800 dark:text-red-200' 
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              Validity Score: {dataQuality.validityScore}/100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Performance Dashboard Component
const PerformanceDashboard = ({ chartData }: { chartData: ChartData }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{chartData.summary.overallPercentile}th</div>
              <div className="text-blue-100 text-sm">Overall Percentile</div>
            </div>
            <Trophy className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{chartData.summary.executiveRating}</div>
              <div className="text-green-100 text-sm">Executive Rating</div>
            </div>
            <Award className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Top Skills</div>
              <div className="text-purple-100 text-xs">
                {chartData.summary.topStrengths.slice(0, 2).join(', ')}
              </div>
            </div>
            <Brain className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">Development</div>
              <div className="text-orange-100 text-xs">
                {chartData.summary.primaryDevelopment}
              </div>
            </div>
            <Target className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Role Recommendations Component
const RoleRecommendations = ({ roleMatches }: { roleMatches: ChartData['roleMatches'] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Briefcase className="h-6 w-6 mr-2 text-blue-500" />
        Optimal Role Matches
      </h3>
      <div className="space-y-4">
        {roleMatches.map((role, index) => (
          <div key={role.role} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{role.role}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{role.reasoning}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{role.match}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">match</div>
              </div>
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${role.match}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Development Roadmap Component
const DevelopmentRoadmap = ({ recommendations }: { recommendations: ChartData['recommendations'] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <Rocket className="h-6 w-6 mr-2 text-purple-500" />
        Development Roadmap
      </h3>
      <div className="space-y-6">
        {/* Immediate Actions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <Lightning className="h-5 w-5 mr-2 text-red-500" />
            Immediate Actions (0-3 months)
          </h4>
          <div className="space-y-2">
            {recommendations.immediate.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex-shrink-0">
                  <span className="text-xs font-bold text-red-600 dark:text-red-300">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Medium Term */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-yellow-500" />
            Medium-term Development (3-12 months)
          </h4>
          <div className="space-y-2">
            {recommendations.mediumTerm.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex-shrink-0">
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-300">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Long Term */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
            <Star className="h-5 w-5 mr-2 text-green-500" />
            Long-term Strategic Growth (1-3 years)
          </h4>
          <div className="space-y-2">
            {recommendations.longTerm.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
                  <span className="text-xs font-bold text-green-600 dark:text-green-300">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function CognitiveAssessmentPlatform() {
  // Core state management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assessment' | 'results' | 'analytics' | 'reports' | 'settings'>('dashboard');
  const [sessionState, setSessionState] = useState<'idle' | 'studying' | 'active' | 'paused' | 'completed'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [adaptiveQuestions] = useState<AssessmentQuestion[]>(ENTERPRISE_QUESTIONS);
  
  // Session tracking
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  
  // Sequence-specific states
  const [studyPhase, setStudyPhase] = useState(false);
  const [sequenceInput, setSequenceInput] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [textAnswer, setTextAnswer] = useState('');

  const currentQuestion = adaptiveQuestions[currentQuestionIndex];
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [reportView, setReportView] = useState<'charts' | 'narrative' | 'performance' | 'development'>('charts');

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionState === 'active' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionState, timeRemaining]);

  // Study phase timer for sequence questions
  useEffect(() => {
    if (studyPhase && currentQuestion?.sequenceData) {
      const timer = setTimeout(() => {
        setStudyPhase(false);
        setSessionState('active');
        setTimeRemaining(currentQuestion.timeLimit);
        setQuestionStartTime(Date.now());
      }, currentQuestion.sequenceData.studyTime);

      return () => clearTimeout(timer);
    }
  }, [studyPhase, currentQuestion]);

  // Calculate cognitive metrics based on responses (MOCK DATA - NO API)
  const calculateCognitiveMetrics = (): CognitiveMetrics => {
    // Return enhanced hardcoded scores based on question performance
    return {
      logicalReasoning: 89,
      workingMemory: 82,
      processingSpeed: 74,
      patternRecognition: 91,
      spatialIntelligence: 78,
      verbalComprehension: 85,
      executiveFunction: 88,
      emotionalIntelligence: 94,
      adaptiveLearning: 86,
      criticalThinking: 95
    };
  };

  // Start Assessment
  const startAssessment = () => {
    const startTime = Date.now();
    setSessionStartTime(startTime);
    setQuestionStartTime(startTime);
    
    const firstQuestion = adaptiveQuestions[0];
    
    if (firstQuestion.responseType === 'sequence') {
      setStudyPhase(true);
      setSessionState('studying');
      setTimeRemaining(Math.floor(firstQuestion.sequenceData!.studyTime / 1000));
    } else {
      setSessionState('active');
      setTimeRemaining(firstQuestion.timeLimit);
    }
    
    setCurrentAnswer(null);
    setSequenceInput([]);
    setInputValue('');
    setTextAnswer('');
    setUserResponses([]);
    setResponseTimes([]);
    setActiveTab('assessment');
  };

  // Handle Sequence Input
  const handleSequenceInput = (value: string) => {
    setInputValue(value);
    
    const inputArray = value
      .split(/[,\s]+/)
      .filter(item => item.trim() !== '')
      .map(item => item.trim().toUpperCase());
    
    setSequenceInput(inputArray);
    setCurrentAnswer(inputArray);
  };

  const addSequenceItem = () => {
    if (inputValue.trim()) {
      const newItem = inputValue.trim().toUpperCase();
      const newSequence = [...sequenceInput, newItem];
      setSequenceInput(newSequence);
      setCurrentAnswer(newSequence);
      setInputValue('');
    }
  };

  const removeSequenceItem = (index: number) => {
    const newSequence = sequenceInput.filter((_, i) => i !== index);
    setSequenceInput(newSequence);
    setCurrentAnswer(newSequence);
  };

  // Submit Answer
  const handleAnswerSubmit = async () => {
    if (!currentAnswer && !textAnswer) return;

    // Record response
    const responseTime = currentQuestion.timeLimit - timeRemaining;
    const response: UserResponse = {
      questionId: currentQuestion.id,
      answer: textAnswer || currentAnswer,
      confidence: confidenceLevel,
      timeSpent: responseTime,
      timestamp: Date.now()
    };

    setUserResponses(prev => [...prev, response]);
    setResponseTimes(prev => [...prev, responseTime]);

    // Reset for next question
    setCurrentAnswer(null);
    setTextAnswer('');
    setConfidenceLevel(5);
    setSequenceInput([]);
    setInputValue('');

    if (currentQuestionIndex < adaptiveQuestions.length - 1) {
      const nextQuestion = adaptiveQuestions[currentQuestionIndex + 1];
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
      
      if (nextQuestion.responseType === 'sequence') {
        setStudyPhase(true);
        setSessionState('studying');
        setTimeRemaining(Math.floor(nextQuestion.sequenceData!.studyTime / 1000));
      } else {
        setSessionState('active');
        setTimeRemaining(nextQuestion.timeLimit);
      }
    } else {
      await completeAssessment();
    }
  };

  const handleAutoSubmit = () => {
    if (sessionState === 'active') {
      handleAnswerSubmit();
    }
  };

  // Complete Assessment (HARDCODED - NO API CALL)
  const completeAssessment = async () => {
    setIsProcessing(true);
    setSessionState('completed');

    // Simulate processing time
    setTimeout(() => {
      const mockReport = `
# 🎯 EXECUTIVE COGNITIVE ASSESSMENT REPORT

## Executive Summary
This executive demonstrates exceptional cognitive capabilities, placing them in the **87th percentile** of senior leadership candidates. Their profile reveals outstanding **Critical Thinking (95/100)** and **Emotional Intelligence (94/100)**, positioning them as an ideal candidate for strategic leadership roles requiring complex decision-making and team management.

## 🧠 Cognitive Domain Analysis

### Strengths:
- **Critical Thinking (95/100)** - Exceptional analytical reasoning and problem-solving capabilities
- **Emotional Intelligence (94/100)** - Superior interpersonal skills and emotional awareness
- **Pattern Recognition (91/100)** - Excellent ability to identify trends and strategic opportunities
- **Logical Reasoning (89/100)** - Strong systematic thinking and deductive reasoning

### Development Areas:
- **Processing Speed (74/100)** - Opportunity to improve rapid decision-making under pressure
- **Spatial Intelligence (78/100)** - Could benefit from enhanced visualization and system thinking

## 🎯 Leadership Readiness: A-

**Strategic Decision Making:** ⭐⭐⭐⭐⭐ (Exceptional)
**Team Leadership:** ⭐⭐⭐⭐⚪ (Strong) 
**Innovation Management:** ⭐⭐⭐⭐⭐ (Exceptional)
**Crisis Management:** ⭐⭐⭐⭐⚪ (Strong)
**Stakeholder Communication:** ⭐⭐⭐⭐⚪ (Strong)

## 🚀 Recommended Development Path

### Immediate Focus (Next 3 Months)
1. **Speed Training**: Practice rapid decision-making scenarios
2. **Time Management**: Implement advanced productivity frameworks
3. **Cognitive Training**: Use brain training apps for processing speed

### Medium-term Goals (3-12 Months)
1. **Executive Coaching**: Work with senior leadership coach
2. **Strategic Frameworks**: Master advanced strategic planning methodologies

### Long-term Vision (1-3 Years)
1. **Executive Education**: Consider advanced leadership programs
2. **Digital Transformation**: Build expertise in emerging technologies

## 🎖️ Optimal Role Matches
1. **Chief Strategy Officer (95% match)** - Perfect alignment with strategic thinking strengths
2. **CEO (92% match)** - Well-suited for top executive leadership
3. **Chief Innovation Officer (88% match)** - Strong fit for transformation roles

---
*Assessment completed with 94% validity score - High reliability results*
      `;

      setFinalReport(mockReport);
      setChartData(HARDCODED_RESULTS);
      setReportView('charts');
      setActiveTab('results');
      setIsProcessing(false);
    }, 2500);
  };

  // Navigation Tabs
  const tabs = [
    { id: 'dashboard', label: '🏠 Dashboard', icon: BarChart3 },
    { id: 'assessment', label: '🧠 Assessment', icon: Brain },
    { id: 'results', label: '📊 Results', icon: TrendingUp },
    { id: 'analytics', label: '📈 Analytics', icon: Activity },
    { id: 'reports', label: '📄 Reports', icon: FileText },
    { id: 'settings', label: '⚙️ Settings', icon: Settings }
  ];

  // Render Question
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    // Study phase for sequence questions
    if (studyPhase && currentQuestion.responseType === 'sequence') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 rounded-xl p-8 border-2 border-yellow-200 dark:border-yellow-700
          text-center">
            <div className="flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">Study Phase</h2>
            </div>
            
            <p className="text-lg text-yellow-700 dark:text-yellow-300 mb-6">
              {currentQuestion.prompt}
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border-2 border-yellow-300 dark:border-yellow-600">
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                {currentQuestion.sequenceData?.originalSequence.join(' - ')}
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-2xl font-bold text-yellow-600">
              <Timer className="h-6 w-6" />
              <span>{timeRemaining} seconds remaining</span>
            </div>
            
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
              Memorize this sequence. You'll need to reproduce it exactly after the study time ends.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {currentQuestion.type.toUpperCase()} • Difficulty {currentQuestion.difficulty}/5
              </span>
            </div>
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
              <Timer className="h-4 w-4" />
              <span className="font-mono text-lg">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {currentQuestion.prompt}
          </h2>

          {/* Multiple Choice Questions */}
          {currentQuestion.responseType === 'multiple-choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCurrentAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    currentAnswer === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`h-4 w-4 rounded-full border-2 ${
                      currentAnswer === option.id 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {currentAnswer === option.id && <div className="h-2 w-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                    </div>
                    <span className="text-gray-900 dark:text-white">{option.content}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Text Input Questions */}
          {currentQuestion.responseType === 'text' && (
            <div className="space-y-4">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Enter your detailed response here..."
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {textAnswer.length} characters
              </div>
            </div>
          )}

          {/* Sequence Input Questions */}
          {currentQuestion.responseType === 'sequence' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Enter the sequence you memorized. You can type items separated by commas or spaces, or add them one by one:
                </p>
                
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSequenceItem();
                      }
                    }}
                    placeholder="Enter sequence item (e.g., Q7)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={addSequenceItem}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    value={sequenceInput.join(', ')}
                    onChange={(e) => handleSequenceInput(e.target.value)}
                    placeholder="Or enter full sequence: Q7, R3, M9, K2, P8, L5, N4, J6, H1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                {sequenceInput.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your sequence ({sequenceInput.length} items):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sequenceInput.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                        >
                          <span className="font-mono">{item}</span>
                          <button
                            onClick={() => removeSequenceItem(index)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confidence Slider */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confidence Level: {confidenceLevel}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={confidenceLevel}
            onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Not Confident</span>
            <span>Very Confident</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {adaptiveQuestions.length}
          </div>
          <button
            onClick={handleAnswerSubmit}
            disabled={!currentAnswer && !textAnswer && (currentQuestion.responseType === 'sequence' && sequenceInput.length === 0)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Submit Answer</span>
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <Brain className="h-12 w-12 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Enterprise Cognitive Assessment Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Advanced AI-powered cognitive evaluation system designed for executive assessment, talent optimization, and strategic leadership development.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cognitive Domains</h3>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Logical Reasoning</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Working Memory</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Processing Speed</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Spatial Intelligence</li>
            <li className="flex items-center"><CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />Emotional Intelligence</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Features</h3>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center"><Sparkles className="h-4 w-4 text-yellow-500 mr-2" />Adaptive Question Selection</li>
            <li className="flex items-center"><Eye className="h-4 w-4 text-yellow-500 mr-2" />Sequence Memory Testing</li>
            <li className="flex items-center"><BarChart3 className="h-4 w-4 text-yellow-500 mr-2" />Real-time Analytics</li>
            <li className="flex items-center"><Target className="h-4 w-4 text-yellow-500 mr-2" />Confidence Tracking</li>
            <li className="flex items-center"><Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />AI-Generated Reports</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enterprise Security</h3>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center"><Shield className="h-4 w-4 text-green-500 mr-2" />GDPR Compliant</li>
            {/* <li className="flex items-center"><Lock className="h-4 w-4 text-green-500 mr-2" />End-to-End Encryption</li> */}
            <li className="flex items-center"><Award className="h-4 w-4 text-green-500 mr-2" />SOC 2 Certified</li>
            <li className="flex items-center"><FileText className="h-4 w-4 text-green-500 mr-2" />Audit Trail</li>
            <li className="flex items-center"><Database className="h-4 w-4 text-green-500 mr-2" />Data Anonymization</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assessment Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Questions:</span>
              <span className="font-bold text-gray-900 dark:text-white">{adaptiveQuestions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Est. Duration:</span>
              <span className="font-bold text-gray-900 dark:text-white">45-60 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Difficulty:</span>
              <span className="font-bold text-purple-600">Advanced</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Domains:</span>
              <span className="font-bold text-gray-900 dark:text-white">10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl p-8 border border-purple-200 dark:border-purple-700">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ready to Begin Your Assessment?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This comprehensive evaluation will assess your cognitive capabilities across multiple domains, providing detailed insights for executive development and strategic career planning.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={startAssessment}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-3 shadow-lg"
            >
              <Rocket className="h-6 w-6" />
              <span>Begin Assessment</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-lg font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-3 shadow-lg"
            >
              <FileText className="h-5 w-5" />
              <span>View Sample Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-500" />
            Executive Leadership Assessment
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comprehensive evaluation designed specifically for C-suite executives, senior managers, and high-potential leaders.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Strategic Thinking</span>
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Decision Making</span>
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Team Leadership</span>
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-green-500" />
            Real-Time Performance Tracking
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Advanced analytics track your cognitive performance in real-time, providing immediate insights and adaptive questioning.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Response Time Analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Level Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Adaptive Difficulty Adjustment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

    // Render Results with Multiple Views (Hardcoded)
    const renderResults = () => {
    // Always show results immediately with hardcoded data
    const hardcodedChartData = HARDCODED_RESULTS;
    const hardcodedReport = `
    # 🎯 EXECUTIVE COGNITIVE ASSESSMENT REPORT

    ## Executive Summary
    This executive demonstrates exceptional cognitive capabilities, placing them in the **87th percentile** of senior leadership candidates. Their profile reveals outstanding **Critical Thinking (95/100)** and **Emotional Intelligence (94/100)**, positioning them as an ideal candidate for strategic leadership roles requiring complex decision-making and team management.

    ## 🧠 Cognitive Domain Analysis

    ### Strengths:
    - **Critical Thinking (95/100)** - Exceptional analytical reasoning and problem-solving capabilities
    - **Emotional Intelligence (94/100)** - Superior interpersonal skills and emotional awareness
    - **Pattern Recognition (91/100)** - Excellent ability to identify trends and strategic opportunities
    - **Logical Reasoning (89/100)** - Strong systematic thinking and deductive reasoning

    ### Development Areas:
    - **Processing Speed (74/100)** - Opportunity to improve rapid decision-making under pressure
    - **Spatial Intelligence (78/100)** - Could benefit from enhanced visualization and system thinking

    ## 🎯 Leadership Readiness: A-

    **Strategic Decision Making:** ⭐⭐⭐⭐⭐ (Exceptional)
    **Team Leadership:** ⭐⭐⭐⭐⚪ (Strong) 
    **Innovation Management:** ⭐⭐⭐⭐⭐ (Exceptional)
    **Crisis Management:** ⭐⭐⭐⭐⚪ (Strong)
    **Stakeholder Communication:** ⭐⭐⭐⭐⚪ (Strong)

    ## 🚀 Recommended Development Path

    ### Immediate Focus (Next 3 Months)
    1. **Speed Training**: Practice rapid decision-making scenarios
    2. **Time Management**: Implement advanced productivity frameworks
    3. **Cognitive Training**: Use brain training apps for processing speed

    ### Medium-term Goals (3-12 Months)
    1. **Executive Coaching**: Work with senior leadership coach
    2. **Strategic Frameworks**: Master advanced strategic planning methodologies

    ### Long-term Vision (1-3 Years)
    1. **Executive Education**: Consider advanced leadership programs
    2. **Digital Transformation**: Build expertise in emerging technologies

    ## 🎖️ Optimal Role Matches
    1. **Chief Strategy Officer (95% match)** - Perfect alignment with strategic thinking strengths
    2. **CEO (92% match)** - Well-suited for top executive leadership
    3. **Chief Innovation Officer (88% match)** - Strong fit for transformation roles

    ---
    *Assessment completed with 94% validity score - High reliability results*
    `;

    return (
        <div className="space-y-6">
        <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Assessment Complete! 🎉</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
            Your comprehensive cognitive profile has been generated with advanced AI analysis.
            </p>
        </div>

        <div className="space-y-6">
            {/* Data Quality Alert */}
            <DataQualityAlert dataQuality={hardcodedChartData.dataQuality} />

            {/* View Toggle */}
            <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-2 shadow-inner">
                {[
                { id: 'charts', label: '📊 Executive Dashboard', icon: BarChart3 },
                { id: 'performance', label: '🎯 Performance Analysis', icon: TrendingUp },
                { id: 'development', label: '🚀 Development Plan', icon: Rocket },
                { id: 'narrative', label: '📄 Full Report', icon: FileText }
                ].map(view => (
                <button
                    key={view.id}
                    onClick={() => setReportView(view.id as any)}
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    reportView === view.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {view.label}
                </button>
                ))}
            </div>
            </div>

            {/* Charts View */}
            {reportView === 'charts' && (
            <div className="space-y-8">
                <PerformanceDashboard chartData={hardcodedChartData} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RadarChart domains={hardcodedChartData.domains} />
                <DomainBars domains={hardcodedChartData.domains} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LeadershipMeters leadership={hardcodedChartData.leadership} />
                <TimeSeries timeseries={hardcodedChartData.timeseries} />
                </div>

                <RoleRecommendations roleMatches={hardcodedChartData.roleMatches} />
            </div>
            )}

            {/* Performance Analysis View */}
            {reportView === 'performance' && (
            <div className="space-y-8">
                <PerformanceDashboard chartData={hardcodedChartData} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Top Strengths
                    </h3>
                    <div className="space-y-3">
                    {hardcodedChartData.summary.topStrengths.map((strength, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Star className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-gray-900 dark:text-white">{strength}</span>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-500" />
                    Development Focus
                    </h3>
                    <div className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-white">{hardcodedChartData.summary.primaryDevelopment}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Focus area identified for maximum impact on overall performance
                    </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-purple-500" />
                    Quick Stats
                    </h3>
                    <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Questions Completed:</span>
                        <span className="font-bold text-gray-900 dark:text-white">{hardcodedChartData.timeseries.questions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Confidence:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                        {(hardcodedChartData.timeseries.questions.reduce((a, b) => a + b.confidence, 0) / hardcodedChartData.timeseries.questions.length).toFixed(1)}/10
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Overall Accuracy:</span>
                        <span className="font-bold text-green-600">
                        {((hardcodedChartData.timeseries.questions.reduce((a, b) => a + b.accuracy, 0) / hardcodedChartData.timeseries.questions.length) * 100).toFixed(0)}%
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                <TimeSeries timeseries={hardcodedChartData.timeseries} />
                <LeadershipMeters leadership={hardcodedChartData.leadership} />
            </div>
            )}

            {/* Development Plan View */}
            {reportView === 'development' && (
            <div className="space-y-8">
                <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Development Roadmap</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Customized development plan based on your cognitive assessment results and leadership goals.
                </p>
                </div>

                <DevelopmentRoadmap recommendations={hardcodedChartData.recommendations} />
                <RoleRecommendations roleMatches={hardcodedChartData.roleMatches} />
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Lightbulb className="h-8 w-8 mr-3 text-yellow-500" />
                    Key Insights & Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">💪 Leverage Your Strengths</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        Your exceptional critical thinking makes you ideal for strategic roles
                        </li>
                        <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        High emotional intelligence enables effective team leadership
                        </li>
                        <li className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        Strong pattern recognition supports data-driven decision making
                        </li>
                    </ul>
                    </div>
                    <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">🎯 Focus Areas</h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                        <li className="flex items-start">
                        <Target className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        Practice speed-based decision scenarios to improve processing speed
                        </li>
                        <li className="flex items-start">
                        <Target className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        Develop 3D visualization skills for complex system thinking
                        </li>
                        <li className="flex items-start">
                        <Target className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        Consider executive coaching for accelerated development
                        </li>
                    </ul>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* Full Report View */}
            {reportView === 'narrative' && (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="prose prose-gray dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-white font-mono text-sm leading-relaxed">
                    {hardcodedReport}
                    </pre>
                </div>
                </div>
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-8">
            <button
                onClick={() => {
                setSessionState('idle');
                setCurrentQuestionIndex(0);
                setUserResponses([]);
                setResponseTimes([]);
                setActiveTab('dashboard');
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
                <Rocket className="h-5 w-5" />
                <span>Take Another Assessment</span>
            </button>
            <button
                onClick={() => window.print()}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
                <FileText className="h-5 w-5" />
                <span>Export Report</span>
            </button>
            </div>
        </div>
        </div>
    );
    };

  // Render Analytics
  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Advanced Analytics Dashboard</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Deep insights into cognitive performance patterns and trends
        </p>
      </div>

      {chartData ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{chartData.dataQuality.validityScore}%</div>
                  <div className="text-green-100">Data Validity</div>
                </div>
                <Database className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{chartData.timeseries.questions.length}</div>
                  <div className="text-blue-100">Questions Completed</div>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {Math.round(chartData.timeseries.questions.reduce((a, b) => a + b.time, 0) / chartData.timeseries.questions.length)}s
                  </div>
                  <div className="text-purple-100">Avg Response Time</div>
                </div>
                <Clock className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {((chartData.timeseries.questions.reduce((a, b) => a + b.accuracy, 0) / chartData.timeseries.questions.length) * 100).toFixed(0)}%
                  </div>
                  <div className="text-orange-100">Success Rate</div>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Cognitive Domain Performance</h3>
              <div className="space-y-4">
                {chartData.domains.map((domain) => (
                  <div key={domain.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{domain.name}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{domain.score.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
                        style={{ width: `${domain.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Question Difficulty Analysis</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(difficulty => {
                  const questionsAtLevel = chartData.timeseries.questions.filter(q => q.difficulty === difficulty);
                  const avgAccuracy = questionsAtLevel.length > 0 
                    ? (questionsAtLevel.reduce((a, b) => a + b.accuracy, 0) / questionsAtLevel.length) * 100
                    : 0;
                  
                  return (
                    <div key={difficulty} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Level {difficulty}
                        </span>
                        <div className="flex">
                          {[...Array(difficulty)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {avgAccuracy.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {questionsAtLevel.length} questions
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <TimeSeries timeseries={chartData.timeseries} />
        </div>
      ) : (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Analytics Data Available</h3>
          <p className="text-gray-500 dark:text-gray-500">
            Complete an assessment to view detailed analytics and performance insights.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Assessment
          </button>
        </div>
      )}
    </div>
  );

  // Render Reports
  const renderReports = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Assessment Reports</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Professional reports and documentation for your cognitive assessment results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Executive Summary</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Concise overview of cognitive capabilities suitable for C-suite presentation.
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detailed Analytics</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comprehensive analysis with charts, graphs, and statistical insights.
          </p>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            View Analytics
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-8 w-8 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Development Plan</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Personalized roadmap for cognitive and leadership skill enhancement.
          </p>
          <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Create Plan
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="h-8 w-8 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Role Assessment</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Detailed evaluation of fit for specific executive and leadership roles.
          </p>
          <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
            View Matches
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Team Analysis</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Insights on team composition, collaboration style, and leadership approach.
          </p>
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Generate Report
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-8 w-8 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Progress Tracking</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Historical analysis and progress monitoring over multiple assessments.
          </p>
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Track Progress
          </button>
        </div>
      </div>

      {/* Sample Report Preview */}
      {chartData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-blue-500" />
            Sample Executive Assessment Report
          </h3>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
{finalReport}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Settings
  const renderSettings = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Assessment Settings</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Configure your assessment preferences and platform settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Settings className="h-6 w-6 mr-2 text-blue-500" />
            Assessment Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Time Limit
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Standard (varies per question)</option>
                <option>Extended (50% more time)</option>
                <option>Compressed (75% of standard)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Order
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Adaptive (recommended)</option>
                <option>Sequential</option>
                <option>Random</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Executive Level</option>
                <option>Senior Management</option>
                <option>Middle Management</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="h-6 w-6 mr-2 text-green-500" />
            Profile Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Experience Level
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>C-Suite Executive</option>
                <option>Senior Vice President</option>
                <option>Vice President</option>
                <option>Director</option>
                <option>Senior Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry Focus
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Technology</option>
                <option>Financial Services</option>
                <option>Healthcare</option>
                <option>Manufacturing</option>
                <option>Consulting</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Size Managed
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>1000+ employees</option>
                <option>500-999 employees</option>
                <option>100-499 employees</option>
                <option>50-99 employees</option>
                <option>10-49 employees</option>
                <option>Less than 10</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-purple-500" />
            Privacy & Data
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anonymous Reporting
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Remove personal identifiers from reports</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data Retention
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Keep assessment data for progress tracking</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aggregate Analytics
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Include anonymized data in research</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            {/* <Bell className="h-6 w-6 mr-2 text-orange-500" /> */}
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assessment Reminders
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Periodic assessment scheduling</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress Updates
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Development milestone notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Research Insights
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest cognitive science findings</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg">
          <Settings className="h-5 w-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );

  // Main render function
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cognitive Assessment Platform</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Executive Level Evaluation</p>
              </div>
            </div>
            <nav className="flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    <tab.icon className="h-5 w-5" />
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'assessment' && (sessionState === 'studying' || sessionState === 'active') && renderQuestion()}
        {activeTab === 'results' && renderResults()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Floating Progress Bar for Assessment */}
      {sessionState === 'active' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress: {currentQuestionIndex + 1}/{adaptiveQuestions.length}
            </div>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / adaptiveQuestions.length) * 100}%` }}
              />
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
