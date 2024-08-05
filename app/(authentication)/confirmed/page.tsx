import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import Link from "next/link";

const AccountConfirmedPage = () => {
  return (
    <main>
      <Container className="text-center">
        <h1>Success!</h1>
        <h2>Account Created</h2>
        <div className="flex justify-center">
          <Button className="w-[200px] mt-8" href="/">
            Home Page
          </Button>
        </div>
      </Container>
    </main>
  );
};

export default AccountConfirmedPage;
