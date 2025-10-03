import { cookies } from "next/headers";
import { HeaderComponent } from "./HeaderComponent";
import { signoutAction } from "@/app/(authentication)/signout/signoutAction";
import { redirect } from "next/navigation";




async function loginStatus() {
  const cookieStore = await cookies();
  const loginDetails = cookieStore.get("session")?.value;
  return (
    <HeaderComponent
      loggedIn={loginDetails ? true : false}
      logoutAction={
        <form
          action={async () => {
            "use server";
            await signoutAction();
            redirect("/");
          }}
        >
          <button>
            <span>Sign out</span>
          </button>
        </form>
      }
    />
  );
}

export default async function Header() {
  return loginStatus();
}
