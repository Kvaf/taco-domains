export { auth as middleware } from "@/lib/auth/auth-options";

export const config = {
  matcher: ["/dashboard/:path*"],
};
