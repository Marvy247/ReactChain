interface Props {
  contributed: number;
  total: number;
}

export default function ContributionProgress({ contributed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((contributed / total) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-text-dim">
        <span>{contributed}/{total} contributed</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-app-border rounded-full h-2">
        <div
          className="bg-accent-indigo h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
