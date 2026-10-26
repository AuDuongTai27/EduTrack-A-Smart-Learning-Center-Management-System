export interface GreetingSectionProps {
  /** TA's display name */
  name?: string;
  /** Optional custom greeting (e.g. Good Morning). If omitted, dynamic greeting by time of day is used */
  greeting?: string;
  /** Subtitle message */
  message?: string;
}

export function GreetingSection({
  name = "[FE-Mock] Âu Dương Tài",
  greeting,
  message = "Chúc bạn một ngày làm việc hỗ trợ lớp học thật hiệu quả tại EduTrack!",
}: GreetingSectionProps) {
  const getGreetingText = (): string => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng,";
    if (hour < 18) return "Chào buổi chiều,";
    return "Chào buổi tối,";
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
