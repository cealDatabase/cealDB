import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";

const AccountConfirmedPage = () => {
  return (
    <main>
      <Container className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Created Successfully!</h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-lg font-medium text-green-800">Check Your Email</h2>
          </div>
          
          <p className="text-green-700 mb-4">
            We've sent password setup instructions to your email address.
          </p>
          
          <div className="text-sm text-green-600 space-y-2">
            <p>• Click the link in your email to set up your password</p>
            <p>• The setup link will expire in 24 hours</p>
            <p>• Check your spam/junk folder if you don't see the email</p>
          </div>
        </div>
        
        <div className="text-gray-600 mb-8">
          <p>
            Once you've set up your password, you'll be able to sign in and
            access the CEAL Database forms.
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button variant="outline" href="/signin">
            Go to Sign In
          </Button>
          <Button href="/">
            Home Page
          </Button>
        </div>
      </Container>
    </main>
  );
};

export default AccountConfirmedPage;
