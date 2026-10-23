export type ShowMoreProps = {
  onClick: () => void;
  isLoading: boolean;
};

export default function ShowMore({ onClick, isLoading }: ShowMoreProps) {
  return (
    <div className="mt-14 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className="rounded-full bg-[#dddffe] px-16 py-2.5 text-sm font-bold uppercase text-vant-purple hover:bg-[#cdd0ff] disabled:opacity-60"
      >
        {isLoading ? "Loading…" : "Show me more"}
      </button>
    </div>
  );
}
