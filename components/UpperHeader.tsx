import { cookies } from "next/headers";
import { Header } from "./Header";

function loginStatus() {
  const loginDetails = cookies().get("session")?.value;
  return <Header loginDetail={loginDetails ? true : false} />;
}

export default function UpperHeader() {
  return loginStatus();
}
