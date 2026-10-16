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
    name = "Henriques",
    greeting,
    message = "Have a Good day at work",
}: GreetingSectionProps) {
    const getGreetingText = (): string => {
        if (greeting) return greeting;
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };
    return (
        <div className="row mb-3">
            <div className="col-md-12 d-flex">
                <div className="card flex-fill bg-info bg-03">
                    <div className="card-body">
                        <h1 className="text-white mb-1">
                            {getGreetingText()} {name}
                        </h1>
                        <p className="text-white mb-3">{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default GreetingSection;
