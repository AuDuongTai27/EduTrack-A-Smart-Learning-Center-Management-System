import TeachingWelcomeBanner from "../../shared/TeachingWelcomeBanner";
export interface GreetingSectionProps {
  /** TA's display name */
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
    if (hour < 12) return "Good morning,";
    if (hour < 18) return "Good afternoon,";
    return "Good evening,";
  };

  return <TeachingWelcomeBanner greeting={getGreetingText()} name={name} message={message} role="assistant" />;
}

export default GreetingSection;
