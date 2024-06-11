import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { signoutAction } from "../signout/signoutAction";

const AdminPage = () => {
  return (
    <main>
      <Container>
        <h1>Hello Admin</h1>
        <div className="text-center">Contents on the Admin Page</div>
      </Container>
    </main>
  );
};

export default AdminPage;
