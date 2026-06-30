import { auth } from "@/lib/auth";
import { findCartItems } from "@/repositories/cart.repository";
import { cookies } from "next/headers";
import { HeaderClient } from "./header-client";
import { CART_SESSION_COOKIE } from "@/config/cart";

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";
  const userName = session?.user?.name;

  let cartCount = 0;
  try {
    if (isLoggedIn && session.user?.id) {
      const items = await findCartItems({ userId: session.user.id });
      cartCount = items.length;
    } else {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
      if (sessionId) {
        const items = await findCartItems({ sessionId });
        cartCount = items.length;
      }
    }
  } catch {
    // cart fetch is non-critical
  }

  return (
    <HeaderClient
      isLoggedIn={isLoggedIn}
      isAdmin={isAdmin}
      userName={userName}
      cartCount={cartCount}
    />
  );
}
