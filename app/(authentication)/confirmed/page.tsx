import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import Link from "next/link";

const AccountConfirmedPage = () => {
  return (
    <main>
      <Container>
        <h1>Account Successfully Created</h1>
        <div className="flex justify-center">
          <Button className="w-[200px]" href="/">
            Home Page
          </Button>
        </div>
      </Container>
    </main>
  );
};

export default AccountConfirmedPage;
