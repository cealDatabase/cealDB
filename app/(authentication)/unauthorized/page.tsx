import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import Link from "next/link";
import { ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/20/solid";

export default function UnauthorizedPage() {
  return (
    <main>
      <Container className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-red-800 mb-4">
            You don't have permission to access this page
          </h2>
          
          <p className="text-red-700 mb-4">
            This page is restricted to Super Admins and Admin Assistants only.
          </p>
          
          <div className="text-sm text-red-600 space-y-2">
            <p>• Contact your Super Administrator for access</p>
            <p>• Verify you have the correct role permissions</p>
            <p>• Return to the main dashboard to continue</p>
          </div>
        </div>
        
        <div className="text-gray-600 mb-8">
          <p>
            If you believe you should have access to this page, please contact your
            CEAL Super Administrator for assistance.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button href="/admin" className="flex items-center">
            <HomeIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" href="/">
            Home Page
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Need help? Contact your Super Administrator or visit the{" "}
            <Link href="/help" className="text-blue-600 hover:text-blue-800 underline">
              help page
            </Link>
            .
          </p>
        </div>
      </Container>
    </main>
  );
}
