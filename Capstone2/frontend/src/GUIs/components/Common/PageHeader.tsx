import type { ReactNode } from "react";
import Breadcrumb from "./Breadcrumb";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbItems?: BreadcrumbItem[];
  action?: ReactNode;
}

export default function PageHeader({
  title,
  breadcrumbItems,
  action,
}: PageHeaderProps) {
  const hasBreadcrumbs = Boolean(breadcrumbItems && breadcrumbItems.length > 0);
  return (
    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
      <div className="my-auto mb-2">
        <h3 className={`page-title ${hasBreadcrumbs ? "mb-1" : "mb-0"} fw-bold`}>{title}</h3>

        {hasBreadcrumbs && <Breadcrumb items={breadcrumbItems!} />}
      </div>

      {action && <div className="mb-2">{action}</div>}
    </div>
  );
}
