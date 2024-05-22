import { Container } from "@/components/Container";

const SignUpPage = () => {
  return (
    <Container>
      <h1>Sign Up Page</h1>
      <div>SignUpPage</div>
      <form>
        <input type="email" name="email" />
        <input type="password" name="password" />
        <button type="submit">Sign Up</button>
      </form>
    </Container>
  );
};

export default SignUpPage;
