interface UserAvatarProps {
  name: string;
}

export default function UserAvatar({ name }: UserAvatarProps) {
  const removeVietnameseTones = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const normalizedName = removeVietnameseTones(name);
  const words = normalizedName.trim().split(/\s+/);

  let initials = "";

  if (words.length === 1) {
    initials = words[0].slice(0, 2);
  } else {
    initials = words[0][0] + words[words.length - 1][0];
  }

  return <div className="user-avatar">{initials.toUpperCase()}</div>;
}
