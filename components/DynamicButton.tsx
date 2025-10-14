"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface DynamicButtonProps {
    href: string
    className: string
    primaryColor: string
    secondaryColor: string
    children: ReactNode
    variant?: 'gradient' | 'outline'
}

export function DynamicButton({ 
    href, 
    className, 
    primaryColor, 
    secondaryColor, 
    children,
    variant = 'gradient'
}: DynamicButtonProps) {
    const gradientStyle = {
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        boxShadow: `0 4px 15px ${primaryColor}30`
    };

    const outlineStyle = {
        borderColor: primaryColor,
        color: primaryColor
    };

    return (
        <Link
            href={href}
            className={className}
            style={variant === 'gradient' ? gradientStyle : outlineStyle}
            onMouseEnter={(e) => {
                if (variant === 'gradient') {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor}dd 0%, ${secondaryColor}dd 100%)`;
                } else {
                    e.currentTarget.style.backgroundColor = primaryColor;
                    e.currentTarget.style.color = 'white';
                }
            }}
            onMouseLeave={(e) => {
                if (variant === 'gradient') {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = primaryColor;
                }
            }}
        >
            {children}
        </Link>
    );
}
