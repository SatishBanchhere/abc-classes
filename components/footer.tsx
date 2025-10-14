import { Trophy } from "lucide-react"
import Link from "next/link";

interface FooterProps {
  siteName: string
  footerDescription: string
  // quickLinks: string[]
  programs: string[]
  contactPhone: string
  contactEmail: string
  contactAddress: string
  copyrightText: string
}

export default function Footer({
  siteName,
  footerDescription,
  // quickLinks,
  programs,
  contactPhone,
  contactEmail,
  contactAddress,
  copyrightText,
}: FooterProps) {
  return (
    <footer className="py-16 px-6 bg-slate-900 text-white relative z-10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="h-8 w-8 text-[#1a73e8]" />
              <span className="text-xl font-bold">{siteName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed">{footerDescription}</p>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-lg">Quick Links</h3>
            <div className="space-y-3 text-slate-400">
              <div className="space-y-2">
                <Link href="/jee" className="hover:text-white cursor-pointer transition-colors block">JEE</Link>
                <Link href="/neet" className="hover:text-white cursor-pointer transition-colors block">NEET</Link>
                <Link href="/results" className="hover:text-white cursor-pointer transition-colors block">RESULT</Link>
                <Link href="/contact" className="hover:text-white cursor-pointer transition-colors block">CONTACT</Link>
                <Link href="/media" className="hover:text-white cursor-pointer transition-colors block">MEDIA</Link>
              </div>

            </div>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-lg">Programs</h3>
            <div className="space-y-3 text-slate-400">
              {programs?.map((program, index) => (
                <div key={index} className="hover:text-white cursor-pointer transition-colors">
                  {program}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-lg">Contact</h3>
            <div className="space-y-3 text-slate-400">
              <div>{contactPhone}</div>
              <div>{contactEmail}</div>
              <div>{contactAddress}</div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  )
}
