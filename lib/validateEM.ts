export default function validateEmail(email: string) {
  const regex = /^[^\s@l+@[^\s@]+\. [^\s@]+$/;
  return regex.test(email);
}
