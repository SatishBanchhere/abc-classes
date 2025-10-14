
import {BookOpen, Users, CheckCircle, Sparkles, Loader2} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getNeetPageData, getHomePageData } from "@/lib/data-fetcher"
import {useEffect, useState} from "react";
import Link from "next/link"

export default async function NeetPage() {

  const homeData = await getHomePageData();
  const neetData = await getNeetPageData();
  // const [neetData, setNeetData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [homeData, setHomeData] = useState(null);
  //
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getHomePageData();
  //       // @ts-ignore
  //       setHomeData(data);
  //       const data2 = await getNeetPageData();
  //       // @ts-ignore
  //       setNeetData(data2);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   fetchData();
  // }, []);
  //
  //
  // if (loading) {
  //   return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <Loader2 className="h-8 w-8 animate-spin"/>
  //       </div>
  //   )
  // }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col relative overflow-hidden">
        <Header siteName={homeData.siteName} siteTagline={homeData.siteTagline} logoUrl={homeData.logoUrl} />

        {/* Hero Section */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-green-50/50 to-emerald-50/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%2310b981' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">{neetData.pageSubtitle}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {neetData.pageTitle}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {neetData.pageDescription}
            </p>
          </div>
        </section>

        {/* Physics & Chemistry Sections */}
        <section className="py-24 px-6 bg-white relative z-10">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Physics Section */}
              <div>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 h-full">
                  <CardHeader className="pb-6">
                    <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 mb-4">{neetData.physicsTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <CardDescription className="text-base text-slate-600 leading-relaxed">
                      {neetData.physicsDescription}
                    </CardDescription>

                    <div className="space-y-3">
                      {neetData.physicsFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chemistry Section */}
              <div>
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 h-full">
                  <CardHeader className="pb-6">
                    <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-slate-900 mb-4">{neetData.chemistryTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <CardDescription className="text-base text-slate-600 leading-relaxed">
                      {neetData.chemistryDescription}
                    </CardDescription>

                    <div className="space-y-3">
                      {neetData.chemistryFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-green-50/30 relative z-10">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 border-green-500/20">
                Why Choose Our NEET Program
              </Badge>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">{neetData.additionalInfo}</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-green-600 to-emerald-600 text-white relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fillRule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fillOpacity=\\'0.05\\'%3E%3Ccircle cx=\\'30\\' cy=\\'30\\' r=\\'2\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Excel in NEET?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">{neetData.ctaText}</p>
            <Link
                href="/auth/register"
                className="inline-flex items-center justify-center text-lg px-10 py-4 bg-white text-green-600 hover:bg-slate-100 shadow-xl font-medium rounded-md transition-colors duration-300"
            >
              Enroll Now
            </Link>
          </div>
        </section>

        <Footer
          siteName={homeData.siteName}
          footerDescription={homeData.footerDescription}
          // quickLinks={homeData.quickLinks}
          programs={homeData.programs}
          contactPhone={homeData.contactPhone}
          contactEmail={homeData.contactEmail}
          contactAddress={homeData.contactAddress}
          copyrightText={homeData.copyrightText}
        />
      </div>
    </>
  )
}
