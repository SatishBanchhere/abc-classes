// "use client"
import {MapPin, Phone, Mail, Clock, MessageCircle, Loader2} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getContactPageData, getHomePageData } from "@/lib/data-fetcher"
import React, {useEffect, useState} from "react";

export default async function ContactPage() {
  const homeData = await getHomePageData();
  const contactData = await getContactPageData();
  console.log({contactData});
  console.log(contactData.workingHours);
  // const [contactData, setContactData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [homeData, setHomeData] = useState(null);
  //
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getHomePageData();
  //       // @ts-ignore
  //       setHomeData(data);
  //       const data2 = await getContactPageData();
  //       // @ts-ignore
  //       setContactData(data2);
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
  if (!homeData) return <div>Error loading data</div>;
  return (
    <>
      <div className="flex min-h-screen w-full flex-col relative overflow-hidden">
        <Header siteName={homeData.siteName} siteTagline={homeData.siteTagline} logoUrl={homeData.logoUrl} />

        {/* Hero Section */}
        <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%231a73e8' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          <div className="container mx-auto text-center relative z-10">
            <Badge className="mb-6 bg-gradient-to-r from-[#1a73e8]/10 to-[#4285f4]/10 text-[#1a73e8] border-[#1a73e8]/20">
              Get In Touch
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              {contactData.pageTitle}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {contactData.pageDescription}
            </p>
            <div className="text-center mb-8">
              <p className="text-lg text-slate-600 mb-4">{contactData.additionalInfo}</p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-24 px-6 bg-white relative z-10">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Office Address */}
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#1a73e8] to-[#4285f4] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{contactData.officeTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {contactData.officeAddress}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Contact Numbers */}
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Phone className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{contactData.contactTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contactData.contactNumbers.map((number, index) => (
                      <div key={index} className="text-base text-slate-600">
                        <a href={`tel:${number}`} className="hover:text-[#1a73e8] transition-colors">
                          {number}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Email Addresses */}
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50">
                <CardHeader className="pb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Email Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contactData.contactEmails.map((email, index) => (
                      <div key={index} className="text-base text-slate-600">
                        <a href={`mailto:${email}`} className="hover:text-[#1a73e8] transition-colors">
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Working Hours */}
            <div className="text-center">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-[#1a73e8]/5 to-[#4285f4]/5 max-w-md mx-auto">
                <CardHeader className="pb-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Working Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {contactData.workingHours.map((item, index) => (
                        <div key={index}>
                          {item.day}: {item.hours}
                        </div>
                    ))}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-[#1a73e8] to-[#4285f4] text-white relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fillRule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fillOpacity=\\'0.05\\'%3E%3Ccircle cx=\\'30\\' cy=\\'30\\' r=\\'2\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Contact us today to learn more about our courses and how we can help you achieve your dreams
            </p>
            <div className="flex items-center justify-center gap-4">
              <MessageCircle className="h-8 w-8" />
              <span className="text-2xl font-semibold">Let's Connect!</span>
            </div>
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
