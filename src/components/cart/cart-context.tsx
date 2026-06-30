"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { getCartAction, removeFromCartAction } from "@/actions/cart.actions";
import type { Book } from "@/db/schema/books";
import type { CartItem } from "@/db/schema/cart";
import { CART_UPDATED_EVENT } from "./cart-events";

export type CartItemWithBook = CartItem & { book: Book };

interface CartState {
  items: CartItemWithBook[];
  itemCount: number;
  subtotal: number;
  baseShippingCost: number;
  shippingCost: number;
  /** Null means no threshold configured (shipping always applies). */
  freeShippingThreshold: number | null;
  total: number;
  isLoading: boolean;
  hasLoaded: boolean;
}

interface CartContextValue extends CartState {
  removeItem: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Isolated component that reads usePathname() so the dynamic API access
 * is contained within a <Suspense> boundary inside CartProvider, preventing
 * the "Uncached data accessed outside of Suspense" build error.
 */
function CartPrefetcher({ refresh }: { refresh: () => Promise<void> }) {
  const pathname = usePathname();
  const hasFetched = useRef(false);
  const shouldPrefetchCart =
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/");

  useEffect(() => {
    if (shouldPrefetchCart && !hasFetched.current) {
      hasFetched.current = true;
      void refresh();
    }
  }, [refresh, shouldPrefetchCart]);

  return null;
}

export function CartProvider({
  children,
  initialCount = 0,
}: {
  children: React.ReactNode;
  initialCount?: number;
}) {
  const [state, setState] = useState<CartState>({
    items: [],
    itemCount: initialCount,
    subtotal: 0,
    baseShippingCost: 0,
    shippingCost: 0,
    freeShippingThreshold: null,
    total: 0,
    isLoading: false,
    hasLoaded: false,
  });
  const latestRefreshId = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++latestRefreshId.current;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await getCartAction();
      if (requestId !== latestRefreshId.current) return;
      setState({
        items: result.items as CartItemWithBook[],
        itemCount: result.itemCount,
        subtotal: result.subtotal,
        baseShippingCost: result.baseShippingCost,
        shippingCost: result.shippingCost,
        freeShippingThreshold: result.freeShippingThreshold ?? null,
        total: result.total,
        isLoading: false,
        hasLoaded: true,
      });
    } catch {
      if (requestId !== latestRefreshId.current) return;
      setState((prev) => ({ ...prev, isLoading: false, hasLoaded: false }));
    }
  }, []);

  useEffect(() => {
    function handleCartUpdated() {
      void refresh();
    }
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
  }, [refresh]);

  const removeItem = useCallback(
    async (itemId: string) => {
      setState((prev) => {
        const newItems = prev.items.filter((i) => i.id !== itemId);
        const newSubtotal = newItems.reduce((s, i) => s + i.book.price, 0);
        const newShipping =
          prev.freeShippingThreshold !== null &&
          newSubtotal >= prev.freeShippingThreshold
            ? 0
            : prev.baseShippingCost;
        return {
          ...prev,
          items: newItems,
          itemCount: newItems.length,
          subtotal: newSubtotal,
          shippingCost: newShipping,
          total: newSubtotal + newShipping,
        };
      });

      const res = await removeFromCartAction(itemId);
      if (!res.success) {
        toast.error(res.error ?? "خطا در حذف از سبد خرید");
        await refresh();
      } else {
        toast.success("کتاب از سبد خرید حذف شد");
        await refresh();
      }
    },
    [refresh]
  );

  return (
    <CartContext.Provider value={{ ...state, removeItem, refresh }}>
      {/* CartPrefetcher uses usePathname() — keep it inside Suspense so the
          dynamic API access doesn't block static prerendering of other routes. */}
      <Suspense>
        <CartPrefetcher refresh={refresh} />
      </Suspense>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
