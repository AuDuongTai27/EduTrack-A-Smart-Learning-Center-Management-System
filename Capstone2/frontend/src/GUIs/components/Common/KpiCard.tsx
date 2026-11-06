import { formatVND } from "../../utils/formatCurrency";

/*
Usage:

<KpiCard
  type="student"
  status="active"
  title="Active Students"
  value={3654}
  footerValue="2.4%"
  footerLabel="this month"
  trend="up"
/>

<KpiCard
  type="tuition"
  status="collected"
  title="Collected"
  currency="VND"
  value={85000000}
  footerValue="68%"
  footerLabel="collected"
/>

type = KPI category
status = state inside that category
KpiCard automatically determines icon and color
*/

type KpiType = "student" | "class" | "staff" | "tuition" | "request";

type KpiStatus =
  | "active"
  | "new"
  | "unpaid"
  | "total"
  | "collected"
  | "outstanding"
  | "overdue";

interface KpiCardProps {
  type: KpiType;
  status?: KpiStatus;

  title: string;
  value: string | number | null;
  currency?: "VND";
  currencyUnitOnNewLine?: boolean;
  hideIcon?: boolean;

  footerValue?: string | number;
  footerLabel?: string;

  trend?: "up" | "down";

  footerLayout?: "normal" | "between";
}

export default function KpiCard({
  type,
  status,
  title,
  value,
  currency,
  currencyUnitOnNewLine = false,
  hideIcon = false,
  footerValue,
  footerLabel,
  trend,
  footerLayout = "normal",
}: KpiCardProps) {
  let icon = "";
  let iconClass = "";
  let footerClass = "text-muted";

  switch (type) {
    case "student":
      switch (status) {
        case "new":
          icon = "bi-person-plus-fill";
          iconClass = "bg-primary-subtle text-primary";
          footerClass = "text-primary fw-semibold";
          break;

        case "unpaid":
          icon = "bi-person-exclamation";
          iconClass = "bg-warning-subtle text-warning";
          break;

        case "active":
        default:
          icon = "bi-mortarboard-fill";
          iconClass = "bg-primary-subtle text-primary";
          break;
      }
      break;

    case "class":
      icon = "bi-collection-fill";
      iconClass = "bg-info-subtle text-info";
      break;

    case "staff":
      icon = "bi-people-fill";
      iconClass = "bg-warning-subtle text-warning";
      break;

    case "tuition":
      switch (status) {
        case "collected":
          icon = "bi-cash-stack";
          iconClass = "bg-success-subtle text-success";
          footerClass = "text-success";
          break;

        case "outstanding":
          icon = "bi-hourglass-split";
          iconClass = "bg-warning-subtle text-warning";
          break;

        case "overdue":
          icon = "bi-exclamation-circle-fill";
          iconClass = "bg-danger-subtle text-danger";
          footerClass = "text-danger";
          break;

        case "total":
        default:
          icon = "bi-receipt";
          iconClass = "bg-primary-subtle text-primary";
          break;
      }
      break;

    case "request":
      icon = "bi-send-check-fill";
      iconClass = "bg-info-subtle text-info";
      footerClass = "text-warning fw-semibold";
      break;
  }

  const getTrendClass = () => {
    if (trend === "up") {
      return "text-success";
    }

    if (trend === "down") {
      return "text-danger";
    }

    return footerClass;
  };

  const formattedValue = currency ? formatVND(typeof value === "number" ? value : null) : value;
  const displayedValue = currency && currencyUnitOnNewLine && formattedValue !== "—" ? (
    <>{String(formattedValue).slice(0, -4)} <span className="d-block kpi-currency-unit">VND</span></>
  ) : formattedValue;

  return (
    <div className={`card dashboard-kpi h-100${currency ? " dashboard-kpi--currency" : ""}`}>
      <div className="card-body">
        <div className={`d-flex align-items-center justify-content-between${currency ? " kpi-currency-row" : ""}`}>
          <div className={currency ? "kpi-currency-copy" : undefined}>
            <p className="text-muted mb-1">{title}</p>
            <h3 className={`mb-0${currency ? " kpi-currency-value" : ""}`}>
              {displayedValue}
            </h3>
          </div>

          {!hideIcon && (
            <div className={`kpi-icon ${iconClass}`}>
              <i className={`bi ${icon}`} />
            </div>
          )}
        </div>

        {(footerValue !== undefined || footerLabel) && (
          <>
            {footerLayout === "between" ? (
              <div className="border-top mt-3 pt-3 d-flex align-items-center justify-content-between">
                {footerLabel && (
                  <span className="text-muted">{footerLabel}</span>
                )}

                {footerValue !== undefined && (
                  <strong className={footerClass}>{footerValue}</strong>
                )}
              </div>
            ) : (
              <div className="border-top mt-3 pt-3">
                {footerValue !== undefined && (
                  <span className={getTrendClass()}>
                    {trend && (
                      <>
                        <i
                          className={`bi ${
                            trend === "up" ? "bi-arrow-up" : "bi-arrow-down"
                          }`}
                        />{" "}
                      </>
                    )}

                    {footerValue}
                  </span>
                )}

                {footerLabel && (
                  <span
                    className={`text-muted ${
                      footerValue !== undefined ? "ms-2" : ""
                    }`}
                  >
                    {footerLabel}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
