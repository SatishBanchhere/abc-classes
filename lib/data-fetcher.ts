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
    pageDescription: "Watch our exclusive interviews, student testimonials, and media coverage showcasing our achievements and success stories.",
    heroImage: "/images/media/hero.jpg",

    mediaVideos: [
        {
            url: "https://www.youtube.com/watch?v=example1",
            title: "Exclusive Interview - Education Excellence",
            description: "Our founder discusses innovative teaching methods and student success strategies.",
            category: "interview",
            date: "2024-01-15",
            featured: true
        },
    ],

    seoTitle: "Media & Interviews - KK Mishra Classes",
    seoDescription: "Watch exclusive interviews, student testimonials and media coverage of KK Mishra Classes achievements.",
    seoKeywords: "KK Mishra interviews, student testimonials, JEE success stories, NEET coaching media"
}

// Default data with comprehensive fallbacks
const defaultHomePageData: HomePageData = {
    siteName: "KK Mishra Classes",
    siteTagline: "Excellence in Education",
    logoUrl: "",
    heroTitle: "Master JEE, NEET & MHTCET with Excellence & Innovation",
    heroSubtitle: "India's Leading JEE, NEET & MHTCET Coaching Institute",
    heroDescription: "Join thousands of successful students who cracked JEE, NEET & MHTCET with our expert guidance, comprehensive study material, and cutting-edge online testing platform.",
    heroImage: "",
    heroButtonText: "Start Your Journey",
    heroSecondaryButtonText: "Watch Demo",

    advertisement: {
        enabled: true,
        title: "🎯 Special Admission Open!",
        subtitle: "Limited Seats Available",
        description: "Get 20% off on all JEE, NEET & MHTCET courses. Expert faculty, comprehensive study material, and guaranteed results!",
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
    studentsCountText: "Students Count",
    iitSelectionsText: "IIT Selections",
    neetSelectionsText: "NEET Selections",
    mhtcetSelectionsText: "MHTCET Selections",
    iiserniserSelectionsText: "IISER/NISER Selections",

    galleryImages: [],
    youtubeVideos: [],

    features: [
        {
            title: "Expert Faculty",
            description: "Learn from IIT alumni and experienced teachers with proven track records in JEE, NEET & MHTCET coaching and years of expertise",
            icon: "BookOpen",
            color: "#3b82f6"
        },
        {
            title: "Advanced Testing Platform",
            description: "Practice with our state-of-the-art online testing system that perfectly mimics the actual JEE, NEET & MHTCET exam environment",
            icon: "Users",
            color: "#10b981"
        },
        {
            title: "Personalized Analytics",
            description: "Get detailed performance analysis and personalized study recommendations based on your strengths and weaknesses",
            icon: "Award",
            color: "#f59e0b"
        },
    ],

    testimonials: [
        {
            name: "Rahul Sharma",
            college: "IIT Delhi, CSE",
            rating: 5,
            review: "KK Mishra Classes helped me crack JEE Advanced with AIR 247. The online tests were exactly like the real exam and the analytics helped me improve systematically!",
            avatar: "",
        },
        {
            name: "Priya Patel",
            college: "IIT Bombay, EE",
            rating: 5,
            review: "The personalized analytics helped me identify my weak areas and improve systematically. The faculty support was exceptional throughout my journey.",
            avatar: "",
        },
        {
            name: "Arjun Singh",
            college: "IIT Kanpur, ME",
            rating: 5,
            review: "Best coaching institute! The faculty is amazing and the test series is comprehensive. The study material quality is unmatched.",
            avatar: "",
        },
    ],

    footerDescription: "Leading JEE, NEET & MHTCET coaching institute with 15+ years of excellence in IIT, medical college and engineering preparation with proven student success.",
    quickLinks: [
        { title: "About Us", url: "/about" },
        { title: "Courses", url: "/courses" },
        { title: "Results", url: "/results" },
        { title: "Contact", url: "/contact" }
    ],
    // programs: [
    //     { title: "JEE Main", description: "Comprehensive JEE Main preparation", url: "/jee" },
    //     { title: "JEE Advanced", description: "Advanced level JEE preparation", url: "/jee" },
    //     { title: "NEET", description: "Complete NEET preparation", url: "/neet" },
    //     { title: "Foundation", description: "Foundation courses for 9th-10th", url: "/foundation" }
    // ],
    programs: [
        "JEE Main",
        "JEE Advanced",
        "NEET",
        "Foundation"
    ],


    contactPhone: "+91 97362 13312",
    contactEmail: "support@kkmishraclasses.com",
    contactAddress: "Nagpur, Maharashtra, India",
    socialLinks: {
        twitter: "#",
        facebook: "#",
        instagram: "#",
        youtube: "#",
        linkedin: "#"
    },

    seoTitle: "KK Mishra Classes - Best JEE & NEET Coaching Institute",
    seoDescription: "Leading JEE, NEET, MHTCET & IISER coaching institute with expert faculty, comprehensive study material, and proven results.",
    seoKeywords: "JEE coaching, NEET coaching, MHTCET coaching, IISER NISER preparation, IIT preparation, medical entrance, engineering entrance",

    primaryColor: "#1a73e8",
    secondaryColor: "#4285f4",
    accentColor: "#34a853",

    copyrightText: "© 2025 KK Mishra Classes. All rights reserved.",
}

// Similar comprehensive defaults for other interfaces...
const defaultContactPageData: ContactPageData = {
    pageTitle: "Contact Us",
    pageDescription: "K.K.MISHRA CLASSES is providing Coaching for the preparation of the NEET/IIT- JEE & Civil Services Entrance Examination.",
    heroImage: "",
    officeTitle: "Office Address",
    officeAddress: "94, Bajaj Nagar, Near CIIMS Hospital, Nagpur - Nagpur 440010",
    officeImage: "",
    contactTitle: "Contact Details",
    contactNumbers: ["9736213312", "7249175414"],
    contactEmails: ["kkmishraclasses@gmail.com", "kamleshkmishra2018@gmail.com"],
    mapEmbedUrl: "",
    mapTitle: "Find Us Here",
    workingHours: [
        { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
        { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
        { day: "Sunday", hours: "Closed" }
    ],
    additionalInfo: "Any Questions or Query? Feel Free To Get In Touch. For NEET/IIT-JEE/UPSE",
    formTitle: "Get In Touch",
    formDescription: "Send us a message and we'll get back to you as soon as possible.",
    seoTitle: "Contact KK Mishra Classes - Best JEE NEET Coaching",
    seoDescription: "Contact KK Mishra Classes for JEE and NEET coaching inquiries. Located in Nagpur with expert faculty."
}

const defaultJeePageData: JeePageData = {
    pageTitle: "JEE",
    pageSubtitle: "Learn Physics, Chemistry & Math From Experts",
    pageDescription:
        "We provide coaching for Physics, Chemistry, and Mathematics tailored for IIT-JEE aspirants. Our approach blends NCERT-focused teaching with competitive preparation to ensure success.",
    heroImage: "/images/jee/hero.jpg",

    // Physics Section
    physicsTitle: "Physics",
    physicsDescription:
        "We prepare students to crack IIT-JEE/CBSE/STATE Physics. We have highly qualified and experienced physics faculties with us. We follow the complete NCERT Oriented Teaching with Competitive approach. We also provide one-to-one interaction of students and faculty for better understanding.",
    physicsImage: "/images/jee/physics.jpg",
    // physicsFeatures: [
    //     {
    //         title: "NCERT Oriented Teaching",
    //         description: "Strictly aligned with NCERT curriculum for strong foundational clarity.",
    //         icon: "book",
    //     },
    //     {
    //         title: "Competitive Approach",
    //         description: "Focused problem-solving strategies to crack JEE level questions.",
    //         icon: "target",
    //     },
    //     {
    //         title: "One-to-One Interaction",
    //         description: "Personalized doubt-solving sessions with expert faculty.",
    //         icon: "user-check",
    //     },
    //     {
    //         title: "Experienced Faculty",
    //         description: "Highly qualified instructors with a proven track record in Physics.",
    //         icon: "user-graduate",
    //     },
    //     {
    //         title: "Timely Syllabus Completion",
    //         description: "Well-structured plans to complete the syllabus ahead of time.",
    //         icon: "calendar-check",
    //     },
    // ],

    physicsFeatures: [
        "NCERT Oriented Teaching",
        "Competitive Approach",
        "One-to-One Interaction",
        "Experienced Faculty",
        "Timely Syllabus Completion"
    ],


    // Chemistry Section
    chemistryTitle: "Chemistry",
    chemistryDescription:
        "We prepare students to crack IIT-JEE Chemistry and follow the complete NCERT Oriented Teaching with a Competitive approach. Our expert faculty ensures deep conceptual understanding and rigorous practice.",
    chemistryImage: "/images/jee/chemistry.jpg",
    // chemistryFeatures: [
    //     {
    //         title: "NCERT Oriented Teaching",
    //         description: "Focus on fundamental concepts from NCERT for a strong base.",
    //         icon: "book-open",
    //     },
    //     {
    //         title: "Competitive Approach",
    //         description: "Advanced-level problem-solving to tackle JEE Chemistry.",
    //         icon: "flask-round",
    //     },
    //     {
    //         title: "Individual Doubt Sessions",
    //         description: "Dedicated time for personalized doubt-solving.",
    //         icon: "help-circle",
    //     },
    //     {
    //         title: "Experienced Faculty",
    //         description: "Faculty with extensive experience in JEE Chemistry preparation.",
    //         icon: "user-graduate",
    //     },
    //     {
    //         title: "Extensive Practice",
    //         description: "Regular assignments and test series for better retention.",
    //         icon: "pencil-ruler",
    //     },
    // ],
    chemistryFeatures: [
        "NCERT Oriented Teaching",
        "Competitive Approach",
        "Individual Doubt Sessions",
        "Experienced Faculty",
        "Extensive Practice"
    ],


    // Mathematics Section
    mathematicsTitle: "Mathematics",
    mathematicsDescription:
        "Our Mathematics classes ensure conceptual clarity and rigorous practice. We follow a blend of NCERT basics and advanced JEE-level problem-solving to help students excel.",
    mathematicsImage: "/images/jee/mathematics.jpg",
    // mathematicsFeatures: [
    //     {
    //         title: "Conceptual Clarity",
    //         description: "Focus on building core mathematical concepts step-by-step.",
    //         icon: "brain",
    //     },
    //     {
    //         title: "NCERT + Advanced Problems",
    //         description: "Combination of theory and challenging problem sets.",
    //         icon: "layers",
    //     },
    //     {
    //         title: "Regular Doubt Sessions",
    //         description: "Clear doubts with personalized attention from faculty.",
    //         icon: "message-circle",
    //     },
    //     {
    //         title: "Mock Tests & Quizzes",
    //         description: "Simulated exams to evaluate and boost performance.",
    //         icon: "clipboard-list",
    //     },
    //     {
    //         title: "Topic-wise Practice Sheets",
    //         description: "Tailored sheets for mastering each topic effectively.",
    //         icon: "file-text",
    //     },
    // ],

    mathematicsFeatures: [
        "Conceptual Clarity",
        "NCERT + Advanced Problems",
        "Regular Doubt Sessions",
        "Mock Tests & Quizzes",
        "Topic-wise Practice Sheets"
    ],

    // Additional Info
    additionalInfo:
        "We provide excellent study materials, detailed test discussions, and doubt-clearing sessions. Our focus is on timely syllabus completion with limited batch size to ensure personalized attention.",
    ctaText: "WE ALSO PROVIDE INDIVIDUAL CLASSES FOR PHYSICS, CHEMISTRY & MATHS.",
    ctaButtonText: "Join Now",

    // Course Details
    courseDetails: [
        {
            title: "1-Year JEE Course",
            duration: "12 Months",
            description: "For students in 12th or repeating, full syllabus coverage.",
            features: [
                "Complete Physics, Chemistry & Math",
                "Regular Tests & Assignments",
                "Doubt Sessions",
                "Study Materials & Practice Sheets",
            ],
            price: "₹60,000",
        },
        {
            title: "2-Year Foundation Course",
            duration: "24 Months",
            description: "For 10th pass students aiming for JEE 2 years later.",
            features: [
                "Comprehensive Coverage",
                "NCERT + Competitive Preparation",
                "Periodic Evaluation",
                "Mentorship & Career Guidance",
            ],
            price: "₹1,10,000",
        },
    ],

    // SEO
    seoTitle: "Best JEE Coaching in Nagpur | Physics Chemistry Math Classes",
    seoDescription:
        "Get the best JEE preparation in Nagpur with expert faculty for Physics, Chemistry & Math. Limited Seats. Book a free counseling session today.",
}

const defaultNeetPageData: NeetPageData = {
    pageTitle: "NEET",
    pageSubtitle: "Learn Physics, Chemistry & Biology From Experts",
    pageDescription:
        "We provide coaching for NEET aspirants in Physics, Chemistry, and Biology with an NCERT-oriented and competitive approach. Personalized mentorship and experienced faculty make us a top choice for NEET preparation.",
    heroImage: "/images/neet/hero.jpg",

    // Physics Section
    physicsTitle: "Physics",
    physicsDescription:
        "We prepare students to crack NEET Physics. We have highly qualified and experienced physics faculties with us. We follow the complete NCERT Oriented Teaching with Competitive approach. We also provide one-to-one interaction of students and faculty for better students' understanding.",
    physicsImage: "/images/neet/physics.jpg",
    // physicsFeatures: [
    //     {
    //         title: "NCERT Oriented Teaching",
    //         description: "All topics are covered from the NCERT perspective, essential for NEET.",
    //         icon: "book",
    //     },
    //     {
    //         title: "Competitive Approach",
    //         description: "Problem-solving methods tailored for NEET Physics MCQs.",
    //         icon: "target",
    //     },
    //     {
    //         title: "One-to-One Interaction",
    //         description: "Personalized guidance and doubt-clearing sessions.",
    //         icon: "user-check",
    //     },
    //     {
    //         title: "Experienced Faculty",
    //         description: "Instructors with a proven record of NEET success.",
    //         icon: "user-graduate",
    //     },
    //     {
    //         title: "NEET Focused Curriculum",
    //         description: "Special attention on high-weightage NEET Physics topics.",
    //         icon: "flask-conical",
    //     },
    // ],
    physicsFeatures: [
        "NCERT Oriented Teaching",
        "Competitive Approach",
        "One-to-One Interaction",
        "Experienced Faculty",
        "NEET Focused Curriculum"
    ],


    // Chemistry Section
    chemistryTitle: "Chemistry",
    chemistryDescription:
        "We prepare students to crack NEET Chemistry and follow the complete NCERT Oriented Teaching with Competitive approach. We have highly qualified & experienced faculties which aim to clear students NEET Chemistry's fundamentals and practice extensively.",
    chemistryImage: "/images/neet/chemistry.jpg",
    // chemistryFeatures: [
    //     {
    //         title: "NCERT Oriented Teaching",
    //         description: "Precise explanation of all NCERT Chemistry chapters.",
    //         icon: "book-open",
    //     },
    //     {
    //         title: "Competitive Approach",
    //         description: "MCQ training with real NEET patterns.",
    //         icon: "target",
    //     },
    //     {
    //         title: "Individual Doubt Sessions",
    //         description: "Personalized assistance for better concept retention.",
    //         icon: "help-circle",
    //     },
    //     {
    //         title: "Experienced Faculty",
    //         description: "Top-notch faculty guiding NEET aspirants for years.",
    //         icon: "user-graduate",
    //     },
    //     {
    //         title: "NEET Specific Practice",
    //         description: "Focused worksheets and revision plans for NEET Chemistry.",
    //         icon: "clipboard-list",
    //     },
    // ],
    chemistryFeatures: [
        "NCERT Oriented Teaching",
        "Competitive Approach",
        "Individual Doubt Sessions",
        "Experienced Faculty",
        "NEET Specific Practice"
    ],


    // Biology Section
    biologyTitle: "Biology",
    biologyDescription:
        "Biology is the key to scoring high in NEET. We offer detailed and thorough NCERT-based Biology classes with daily practice and regular revisions to help students master the subject.",
    biologyImage: "/images/neet/biology.jpg",
    // biologyFeatures: [
    //     {
    //         title: "NCERT Line-by-Line Coverage",
    //         description: "Every NCERT line is taught, explained, and revised thoroughly.",
    //         icon: "book-check",
    //     },
    //     {
    //         title: "Conceptual Clarity",
    //         description: "In-depth explanations to ensure complete understanding of concepts.",
    //         icon: "brain",
    //     },
    //     {
    //         title: "Diagrams & Flowcharts",
    //         description: "Visual tools to simplify and retain Biology concepts.",
    //         icon: "image",
    //     },
    //     {
    //         title: "Daily Practice Questions",
    //         description: "Topic-wise MCQs to improve accuracy and speed.",
    //         icon: "pencil-ruler",
    //     },
    //     {
    //         title: "Previous Year Analysis",
    //         description: "Strategic preparation with focus on past NEET trends.",
    //         icon: "bar-chart-2",
    //     },
    // ],
    biologyFeatures: [
        "NCERT Line-by-Line Coverage",
        "Conceptual Clarity",
        "Diagrams & Flowcharts",
        "Daily Practice Questions",
        "Previous Year Analysis"
    ],

    // Additional Info
    additionalInfo:
        "The excellent study material is provided to students with regular test series and in-depth discussions. We are recognized for timely syllabus completion and for being the best NEET coaching center in Nagpur. Limited Seats Available.",
    ctaText: "WE ALSO PROVIDE INDIVIDUAL CLASSES FOR PHYSICS, CHEMISTRY & BIOLOGY.",
    ctaButtonText: "Join Now",

    // Course Details
    courseDetails: [
        {
            title: "1-Year NEET Course",
            duration: "12 Months",
            description: "Ideal for students currently in 12th or drop year. Covers full NEET syllabus.",
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
            description: "For students entering 11th. Builds a solid foundation with NEET focus.",
            features: [
                "Structured Learning Plan",
                "Doubt Sessions & Counseling",
                "All India Test Series",
                "Printed Notes & Assignments",
            ],
            price: "₹95,000",
        },
    ],

    // SEO
    seoTitle: "Best NEET Coaching in Nagpur | Physics Chemistry Biology Classes",
    seoDescription:
        "Crack NEET with expert guidance in Physics, Chemistry & Biology. Top NEET coaching classes in Nagpur. Enroll now for focused and result-driven learning.",
}

const defaultResultsPageData: ResultsPageData = {
    pageTitle: "Our Shining Stars",
    pageDescription: "Heartfelt Congratulations To Our Geniuses Of The Year 2019",
    heroImage: "/images/results/hero.jpg",

    // Current Year
    currentYearTitle: "2024 Achievements",
    currentYearDescription:
        "Congratulations to our outstanding students who achieved remarkable success in JEE and NEET 2024",

    // Achievement Images
    achievementImages: [
        {
            url: "/images/results/atharva.jpg",
            alt: "Atharva Tade receiving award",
            caption: "Atharva Tade - AIR 150 in JEE Advanced 2024",
        },
        {
            url: "/images/results/hrithuja.jpg",
            alt: "Hrithuja Mallu after NEET success",
            caption: "Hrithuja Mallu - AIR 200 in NEET 2024",
        },
        {
            url: "/images/results/rushikesh.jpg",
            alt: "Rushikesh at Olympiad ceremony",
            caption: "Rushikesh - State Rank 5 in Chemistry Olympiad",
        },
    ],

    // Toppers (2024)
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

    // Previous Years
    previousYears: [
        {
            year: "2023",
            description: "Heartfelt Congratulations to our JEE/NEET Best Performers of the year",
            toppers: [
                {
                    name: "Rajesh Rathore",
                    achievement: "JEE Advanced",
                    rank: "AIR 245",
                    college: "IIT Delhi",
                },
                {
                    name: "Abhishekam Tripathi",
                    achievement: "JEE Mains",
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

    // Testimonial Images
    testimonialImages: [
        {
            url: "/images/testimonials/student1.jpg",
            alt: "Student testimonial photo",
            caption: "The guidance and mentorship were phenomenal throughout my journey.",
        },
        {
            url: "/images/testimonials/student2.jpg",
            alt: "Student feedback photo",
            caption: "Personal doubt clearing sessions really helped me improve.",
        },
    ],

    // Statistics
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

    // SEO
    seoTitle: "Best JEE & NEET Results | Toppers From Nagpur",
    seoDescription:
        "Meet our star performers from JEE, NEET & Olympiads. Our coaching center in Nagpur consistently delivers top ranks and national-level achievements.",
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
