/**
 * Role: STEP 3 페르소나 선택 (6명, 디폴트 전원) — 강한 충돌 쌍 수 실시간 미리보기
 * Key Features: 체크박스 + 충돌 수 뱃지, 매트릭스 룩업(§4.1 옵션 A)
 * Dependencies: @/lib/personas, @/lib/conflict/lookup, @/lib/store
 */
'use client';

import { PERSONA_IDS, type PersonaId } from '@/lib/personas/types';
import { PERSONAS } from '@/lib/personas/definitions';
import { activeConflictThemes } from '@/lib/conflict/lookup';
import { useAppStore } from '@/lib/store';
import { Checkbox } from '@/components/ui/checkbox';

export function PersonaPicker() {
  const selected = useAppStore((s) => s.selectedPersonas);
  const setSelected = useAppStore((s) => s.setSelectedPersonas);
  const strongCount = activeConflictThemes(selected).length;

  const toggle = (id: PersonaId) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else setSelected([...selected, id]);
  };

  return (
    <div>
      <ul className="divide-y rounded-[var(--radius-lg)] border bg-[var(--color-surface)]">
        {PERSONA_IDS.map((id) => {
          const p = PERSONAS[id];
          const checked = selected.includes(id);
          return (
            <li key={id} className="flex items-start gap-3 p-4">
              <Checkbox
                id={`persona-${id}`}
                checked={checked}
                onChange={() => toggle(id)}
                aria-label={p.label}
              />
              <label htmlFor={`persona-${id}`} className="flex-1 cursor-pointer">
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {p.firstLens} · {p.questionDomain}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <p
        className="mt-4 text-sm text-[var(--color-text-secondary)]"
        data-testid="conflict-preview"
      >
        {strongCount > 0
          ? `선택한 페르소나 중 강한 충돌 ${strongCount}쌍이 있어요.`
          : '선택한 페르소나들 사이에 강한 충돌은 없어요.'}
      </p>
    </div>
  );
}
