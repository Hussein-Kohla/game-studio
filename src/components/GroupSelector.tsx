type GroupRow = { groupId: number; count: number };

interface GroupSelectorProps {
  groups: GroupRow[] | undefined;
  selectedGroupId: number | null;
  onSelect: (groupId: number) => void;
  accentClass: string;
}

export function GroupSelector({
  groups,
  selectedGroupId,
  onSelect,
  accentClass,
}: GroupSelectorProps) {
  if (groups === undefined) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="text-center text-red-400 py-4">
        لا توجد مجموعات في قاعدة البيانات. شغّل populate أو reseedCatalog من Convex.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {groups.map(({ groupId, count }) => {
        const isSelected = selectedGroupId === groupId;
        return (
          <button
            key={groupId}
            type="button"
            onClick={() => onSelect(groupId)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              isSelected
                ? `${accentClass} bg-white/10 scale-[1.02]`
                : 'border-white/10 bg-black/30 hover:border-white/30'
            }`}
          >
            <span className="block text-lg font-bold text-white">المجموعة {groupId}</span>
            <span className="block text-sm text-slate-400 mt-1">{count} عنصر</span>
          </button>
        );
      })}
    </div>
  );
}
