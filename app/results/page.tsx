import {Trophy, Award, Star, Sparkles, Loader2} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {getResultsPageData, getHomePageData} from "@/lib/data-fetcher"

export default async function ResultsPage() {

    const homeData = await getHomePageData();

    const resultsData = await getResultsPageData();
  // const [resultsData, setResultsData] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [homeData, setHomeData] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getHomePageData();
  //       // @ts-ignore
  //       setHomeData(data);
  //       const data2 = await getResultsPageData();
  //       // @ts-ignore
  //       setResultsData(data2);
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
        <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-yellow-50/50 to-orange-50/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f59e0b' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Success Stories</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {resultsData.pageTitle}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              {resultsData.pageDescription}
            </p>
          </div>
        </section>

        {/* Achievement Images */}
        {resultsData.achievementImages && resultsData.achievementImages.length > 0 && (
          <section className="py-24 px-6 bg-white relative z-10">
            <div className="container mx-auto">
              <div className="text-center mb-20">
                <Badge className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 border-yellow-500/20">
                  {resultsData.currentYearTitle}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Achievement Gallery</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">{resultsData.currentYearDescription}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resultsData.achievementImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Achievement ${index + 1}`}
                      width={400}
                      height={500}
                      className="rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Current Year Toppers */}
        <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-yellow-50/30 relative z-10">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <Badge className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 border-yellow-500/20">
                Top Performers
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Star Students</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Meet the brilliant minds who achieved excellence with our guidance
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {resultsData.toppers.map((topper, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50"
                >
                  <CardHeader className="pb-4 text-center">
                    <div className="relative mx-auto mb-6">
                      {topper.image ? (
                        <Image
                          src={topper.image || "/placeholder.svg"}
                          alt={topper.name}
                          width={100}
                          height={100}
                          className="rounded-full shadow-lg"
                        />
                      ) : (
                        <div className="h-24 w-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-2xl">
                            {topper.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{topper.name}</CardTitle>
                    <CardDescription className="text-yellow-600 font-semibold">{topper.rank}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-700 border-yellow-500/20">
                      {topper.achievement}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Previous Years */}
        {resultsData.previousYears && resultsData.previousYears.length > 0 && (
          <section className="py-24 px-6 bg-white relative z-10">
            <div className="container mx-auto">
              <div className="text-center mb-20">
                <Badge className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 border-yellow-500/20">
                  Previous Years
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Legacy of Excellence</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Years of consistent success and outstanding results
                </p>
              </div>
              <div className="space-y-12">
                {resultsData.previousYears.map((year, index) => (
                  <Card key={index} className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-slate-900">{year.year}</CardTitle>
                          <CardDescription className="text-slate-600">{year.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        {year.toppers.map((topper, topperIndex) => (
                          <div
                            key={topperIndex}
                            className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50"
                          >
                            <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Star className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{topper.name}</div>
                              <div className="text-sm text-slate-600">{topper.achievement}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-yellow-600 to-orange-600 text-white relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fillRule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fillOpacity=\\'0.05\\'%3E%3Ccircle cx=\\'30\\' cy=\\'30\\' r=\\'2\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Be the Next Success Story</h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join our legacy of excellence and achieve your dreams with expert guidance and proven methodology
            </p>
            <div className="flex items-center justify-center gap-4">
              <Trophy className="h-8 w-8" />
              <span className="text-2xl font-semibold">Your Success Awaits!</span>
            </div>
          </div>
        </section>

        <Footer
          siteName={homeData.siteName}
          footerDescription={homeData.footerDescription}
          quickLinks={homeData.quickLinks}
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
