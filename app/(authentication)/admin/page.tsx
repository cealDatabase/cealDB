import { cookies } from "next/headers";
import { Container } from "@/components/Container";

function getCookies() {
  const cookieStore = cookies().get("uinf")?.value
  return cookieStore;
}

const UserLoggedInPage = () => {
  return (
    <main>
      <Container>
        <h1>Hello {getCookies()}</h1>
        <div className="text-center">Contents on the User Page</div>
      </Container>
    </main>
  );
};

export default UserLoggedInPage;
