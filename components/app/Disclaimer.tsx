/**
 * Role: 풀이 2 디스클레이머 (spec §2.2)
 * Key Features: 랜딩과 페르소나 선택 화면에 반복 노출
 */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--color-text-muted)] ${className ?? ''}`}>
      각 회사의 공개된 디자인 철학과 블로그/컨퍼런스 발언을 기반으로 재구성한 가상의 페르소나입니다.
      실제 해당 회사 또는 직원의 의견을 대변하지 않습니다.
    </p>
  );
}
