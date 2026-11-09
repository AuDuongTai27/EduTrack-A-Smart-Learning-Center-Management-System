import React from "react";
export interface GreetingSectionProps {
    /** Teacher's display name */
    name?: string;
    /** Optional custom greeting (e.g. Good Morning). If omitted, dynamic greeting by time of day is used */
    greeting?: string;
    /** Subtitle message */
    message?: string;
}
export function GreetingSection({
    name,
    greeting,
    message,
}: GreetingSectionProps) {
    const getGreetingText = (): string => {
        if (greeting) return greeting;
        const hour = new Date().getHours();
        if (hour < 12) return "Chào buổi sáng";
        if (hour < 18) return "Chào buổi tối";
        return "Chào buổi sáng";
    };
    return (
        <div className="row mb-3">
            <div className="col-md-12 d-flex">
                <div className="card flex-fill bg-info bg-03">
                    <div className="card-body py-2.5 px-4">
                        <h3 className="text-white mb-1 fw-bold" style={{ fontSize: "22px" }}>
                            {getGreetingText()} {name}
                        </h3>
                        <p className="text-white mb-0" style={{ fontSize: "14px", opacity: 0.9 }}>
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default GreetingSection;
