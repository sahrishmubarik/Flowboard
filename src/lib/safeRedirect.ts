// Only allow same-site paths, so a crafted ?redirect= cannot send users to another site.
export function getSafeRedirect(redirect: string | null | undefined) {
  if (
    !redirect ||
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.startsWith("/\\")
  ) {
    return null;
  }

  return redirect;
}
