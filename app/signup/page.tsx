import { Container } from "@/components/Container";
import { redirect } from "next/navigation";

const SignUpPage = () => {
  
  async function signup(formData: FormData) {
    "use server";
    // Get data off form
    const email = formData.get("email");
    const password = formData.get("password");
    // Send to our api route

    const res = await fetch(process.env.ROOT_URL + "/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    console.log(json);
    // Redirect to log in if success
    if (res.ok) {
      redirect("/admin");
    }
  }
  return (
    <Container>
      <h1>Sign Up Page</h1>
      <div className="text-center">SignUpPage</div>
      <form action={signup}>
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Sign Up</button>
      </form>
    </Container>
  );
};

export default SignUpPage;
