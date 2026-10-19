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
        id: "class-1-a",
        className: "Class I-A",
        timePeriod: "09:00 - 09:45",
    },
];
export function TodayClassesSection({
    classes = MOCK_TODAY_CLASSES,
}: TodayClassesSectionProps = {}) {
    return (
        <div className="card dashboard-card">
            <div className="card-header dashboard-card-header">
                <h5 className="mb-0">Today's Class</h5>
            </div>
            <div className="card-body dashboard-card-body">
                {classes.length === 0 ? (
                    <p className="text-muted text-center my-3">No classes scheduled for today.</p>
                ) : (
                    <div className="today-classes-grid">
                        {classes.map((cls) => (
                            <Link
                                key={cls.id}
                                to={`/teacher/classes/${cls.id}`}
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