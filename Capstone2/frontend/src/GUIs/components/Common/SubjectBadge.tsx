interface SubjectBadgeProps {
  subject: string;
}

export default function SubjectBadge({ subject }: SubjectBadgeProps) {
  return <span className="specialty-badge">{subject}</span>;
}
