import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

interface MRRDataPoint {
  month: string; // YYYY-MM
  mrr: number; // in cents, divide by 100 for dollars
}

export async function fetchMRRTimeSeries(
  months: number = 12
): Promise<MRRDataPoint[]> {
  // Fetch all subscriptions (including canceled) to reconstruct historical MRR
  const stripe = getStripe();
  const subscriptions: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({
    status: "all",
    limit: 100,
    expand: ["data.items"],
  })) {
    subscriptions.push(sub);
  }

  // Build monthly snapshots
  const now = new Date();
  const result: MRRDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

    let mrr = 0;
    for (const sub of subscriptions) {
      const createdAt = new Date(sub.created * 1000);
      const canceledAt = sub.canceled_at
        ? new Date(sub.canceled_at * 1000)
        : null;

      // Was this subscription active during this month?
      const wasCreatedBefore = createdAt <= monthEnd;
      const wasNotCanceled = !canceledAt || canceledAt >= monthDate;

      if (wasCreatedBefore && wasNotCanceled) {
        // Sum all subscription items, normalized to monthly
        for (const item of sub.items?.data ?? []) {
          const amount = item.price?.unit_amount ?? 0;
          const interval = item.price?.recurring?.interval;
          const intervalCount = item.price?.recurring?.interval_count ?? 1;

          let monthlyAmount = 0;
          if (interval === "month") {
            monthlyAmount = amount / intervalCount;
          } else if (interval === "year") {
            monthlyAmount = amount / (12 * intervalCount);
          } else if (interval === "week") {
            monthlyAmount = (amount * 52) / (12 * intervalCount);
          }

          mrr += monthlyAmount * (item.quantity ?? 1);
        }
      }
    }

    result.push({ month: monthKey, mrr: Math.round(mrr) });
  }

  return result;
}
