import { getAllLibraries, getAllRoles } from "@/data/fetchPrisma";
import SignUpForm from "./formUI";

async function allLibraries() {
  const libraries = await getAllLibraries();
  return libraries;
}

async function allRoles() {
  const roles = await getAllRoles();
  return roles;
}

export default async function SignUpPage() {
  return (
    <main>
      <SignUpForm libraries={await allLibraries()} roles={await allRoles()} />
    </main>
  );
}
