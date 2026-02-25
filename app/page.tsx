import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, BarChart3, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function Index() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  const userCookie = cookieStore.get('uinf');
  const isAuthenticated = !!(sessionCookie && userCookie);
  
  // Determine button text and link based on authentication
  const buttonText = isAuthenticated ? "View Dashboard" : "Sign In";
  const buttonLink = isAuthenticated ? "/admin" : "/signin";
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fluid Background Animation */}
      {/* <div className="fluid-bg" /> */}
      <div className="fluid-bg" style={{ animationDelay: "-10s", opacity: 0.4 }} />
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 text-center">
          <div className="max-w-7xl mx-auto">
            <div className="float-animation">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
                Council on East Asian Libraries
                <span className="text-primary block">Statistics Database</span>
              </h1>
            </div>

            <p className="text-xl text-muted-foreground my-12 max-w-2xl mx-auto text-pretty">
              The primary and consistently maintained statistical resource on East Asian collections across North
              America
            </p>

            {/* Decorative Line */}
            <div className="container mx-auto px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-stone-600 mb-2">1999</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Founded</div>
              </Card>

              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-stone-600 mb-2">39</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Institutions</div>
              </Card>

              <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-stone-600 mb-2">36M</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Holdings</div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center my-20">
              <Button asChild size="lg" className="group">
                <Link href={buttonLink}>
                  {buttonText}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/searchingdatabase">
                  <BookOpen className="mr-2 w-4 h-4" />
                  Searching Database
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="https://www.eastasianlib.org/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 w-4 h-4" />
                  CEAL Main Website
                </Link>
              </Button>
            </div>

            {/* Info Text */}
            <div className="text-sm text-muted-foreground mb-8">
              <p className="mb-2">
                For new users of this database, please click the{" "}
                <Link href="/help" className="">Help</Link> button for more information.
              </p>
              <p>
                Certain data, such as tables with derived statistical data,
                can only be accessed by members. Please{" "}
                <Link href="/help" className="">contact us</Link> for information about
                membership.
              </p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        {/* <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Key Statistics</h2>
            <p className="text-lg text-muted-foreground">Comprehensive data on East Asian library collections</p>
          </div>
        </section> */}

        {/* Content Sections */}
        <section id="content-section" className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <BarChart3 className="w-6 h-6 text-accent" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            {/* History */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">History</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CEAL began publishing statistical data in 1957, with annual reports appearing in the Journal of East
                Asian Libraries (JEAL) since the late 1980s. The online database was launched in 1999, with earlier data
                (pre-1999) added in 2007. It includes statistics dating back as far as 1869 and continues to be
                published annually in parallel with the February issue of JEAL.
              </p>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
            </div>

            {/* Scope and Significance */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Scope and Significance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The CEAL Statistics Database aligns with the scope of the Association of Research Libraries (ARL)
                statistics, and focuses specifically on East Asian libraries and collections. It features data related
                to Chinese, Japanese, and Korean studies, categorized according to library type (public or private),
                geographic region, and other relevant criteria. The database captures trends in the development of East
                Asian studies libraries and collections across North America and provides valuable insights for
                benchmarking, strategic planning, and advocacy in East Asian librarianship.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
