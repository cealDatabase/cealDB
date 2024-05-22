"use client";

import { Container } from "@/components/Container";
import { useFormState } from "react-dom";
import signupAction from "./signupAction";

const SignUpPage = () => {
  const [error, formAction] = useFormState(signupAction, undefined);

  return (
    <Container>
      <h1>Sign Up Page</h1>
      <div className="text-center">SignUpPage</div>
      <form action={formAction}>
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p>{error}</p>}
    </Container>
  );
};

export default SignUpPage;
