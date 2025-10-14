"use client"

import { Button } from "@/components/ui/button"
import { Target, ArrowRight } from "lucide-react"
import Link from "next/link"

interface ContactButtonProps {
    primaryColor: string
    accentColor: string
}

export function ContactButton({ primaryColor, accentColor }: ContactButtonProps) {
    return (
        <Link href="/contact">
            <Button
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group text-sm sm:text-base"
                style={{
                    backgroundColor: 'white',
                    color: primaryColor,
                    border: `2px solid white`
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = accentColor;
                    e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = primaryColor;
                }}
            >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse"/>
                Get Started Today
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
            </Button>
        </Link>
    );
}
