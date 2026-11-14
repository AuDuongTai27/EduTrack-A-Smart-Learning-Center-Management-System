import KpiCard from "./KpiCard";

interface TuitionOverviewProps {
  totalDue: number | null;
  collected: number | null;
  collectionLabel: string;
  collectionError?: string | null;
  outstanding: number | null;
  overdueAmount: number | null;
  overdueCount: number | null;
  filtered?: boolean;
}

/** Reuse the existing KPI card appearance; only the currency unit moves to its own line. */
export default function TuitionOverview({
  totalDue, collected, collectionLabel, collectionError, outstanding, overdueAmount, overdueCount, filtered = false,
}: TuitionOverviewProps) {
  const invoiceScope = `All tuition terms${filtered ? " · Filtered" : ""}`;
  const items = [
    { title: "Total Tuition Due", amount: totalDue, status: "total" as const,
      footer: invoiceScope },
    { title: "Collected", amount: collected, status: "collected" as const,
      footer: collectionLabel },
    { title: "Outstanding", amount: outstanding, status: "outstanding" as const,
      footer: invoiceScope },
    { title: "Overdue", amount: overdueAmount, status: "overdue" as const,
      footer: overdueCount == null ? "—" : `${overdueCount} ${overdueCount === 1 ? "invoice" : "invoices"}` },
  ];

  return (
    <>
      {collectionError && <div className="alert alert-warning mb-3" role="alert">Collected: {collectionError}</div>}
      <div className="row g-3 mb-4 tuition-kpis">
        {items.map(item => (
          <div className="col-xl-3 col-md-6" key={item.title}>
            <KpiCard
              type="tuition"
              status={item.status}
              title={item.title}
              currency="VND"
              currencyUnitOnNewLine
              value={item.amount}
              footerValue={item.footer}
            />
          </div>
        ))}
      </div>
    </>
  );
}
