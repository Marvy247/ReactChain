interface Props { address: string; isAdmin?: boolean; }
export default function MemberBadge({ address, isAdmin }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-app-hover border border-app-border text-sm">
      <span className="font-mono">{address.slice(0,6)}…{address.slice(-4)}</span>
      {isAdmin && <span className="text-xs px-2 py-0.5 rounded-full bg-accent-indigo text-white">Admin</span>}
    </div>
  );
}
