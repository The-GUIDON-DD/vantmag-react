export default function Chip({
  icon,
  color,
  title,
}: {
  icon: string;
  color: string;
  title: string;
}) {
  return (
    <div
      className="text-white uppercase bold py-1 px-2 rounded-full flex items-center gap-2 w-max"
      style={{ backgroundColor: color }}
    >
      <img src={icon} alt={title} className="h-5 flex-none" />
      <p className="whitespace-nowrap flex-none font-bold">{title}</p>
    </div>
  );
}
