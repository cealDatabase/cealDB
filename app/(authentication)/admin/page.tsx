import { cookies } from "next/headers";
import { Container } from "@/components/Container";

function getCookies() {
  const cookieStore = cookies();

  return cookieStore.getAll().map((cookie) => (
    <div key={cookie.name}>
      <p>Name: {cookie.name}</p>
      <p>Value: {cookie.value}</p>
    </div>
  ));
}

const AdminPage = () => {
  return (
    <main>
      <Container>
        <h1>Hello Admin</h1>
        <div className="text-center">Contents on the Admin Page</div>
        {getCookies()}
      </Container>
    </main>
  );
};

export default AdminPage;
