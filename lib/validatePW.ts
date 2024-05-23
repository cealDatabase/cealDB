export default function validatePassword(password: string) {
  // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number, and a special character
  const regex =
    /^?=.*[a-z]) (?=.*[A-Z]) (?=.*\d) (?=.*[@$!%*?&]) [A-Za-z\d@$!%*?&]{8, }$/;
  return regex.test(password);
}
