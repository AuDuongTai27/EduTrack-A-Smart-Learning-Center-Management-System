import React from "react";
import { Link } from "react-router-dom";

export interface TodayClassItem {
  id: string | number;
  className: string;
  timePeriod: string;
}

export interface TodayClassesSectionProps {
  /** List of classes scheduled for today */
  classes?: TodayClassItem[];
}

const MOCK_TODAY_CLASSES: TodayClassItem[] = [
  {
    id: 1,
    className: "[FE-Mock] Toán 12 Chuyên Sâu – Luyện Thi ĐH",
    timePeriod: "08:00 - 09:45",
  },
  {
    id: 2,
    className: "[FE-Mock] Vật Lý 12 Nâng Cao",
    timePeriod: "10:00 - 11:45",
  },
];

export function TodayClassesSection({
  classes = MOCK_TODAY_CLASSES,
}: TodayClassesSectionProps = {}) {
  const displayClasses = classes && classes.length > 0 ? classes : MOCK_TODAY_CLASSES;

  return (
    <div className="card dashboard-card">
      <div className="card-header dashboard-card-header">
        <h5 className="mb-0">Lớp học hôm nay</h5>
      </div>
      <div className="card-body dashboard-card-body">
        {displayClasses.length === 0 ? (
          <p className="text-muted text-center my-3">Không có ca học nào được xếp lịch cho hôm nay.</p>
        ) : (
          <div className="today-classes-grid">
            {displayClasses.map((cls) => (
              <Link
                key={cls.id}
                to={`/teaching-assistant/classes/${cls.id}`}
                className="text-decoration-none text-dark"
              >
                <div className="today-class-item">
                  <span className="badge badge-primary badge-lg mb-2">
                    <i className="bi bi-clock me-1" />
                    {cls.timePeriod}
                  </span>
                  <p className="today-class-name mb-0">{cls.className}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodayClassesSection;