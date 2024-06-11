"use server";
import { cookies } from "next/headers";
import { Header } from "./Header";
import { signoutAction } from "@/app/(authentication)/signout/signoutAction";
import { redirect } from "next/navigation";
import { Button } from "@/components/Button";

function loginStatus() {
  const loginDetails = cookies().get("session")?.value;
  return (
    <Header
      loggedIn={loginDetails ? true : false}
      logoutAction={
        <form
          action={async () => {
            "use server";
            await signoutAction();
            redirect("/");
          }}
        >
          <Button type="submit"><span className="underline">Sign out</span></Button>
        </form>
      }
    />
  );
}

export default async function UpperHeader() {
  return loginStatus();
}
