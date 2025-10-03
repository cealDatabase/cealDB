"use client";

import { Container } from "@/components/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Table, BarChart3, FileText, Building2, Info } from "lucide-react";
import Link from "next/link";

export default function SearchingDatabasePage() {
  const searchOptions = [
    {
      title: "Quick View",
      description: "Quick view of statistics for all institutions with total materials held",
      icon: Database,
      href: "/libraries",
    },
    {
      title: "Table View (Basic)",
      description: "Search with year(s) and fields available in individual tables",
      icon: Table,
      href: "/statistics/table-basic",
    },
    {
      title: "Table View (Advanced)",
      description: "Search with year(s) and libraries, view data in customizable tables",
      icon: Table,
      href: "/statistics/table-advanced",
    },
    {
      title: "Graph View (Basic)",
      description: "Search and view data available as graphs",
      icon: BarChart3,
      href: "/statistics/graph-basic",
    },
    {
      title: "Graph View (Advanced)",
      description: "Search and view data as customizable graphs",
      icon: BarChart3,
      href: "/statistics/graph-advanced",
    },
    {
      title: "PDF",
      description: "View published data in PDF format",
      icon: FileText,
      href: "/statistics/pdf",
    },
    {
      title: "Participating Libraries",
      description: "List of CEAL participants with forms submitted, sorted by year",
      icon: Building2,
      href: "/libraries",
    },
    {
      title: "Library Information",
      description: "View information of CEAL participants",
      icon: Info,
      href: "/libraries",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <h1>Searching the Database</h1>
      
      <Container className="py-8">
        <div className="space-y-6">
          {/* Page Description */}
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground">
              Access and explore CEAL statistics through various views and formats
            </p>
          </div>

          {/* Search Options Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {searchOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link 
                  key={option.title} 
                  href={option.href} 
                  className="group block transition-all hover:scale-[1.02] no-underline"
                >
                  <Card className="h-full border-border bg-card hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted p-3 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {option.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {option.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Need help finding data? Visit our{" "}
              <Link href="/help" className="text-primary hover:underline">
                Help
              </Link>{" "}
              page for guidance.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
