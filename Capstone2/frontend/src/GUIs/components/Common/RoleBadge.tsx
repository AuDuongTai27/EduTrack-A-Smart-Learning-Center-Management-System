interface RoleBadgeProps {
  role: string;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  let className = "role-badge";

  switch (role) {
    case "Center Manager":
      className = "role-badge role-manager";
      break;

    case "Admin Staff":
      className = "role-badge role-admin";
      break;

    case "Teacher":
      className = "role-badge role-teacher";
      break;

    case "Teaching Assistant":
      className = "role-badge role-ta";
      break;
  }

  return <span className={className}>{role}</span>;
}
