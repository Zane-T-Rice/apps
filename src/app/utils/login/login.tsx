"use server";

import { cookies as nextCookies } from "next/headers";

export async function login(
  username: string,
  password: string
): Promise<boolean> {
  // This really should be some kind of oauth or something, but for
  // now it is good enough to just try to fetch servers and see if
  // it works.
  const response = await fetch(process.env.LOGIN_SERVICE_URL || "", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      owner: username,
      "authorization-key": password,
    },
  });

  if (response.status !== 200) {
    return false;
  }

  const cookies = await nextCookies();
  cookies.set({
    name: "username",
    value: encodeURIComponent(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  cookies.set({
    name: "password",
    value: encodeURIComponent(password),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return true;
}
