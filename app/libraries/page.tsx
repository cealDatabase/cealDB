'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileCheck, SlashIcon } from "lucide-react";
import LibList from "@/components/LibList";
import ParticipationStatus from "@/components/ParticipationStatus";
import { SingleLibraryType } from "@/types/types";
import { Container } from "@/components/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

function SkeletonCard() {
  return (
    <div className="flex flex-row space-x-3 mt-8">
      <Skeleton className="h-[50px] w-[250px] rounded-xl" />
      <Skeleton className="h-[50px] w-[100px] rounded-xl" />
    </div>
  );
}

export default function LibrariesHomePage() {
  const [activeTab, setActiveTab] = useState<'institution' | 'participation'>('institution');
  const [libraries, setLibraries] = useState<SingleLibraryType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/libraries');
        const data = await response.json();
        
        if (data.success) {
          setLibraries(data.data);
        } else {
          setError(data.error || 'Failed to load libraries');
        }
      } catch (err) {
        setError('Error fetching libraries');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="my-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="no-underline">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/admin" className="no-underline">Admin</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
                
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Institutions</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </Container>
      
      <h1>Institution Information</h1>

      <Container className="py-8">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-md shadow-sm bg-white border border-gray-200">
              <button
                onClick={() => setActiveTab('institution')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-l-md border-r border-gray-200 ${activeTab === 'institution'
                    ? 'bg-red-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                Institution Info
              </button>
              <button
                onClick={() => setActiveTab('participation')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-r-md ${activeTab === 'participation'
                    ? 'bg-red-800 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <FileCheck className="w-4 h-4" />
                Participation Status
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'institution' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Institution Information
                </CardTitle>
                <p className="text-gray-600">
                  Search and view detailed information about CEAL participating institutions.
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <SkeletonCard />
                ) : error ? (
                  <div className="text-red-600 bg-red-50 p-4 rounded-md">
                    {error}
                  </div>
                ) : libraries ? (
                  <LibList libraries={libraries as any} />
                ) : (
                  <div className="text-gray-600 text-center py-8">
                    No libraries found
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'participation' && <ParticipationStatus />}
        </div>
      </Container>
    </main>
  );
}
