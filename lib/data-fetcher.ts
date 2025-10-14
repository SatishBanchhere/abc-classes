"use server"
import { adminDb } from "./firebase-admin"
import {collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where} from "firebase/firestore"
import { db } from "@/lib/firebase"
import {getFirestore} from "firebase-admin/firestore";
import { Question } from "@/types";
import { QuestionFromDB } from "@/types/QuestionFromDB";
import { TestConfig } from "@/types/TestConfig";

export interface HomePageData {
    siteName: string
    siteTagline: string
    logoUrl: string
    heroTitle: string
    heroSubtitle: string
    heroDescription: string
    heroImage: string
    heroButtonText: string
    heroSecondaryButtonText: string

    // Advertisement Section
    advertisement: {
        enabled: boolean
        title: string
        subtitle: string
        description: string
        image: string
        buttonText: string
        buttonLink: string
        backgroundColor: string
        textColor: string
        position: 'after-hero' | 'after-features' | 'after-testimonials'
    }

    // Statistics
    successRate: string
    studentsCount: string
    neetSelections: string
    mhtcetSelections: string
    iitSelections: string
    iiserniserSelections: string
    successRateText: string
    studentsCountText: string
    neetSelectionsText: string
    mhtcetSelectionsText: string
    iitSelectionsText: string
    iiserniserSelectionsText: string

    // Gallery
    galleryImages: Array<{
        url: string
        alt: string
        caption?: string
    }>

    // YouTube Videos
    youtubeVideos: Array<{
        url: string
        title: string
        description?: string
    }>

    // Features
    features: Array<{
        title: string
        description: string
        icon: string
        color: string
    }>

    // Testimonials
    testimonials: Array<{
        name: string
        college: string
        rating: number
        review: string
        avatar: string
    }>

    // Footer
    footerDescription: string
    quickLinks: Array<{
        title: string
        url: string
    }>
    // programs: Array<{
    //     title: string
    //     description: string
    //     url: string
    // }>
    programs: string[]

    // Contact
    contactPhone: string
    contactEmail: string
    contactAddress: string
    socialLinks: {
        twitter: string
        facebook: string
        instagram: string
        youtube: string
        linkedin: string
    }

    // SEO
    seoTitle: string
    seoDescription: string
    seoKeywords: string

    // Styling
    primaryColor: string
    secondaryColor: string
    accentColor: string

    copyrightText: string
}

export interface ContactPageData {
    pageTitle: string
    pageDescription: string
    heroImage: string

    // Office Details
    officeTitle: string
    officeAddress: string
    officeImage: string

    // Contact Details
    contactTitle: string
    contactNumbers: string[]
    contactEmails: string[]

    // Map
    mapEmbedUrl: string
    mapTitle: string

    // Working Hours
    workingHours: Array<{
        day: string
        hours: string
    }>

    // Additional Info
    additionalInfo: string

    // Form Settings
    formTitle: string
    formDescription: string

    // SEO
    seoTitle: string
    seoDescription: string
}

export interface JeePageData {
    pageTitle: string
    pageSubtitle: string
    pageDescription: string
    heroImage: string

    // Physics Section
    physicsTitle: string
    physicsDescription: string
    physicsImage: string
    // physicsFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    physicsFeatures: string[]

    // Chemistry Section
    chemistryTitle: string
    chemistryDescription: string
    chemistryImage: string
    // chemistryFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    chemistryFeatures: string[]

    // Mathematics Section
    mathematicsTitle: string
    mathematicsDescription: string
    mathematicsImage: string
    // mathematicsFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    mathematicsFeatures: string[]

    // Additional Info
    additionalInfo: string
    ctaText: string
    ctaButtonText: string

    // Course Details
    courseDetails: Array<{
        title: string
        duration: string
        description: string
        features: string[]
        price: string
    }>

    // SEO
    seoTitle: string
    seoDescription: string
}

export interface NeetPageData {
    pageTitle: string
    pageSubtitle: string
    pageDescription: string
    heroImage: string

    // Physics Section
    physicsTitle: string
    physicsDescription: string
    physicsImage: string
    // physicsFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    physicsFeatures: string[]


    // Chemistry Section
    chemistryTitle: string
    chemistryDescription: string
    chemistryImage: string
    // chemistryFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    chemistryFeatures: string[]

    // Biology Section
    biologyTitle: string
    biologyDescription: string
    biologyImage: string
    // biologyFeatures: Array<{
    //     title: string
    //     description: string
    //     icon: string
    // }>
    biologyFeatures: string[]

    // Additional Info
    additionalInfo: string
    ctaText: string
    ctaButtonText: string

    // Course Details
    courseDetails: Array<{
        title: string
        duration: string
        description: string
        features: string[]
        price: string
    }>

    // SEO
    seoTitle: string
    seoDescription: string
}

export interface ResultsPageData {
    pageTitle: string
    pageDescription: string
    heroImage: string

    // Current Year
    currentYearTitle: string
    currentYearDescription: string

    // Achievement Images
    achievementImages: Array<{
        url: string
        alt: string
        caption: string
    }>

    // Toppers
    toppers: Array<{
        name: string
        achievement: string
        image: string
        rank: string
        college: string
        year: string
        category: 'jee' | 'neet' | 'other'
    }>

    // Previous Years
    previousYears: Array<{
        year: string
        description: string
        toppers: Array<{
            name: string
            achievement: string
            rank: string
            college: string
        }>
    }>

    // Testimonial Images
    testimonialImages: Array<{
        url: string
        alt: string
        caption: string
    }>

    // Statistics
    yearlyStats: Array<{
        year: string
        jeeSelections: number
        neetSelections: number
        topRanks: number
    }>

    // SEO
    seoTitle: string
    seoDescription: string
}

export interface TestQuestion {
    __v: number
    _id: string // MongoDB document ID
    answerKey: string
    correctAnswer: string
    createdAt: string // Firebase Timestamp
    difficulty: "easy" | "medium" | "hard" | "Unknown"
    examType: string
    locked: boolean
    options:{
        A: string | null
        B: string | null
        C: string | null
        D: string | null
    }
    displayIndex: number
    questionDescription: string
    questionNo: number
    questionType: "mcq" | "integer"
    selectedChapter: string
    selectedSubject: string
    selectedSubtopic: string
    solution: string
    subjectId: string
    subjectName: string
    subtopicName: string
    topicId: string
    topicName: string
    updatedAt: string // Firebase Timestamp
    // question_no: number
    // question_text: string
    // question_type: "mcq" | "numerical"
    // option1?: string
    // option2?: string
    // option3?: string
    // option4?: string
    // correct_answer: string
    // subject: string
    // displayIndex?: number
    // selectedSubject?: string
}

export interface TestMetadata {
    id: string
    title: string
    questions: TestQuestion[]
    description?: string
    examType: string
    status: "active" | "inactive"
    totalTime: number
    totalQuestions: number
    totalMarks: number
    correctMarks: number
    wrongMarks: number
    instructions: string
    // testConfig: {
    //     branchName: string
    //     correctMarks : number
    //     examType : string
    //     optionType : "mcq" | "numerical"
    //     paperDate : string
    //     paperTime : string
    //     paperType : string
    //     paperName: string
    //     startFrom: number
    //     subjectWise: {
    //         biology: number
    //         chemistry: number
    //         mathematics: number
    //         physics: number
    //     }
    //     totalTime: number
    //     wrongMarks : number
    //     status : "active" | "inactive"
    // }
    testConfig: TestConfig
    // subjectWise: {
    //     physics: number
    //     chemistry: number
    //     mathematics: number
    // }
    createdAt: any // Firebase Timestamp
    creatorUID: string
}

export interface TestData extends TestMetadata {
    result: {
        [subject: string]: TestQuestion[]
    }
}

export interface TestSeriesData {
    jeemain: TestMetadata[]
    jeeadvanced: TestMetadata[]
    neet: TestMetadata[]
    fullLength: TestMetadata[]
}

export interface MediaPageData {
    pageTitle: string
    pageDescription: string
    heroImage: string

    // YouTube Videos for Media/Interviews
    mediaVideos: Array<{
        url: string
        title: string
        description?: string
        category: 'interview' | 'testimonial' | 'achievement' | 'other'
        date?: string
        featured?: boolean
    }>

    // SEO
    seoTitle: string
    seoDescription: string
    seoKeywords: string
}

export interface TestSubmission {
    user_id: string
    test_id: string
    test_name: string
    submitted_at: any // Firebase Timestamp
    score: number
    correct_answers: number
    incorrect_answers: number
    unanswered_questions: number
    time_spent: number
    percentage: number
    total_questions: number
    mcq_answers: Record<number, number>
    integer_answers: Record<number, string>
    question_status: Record<number, string>
    answered_questions: number
}

const defaultMediaPageData: MediaPageData = {
  pageTitle: "Media & Interviews",
  pageDescription: "Watch interviews, student stories, and media features highlighting our outcomes and philosophy.",
  heroImage: "/images/media/hero.jpg",

  mediaVideos: [
    {
      url: "https://www.youtube.com/watch?v=example1",
      title: "Exclusive Interview – Learning That Works",
      description: "Our founder shares practical teaching frameworks and student growth strategies.",
      category: "interview",
      date: "2024-01-15",
      featured: true
    },
    {
      url: "https://www.youtube.com/watch?v=example2",
      title: "Student Success Story - From Struggle to IIT",
      description: "Rajesh shares his transformation journey from failing mock tests to cracking JEE Advanced.",
      category: "testimonial",
      date: "2024-03-20",
      featured: true
    },
    {
      url: "https://www.youtube.com/watch?v=example3",
      title: "NEET Topper Shares Study Strategy",
      description: "Priya discusses her daily routine, time management, and how ABC Classes guided her NEET preparation.",
      category: "testimonial",
      date: "2024-06-10",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example4",
      title: "Faculty Spotlight - Chemistry Made Simple",
      description: "Our chemistry expert demonstrates innovative teaching methods for organic chemistry concepts.",
      category: "educational",
      date: "2024-02-28",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example5",
      title: "Parent-Teacher Conference Highlights",
      description: "Parents share their experience with our personalized mentoring approach and student progress tracking.",
      category: "testimonial",
      date: "2024-04-15",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example6",
      title: "Mock Test Analysis Session",
      description: "Live demonstration of our analytics platform showing how students identify and improve weak areas.",
      category: "educational",
      date: "2024-05-05",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example7",
      title: "Local News Feature - Education Excellence",
      description: "ABC Classes featured on regional news for outstanding JEE and NEET results in Maharashtra.",
      category: "media",
      date: "2024-07-22",
      featured: true
    },
    {
      url: "https://www.youtube.com/watch?v=example8",
      title: "Physics Problem Solving Masterclass",
      description: "Step-by-step approach to tackle complex JEE physics problems with real exam examples.",
      category: "educational",
      date: "2024-03-12",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example9",
      title: "Alumni Reunion - Where Are They Now?",
      description: "Former students now in IIT, AIIMS, and top engineering colleges share their career journeys.",
      category: "testimonial",
      date: "2024-08-30",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example10",
      title: "Study Tips for Competitive Exams",
      description: "Expert advice on time management, revision strategies, and maintaining mental health during preparation.",
      category: "educational",
      date: "2024-01-08",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example11",
      title: "Behind the Scenes - Test Series Creation",
      description: "How our faculty creates exam-like questions and maintains question bank quality standards.",
      category: "educational",
      date: "2024-04-03",
      featured: false
    },
    {
      url: "https://www.youtube.com/watch?v=example12",
      title: "Motivational Talk - Overcoming Exam Anxiety",
      description: "Counseling session helping students manage stress and build confidence for competitive exams.",
      category: "motivational",
      date: "2024-05-18",
      featured: false
    }
  ],

  seoTitle: "Media & Interviews - ABC Classes",
  seoDescription: "Explore interviews, student testimonials, and media features from ABC Classes.",
  seoKeywords: "ABC Classes interviews, student testimonials, JEE stories, NEET coaching media"
}

// Default data with comprehensive fallbacks
const defaultHomePageData: HomePageData = {
  siteName: "ABC Classes",
  siteTagline: "Excellence in Education",
  logoUrl: "",
  heroTitle: "Master JEE, NEET & MHTCET with Clarity and Consistency",
  heroSubtitle: "India’s Leading Coaching for JEE, NEET & MHTCET",
  heroDescription: "Join motivated learners excelling in JEE, NEET & MHTCET with expert guidance, refined study material, and a realistic online testing platform.",
  heroImage: "",
  heroButtonText: "Start Your Journey",
  heroSecondaryButtonText: "Watch Demo",

  advertisement: {
    enabled: true,
    title: "🎯 Admissions Open",
    subtitle: "Limited Seats",
    description: "Flat 20% off on JEE, NEET & MHTCET programs. Expert faculty, structured content, and measurable progress.",
    image: "",
    buttonText: "Apply Now",
    buttonLink: "/contact",
    backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    position: "after-hero"
  },

  successRate: "95%",
  studentsCount: "10,000+",
  iitSelections: "500+",
  neetSelections: "300+",
  mhtcetSelections: "200+",
  iiserniserSelections: "150+",

  successRateText: "Success Rate",
  studentsCountText: "Students",
  iitSelectionsText: "IIT Selections",
  neetSelectionsText: "NEET Selections",
  mhtcetSelectionsText: "MHTCET Selections",
  iiserniserSelectionsText: "IISER/NISER Selections",

  galleryImages: [],
  youtubeVideos: [],

  features: [
    {
      title: "Expert Faculty",
      description: "Learn from experienced mentors with strong outcomes across JEE, NEET & MHTCET.",
      icon: "BookOpen",
      color: "#3b82f6"
    },
    {
      title: "Real Exam Simulation",
      description: "Practice on a platform that mirrors actual patterns, timing, and difficulty.",
      icon: "Users",
      color: "#10b981"
    },
    {
      title: "Personalized Analytics",
      description: "Insightful performance tracking with targeted recommendations for improvement.",
      icon: "Award",
      color: "#f59e0b"
    },
  ],

  testimonials: [
    {
      name: "Rahul Sharma",
      college: "IIT Delhi, CSE",
      rating: 5,
      review: "Cracked JEE Advanced with AIR 247. Mock tests felt authentic and analytics showed exactly what to fix.",
      avatar: "",
    },
    {
      name: "Priya Patel",
      college: "IIT Bombay, EE",
      rating: 5,
      review: "Actionable feedback and mentoring made the difference. The focus on fundamentals was spot on.",
      avatar: "",
    },
    {
      name: "Arjun Singh",
      college: "IIT Kanpur, ME",
      rating: 5,
      review: "High-quality faculty and comprehensive test series. Study material is crisp and to the point.",
      avatar: "",
    },
  ],

  footerDescription: "Coaching for JEE, NEET & MHTCET with 15+ years of focused preparation and consistent results.",
  quickLinks: [
    { title: "About Us", url: "/about" },
    { title: "Courses", url: "/courses" },
    { title: "Results", url: "/results" },
    { title: "Contact", url: "/contact" }
  ],
  programs: [
    "JEE Main",
    "JEE Advanced",
    "NEET",
    "Foundation"
  ],

  contactPhone: "+91 97362 13312",
  contactEmail: "support@abcclasses.com",
  contactAddress: "Nagpur, Maharashtra, India",
  socialLinks: {
    twitter: "#",
    facebook: "#",
    instagram: "#",
    youtube: "#",
    linkedin: "#"
  },

  seoTitle: "ABC Classes - Best JEE & NEET Coaching",
  seoDescription: "Premier coaching for JEE, NEET, MHTCET & IISER with expert faculty and proven outcomes.",
  seoKeywords: "JEE coaching, NEET coaching, MHTCET coaching, IISER NISER preparation, IIT preparation, medical entrance, engineering entrance",

  primaryColor: "#1a73e8",
  secondaryColor: "#4285f4",
  accentColor: "#34a853",

  copyrightText: "© 2025 ABC Classes. All rights reserved.",
}

// Similar comprehensive defaults for other interfaces...
const defaultContactPageData: ContactPageData = {
  pageTitle: "Contact Us",
  pageDescription: "ABC Classes offers coaching for NEET, IIT-JEE, and competitive exams.",
  heroImage: "",
  officeTitle: "Office Address",
  officeAddress: "94, Bajaj Nagar, Near CIIMS Hospital, Nagpur - 440010",
  officeImage: "",
  contactTitle: "Contact Details",
  contactNumbers: ["9736213312", "7249175414"],
  contactEmails: ["contact@abcclasses.com", "info@abcclasses.com"],
  mapEmbedUrl: "",
  mapTitle: "Find Us",
  workingHours: [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" }
  ],
  additionalInfo: "Have questions? Reach out for NEET/IIT-JEE or counseling support.",
  formTitle: "Get In Touch",
  formDescription: "Send a message and the team will respond promptly.",
  seoTitle: "Contact ABC Classes - JEE NEET Coaching",
  seoDescription: "Contact ABC Classes in Nagpur for admissions, counseling, and course details.",
}


const defaultJeePageData: JeePageData = {
  pageTitle: "JEE",
  pageSubtitle: "Physics, Chemistry & Math by Specialists",
  pageDescription:
    "Coaching tailored for JEE with NCERT grounding and competitive rigor. Structured teaching, regular practice, and targeted mentoring.",
  heroImage: "/images/jee/hero.jpg",

  physicsTitle: "Physics",
  physicsDescription:
    "Concept-first delivery with targeted problem solving. NCERT-oriented flow with competitive depth and one-to-one interactions.",
  physicsImage: "/images/jee/physics.jpg",
  physicsFeatures: [
    "NCERT Oriented Teaching",
    "Competitive Approach",
    "One-to-One Interaction",
    "Experienced Faculty",
    "Timely Syllabus Completion"
  ],

  chemistryTitle: "Chemistry",
  chemistryDescription:
    "Balanced coverage of Physical, Organic, and Inorganic with NCERT fidelity and extensive practice for JEE-level problems.",
  chemistryImage: "/images/jee/chemistry.jpg",
  chemistryFeatures: [
    "NCERT Oriented Teaching",
    "Competitive Approach",
    "Individual Doubt Sessions",
    "Experienced Faculty",
    "Extensive Practice"
  ],

  mathematicsTitle: "Mathematics",
  mathematicsDescription:
    "Conceptual clarity with layered problem sets from basics to advanced JEE patterns, reinforced by mocks and reviews.",
  mathematicsImage: "/images/jee/mathematics.jpg",
  mathematicsFeatures: [
    "Conceptual Clarity",
    "NCERT + Advanced Problems",
    "Regular Doubt Sessions",
    "Mock Tests & Quizzes",
    "Topic-wise Practice Sheets"
  ],

  additionalInfo:
    "Printed notes, curated assignments, and detailed test discussions. Limited batch sizes for focused attention and timely completion.",
  ctaText: "Individual classes also available for Physics, Chemistry & Math.",
  ctaButtonText: "Join Now",

  courseDetails: [
    {
      title: "1-Year JEE Course",
      duration: "12 Months",
      description: "Ideal for Grade 12 or droppers with full syllabus coverage and revision.",
      features: [
        "Complete PCM coverage",
        "Regular Tests & Assignments",
        "Doubt Sessions",
        "Study Materials & Practice Sheets",
      ],
      price: "₹60,000",
    },
    {
      title: "2-Year Foundation Course",
      duration: "24 Months",
      description: "For Grade 11 starters with progressive build-up toward JEE.",
      features: [
        "Comprehensive Coverage",
        "NCERT + Competitive Preparation",
        "Periodic Evaluation",
        "Mentorship & Career Guidance",
      ],
      price: "₹1,10,000",
    },
  ],

  seoTitle: "Best JEE Coaching in Nagpur | Physics Chemistry Math",
  seoDescription:
    "Excel at JEE with experienced mentors, exam-like tests, and focused analytics. Book a free counseling session.",
}

const defaultNeetPageData: NeetPageData = {
  pageTitle: "NEET",
  pageSubtitle: "Physics, Chemistry & Biology by Specialists",
  pageDescription:
    "NEET-focused coaching with NCERT alignment, daily practice, and consistent evaluation. Personal mentoring to drive accuracy and speed.",
  heroImage: "/images/neet/hero.jpg",

  physicsTitle: "Physics",
  physicsDescription:
    "NCERT-aligned progression with MCQ-focused practice and one-to-one interactions for rapid doubt resolution.",
  physicsImage: "/images/neet/physics.jpg",
  physicsFeatures: [
    "NCERT Oriented Teaching",
    "Competitive Approach",
    "One-to-One Interaction",
    "Experienced Faculty",
    "NEET Focused Curriculum"
  ],

  chemistryTitle: "Chemistry",
  chemistryDescription:
    "Clear fundamentals with NEET-pattern practice and timed drills across Physical, Organic, and Inorganic.",
  chemistryImage: "/images/neet/chemistry.jpg",
  chemistryFeatures: [
    "NCERT Oriented Teaching",
    "Competitive Approach",
    "Individual Doubt Sessions",
    "Experienced Faculty",
    "NEET Specific Practice"
  ],

  biologyTitle: "Biology",
  biologyDescription:
    "NCERT line-by-line approach with visuals, DPPs, and PYQ-backed emphasis on high-yield topics.",
  biologyImage: "/images/neet/biology.jpg",
  biologyFeatures: [
    "NCERT Line-by-Line Coverage",
    "Conceptual Clarity",
    "Diagrams & Flowcharts",
    "Daily Practice Questions",
    "Previous Year Analysis"
  ],

  additionalInfo:
    "Structured notes, weekly tests, and in-depth discussions with timely completion. Limited seats for optimal attention.",
  ctaText: "Individual classes also available for PCB.",
  ctaButtonText: "Join Now",

  courseDetails: [
    {
      title: "1-Year NEET Course",
      duration: "12 Months",
      description: "For Grade 12 or drop year. Full syllabus with analysis-driven revision.",
      features: [
        "Complete syllabus coverage",
        "NCERT-focused materials",
        "Daily Practice Sheets",
        "Weekly Tests & Analysis",
      ],
      price: "₹55,000",
    },
    {
      title: "2-Year Foundation Course",
      duration: "24 Months",
      description: "For Grade 11 starters. Strong base with NEET trajectory.",
      features: [
        "Structured Learning Plan",
        "Doubt Sessions & Counseling",
        "All India Test Series",
        "Printed Notes & Assignments",
      ],
      price: "₹95,000",
    },
  ],

  seoTitle: "Best NEET Coaching in Nagpur | Physics Chemistry Biology",
  seoDescription:
    "Crack NEET with focused teaching, exam-like practice, and analytics-driven improvement. Enroll now.",
}

const defaultResultsPageData: ResultsPageData = {
  pageTitle: "Our Shining Stars",
  pageDescription: "Celebrating the achievers who set new benchmarks.",
  heroImage: "/images/results/hero.jpg",

  currentYearTitle: "2024 Achievements",
  currentYearDescription:
    "Congratulations to our students for stellar performances across JEE, NEET, and Olympiads.",

  achievementImages: [
    {
      url: "/images/results/atharva.jpg",
      alt: "Award ceremony photo",
      caption: "AIR 150 in JEE Advanced 2024",
    },
    {
      url: "/images/results/hrithuja.jpg",
      alt: "NEET success photo",
      caption: "AIR 200 in NEET 2024",
    },
    {
      url: "/images/results/rushikesh.jpg",
      alt: "Olympiad recognition",
      caption: "State Rank 5 in Chemistry Olympiad",
    },
  ],

  toppers: [
    {
      name: "Atharva Tade",
      achievement: "JEE Advanced",
      image: "/images/results/atharva.jpg",
      rank: "AIR 150",
      college: "IIT Bombay",
      year: "2024",
      category: "jee",
    },
    {
      name: "Rushikesh",
      achievement: "Chemistry Olympiad",
      image: "/images/results/rushikesh.jpg",
      rank: "State Rank 5",
      college: "HSC Maharashtra Board",
      year: "2024",
      category: "other",
    },
    {
      name: "Hrithuja Mallu",
      achievement: "NEET",
      image: "/images/results/hrithuja.jpg",
      rank: "AIR 200",
      college: "AIIMS Delhi",
      year: "2024",
      category: "neet",
    },
  ],

  previousYears: [
    {
      year: "2023",
      description: "Applauding our standout performers of the year.",
      toppers: [
        {
          name: "Rajesh Rathore",
          achievement: "JEE Advanced",
          rank: "AIR 245",
          college: "IIT Delhi",
        },
        {
          name: "Abhishekam Tripathi",
          achievement: "JEE Main",
          rank: "Percentile 99.4",
          college: "NIT Nagpur",
        },
        {
          name: "Akshita Verma",
          achievement: "NEET",
          rank: "AIR 320",
          college: "Maulana Azad Medical College",
        },
      ],
    },
  ],

  testimonialImages: [
    {
      url: "/images/testimonials/student1.jpg",
      alt: "Student testimonial",
      caption: "Mentorship and clarity-driven teaching made a tangible difference.",
    },
    {
      url: "/images/testimonials/student2.jpg",
      alt: "Student feedback",
      caption: "Focused doubt-solving improved both accuracy and confidence.",
    },
  ],

  yearlyStats: [
    {
      year: "2024",
      jeeSelections: 47,
      neetSelections: 61,
      topRanks: 12,
    },
    {
      year: "2023",
      jeeSelections: 39,
      neetSelections: 53,
      topRanks: 10,
    },
    {
      year: "2022",
      jeeSelections: 35,
      neetSelections: 49,
      topRanks: 8,
    },
  ],

  seoTitle: "Top Results | JEE & NEET Achievers",
  seoDescription:
    "View standout results from JEE, NEET, and Olympiads with consistent year-on-year performance.",
}

export async function getMediaPageData(): Promise<MediaPageData> {
    try {
        const docRef = doc(db, "websiteContent", "media")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultMediaPageData, ...docSnap.data() } as MediaPageData
        }
        return defaultMediaPageData
    } catch (error) {
        console.error("Error fetching media data:", error)
        return defaultMediaPageData
    }
}

// Export functions remain the same but with enhanced error handling
export async function getHomePageData(): Promise<HomePageData> {
    try {
        const docRef = doc(db, "websiteContent", "homepage")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultHomePageData, ...docSnap.data() } as HomePageData
        }
        return defaultHomePageData
    } catch (error) {
        console.error("Error fetching homepage data:", error)
        return defaultHomePageData
    }
}

export async function getContactPageData(): Promise<ContactPageData> {
    try {
        const docRef = doc(db, "websiteContent", "contact")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultContactPageData, ...docSnap.data() } as ContactPageData
        }
        return defaultContactPageData
    } catch (error) {
        console.error("Error fetching contact data:", error)
        return defaultContactPageData
    }
}

// Add similar functions for other pages...
export async function getJeePageData(): Promise<JeePageData> {
    try {
        const docRef = doc(db, "websiteContent", "jee")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultJeePageData, ...docSnap.data() } as JeePageData
        }
        return defaultJeePageData
    } catch (error) {
        console.error("Error fetching jee data:", error)
        return defaultJeePageData
    }
}

export async function getNeetPageData(): Promise<NeetPageData> {
    try {
        const docRef = doc(db, "websiteContent", "neet")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultNeetPageData, ...docSnap.data() } as NeetPageData
        }
        return defaultNeetPageData
    } catch (error) {
        console.error("Error fetching neet data:", error)
        return defaultNeetPageData
    }
}

export async function getResultsPageData(): Promise<ResultsPageData> {
    try {
        const docRef = doc(db, "websiteContent", "results")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { ...defaultResultsPageData, ...docSnap.data() } as ResultsPageData
        }
        return defaultResultsPageData
    } catch (error) {
        console.error("Error fetching results data:", error)
        return defaultResultsPageData
    }
}

export async function getTestById(testId: string): Promise<TestData | null> {
    // Input validation
        console.log({testId})
    if (!testId || typeof testId !== 'string' || testId.trim() === '') {
        // throw new Error('Valid testId is required', testId);
        return null;
    }

    try {
        const testDocRef = doc(db, "tests", testId.trim());
        const testDoc = await getDoc(testDocRef);

        if (!testDoc.exists()) {
            return null;
        }
        console.log("successfull sending test data", testDoc.data());
        return {
            ...testDoc.data() as TestData,
            id: testId.trim(),
        };

    } catch (error) {
        console.error('Error fetching test:', error);
        throw error;
    }
}

// Utility functions for admin
export async function updateHomePageData(data: Partial<HomePageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "homepage")
        // await docRef.update(data)
        await updateDoc(docRef, data);
        await fetch("https://www.kkmishraclasses.com/api/revalidate");
    } catch (error) {
        console.error("Error updating homepage data:", error)
        throw error
    }
}

export async function updateContactPageData(data: Partial<ContactPageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "contact")
        // await docRef.update(data)
        await updateDoc(docRef, data);
        await fetch("https://www.kkmishraclasses.com/api/revalidate");
    } catch (error) {
        console.error("Error updating contact data:", error)
        throw error
    }
}

export async function updateResultsPageData(data: Partial<ResultsPageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "results");
        await updateDoc(docRef, data);
        await fetch("https://www.kkmishraclasses.com/api/revalidate");
    } catch (error) {
        console.error("Error updating results page data:", error);
        throw error;
    }
}

export async function updateJeePageData(data: Partial<JeePageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "jee");
        await updateDoc(docRef, data);
        await fetch("https://www.kkmishraclasses.com/api/revalidate");
    } catch (error) {
        console.error("Error updating JEE page data:", error);
        throw error;
    }
}

export async function updateNeetPageData(data: Partial<NeetPageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "neet");
        await updateDoc(docRef, data);
        await fetch("https://www.kkmishraclasses.com/api/revalidate");
    } catch (error) {
        console.error("Error updating NEET page data:", error);
        throw error;
    }
}

export async function updateMediaPageData(data: Partial<MediaPageData>): Promise<void> {
    try {
        const docRef = doc(db, "websiteContent", "media")
        await setDoc(docRef, data, { merge: true })
        await fetch("https://www.kkmishraclasses.com/api/revalidate")
    } catch (error) {
        console.error("Error updating media data:", error)
        throw error
    }
}
