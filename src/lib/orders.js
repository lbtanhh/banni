import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const ORDERS = "orders";

/**
 * Persist order: { createdAt, total, items: [{ name, price, quantity }] }
 */
export async function saveOrder({ total, items }) {
  const payload = {
    createdAt: Timestamp.now(),
    total,
    items: items.map(({ name, price, quantity }) => ({
      name,
      price: Number(price),
      quantity: Number(quantity),
    })),
  };
  const ref = await addDoc(collection(db, ORDERS), payload);
  return ref.id;
}

function startOfTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Orders with createdAt in [start, endExclusive).
 * Both bounds are local calendar instants (Firestore stores UTC).
 */
export async function fetchOrdersInRange(start, endExclusive) {
  const q = query(
    collection(db, ORDERS),
    where("createdAt", ">=", Timestamp.fromDate(start)),
    where("createdAt", "<", Timestamp.fromDate(endExclusive))
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Orders with createdAt >= local midnight today.
 */
export async function fetchTodayOrders() {
  const start = startOfTodayLocal();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return fetchOrdersInRange(start, end);
}
