import { formatVND } from '../../utils/formatCurrency';

const icons = {
  student: { color: 'primary', label: 'Graduation cap', path: 'm2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v7' },
  class: { color: 'info', label: 'Book', path: 'M12 5v15M12 5C9 3 5 3 2 4v14c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z' },
  staff: { color: 'warning', label: 'Users', path: 'M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m22 0v-2a4 4 0 0 0-3-4M16 3a4 4 0 0 1 0 8M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' },
  collected: { color: 'primary', label: 'Banknote', path: 'M3 6h18v12H3V6Zm0 4a4 4 0 0 0 4-4m10 0a4 4 0 0 0 4 4M3 14a4 4 0 0 1 4 4m10 0a4 4 0 0 1 4-4M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z' },
  overdue: { color: 'danger', label: 'Circle alert', path: 'M12 8v5m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z' },
  outstanding: { color: 'warning', label: 'Wallet', path: 'M20 7V4H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V7m18 6h-5v5h5m-2-2.5h.01' },
  approval: { color: 'info', label: 'Clipboard', path: 'M9 5H5v17h14V5h-4M9 3h6v4H9V3Zm-1 9h1m3 0h4m-8 5h1m3 0h4' },
  feedback: { color: 'warning', label: 'Message square', path: 'M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10Z' },
} as const;

interface Props {
  kind: keyof typeof icons;
  title: string;
  value: string | number | null;
  currency?: 'VND';
  decorativeWatermark?: boolean;
}

/** Display-only presentation used exclusively by the two management dashboards. */
export default function ManagementDashboardKpi({ kind, title, value, currency, decorativeWatermark = false }: Props) {
  const icon = icons[kind];
  const amount = currency ? formatVND(typeof value === 'number' ? value : null) : null;
  return <div className={`card dashboard-kpi h-100${currency ? ' dashboard-kpi--currency' : ''}`}>
    <div className="card-body">
      {decorativeWatermark && <svg className="cm-kpi-watermark" aria-hidden="true" width="76" height="76" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d={icon.path} /></svg>}
      <div className="d-flex">
        <div>
          <p className="text-muted mb-1">{title}</p>
          <h3 className={`mb-0${currency ? ' kpi-currency-value' : ''}`}>
            {currency ? <>{amount === '—' ? amount : amount!.slice(0, -4)}<span className="d-block kpi-currency-unit">VND</span></> : value}
          </h3>
        </div>
        <div className={`kpi-icon bg-${icon.color}-subtle text-${icon.color}-emphasis`} data-kpi-icon={icon.label}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon.path} /></svg>
        </div>
      </div>
    </div>
  </div>;
}
