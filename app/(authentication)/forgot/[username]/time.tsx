"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function UserRequestTime() {
  const searchParams = useSearchParams();
  const time = searchParams.get("time");
  return time?.toString();
}

function ServerTime() {
  const currentTime = Date.now();
  return currentTime;
}

export default function TimeDiff() {
  const [userTime, setUserTime] = useState(UserRequestTime());
  const [servrTime, setServrTime] = useState(ServerTime());
  const numUTime = Number(userTime);
  const numSTime = Number(servrTime);
  return numSTime - numUTime;
}
