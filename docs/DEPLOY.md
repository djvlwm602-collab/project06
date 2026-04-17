# Vercel 배포 노트

## 사전
- Vercel 프로젝트 연결 (GitHub 저장소: `djvlwm602-collab/project06`)
- Node.js: 기본 (Vercel이 Next.js 자동 감지)

## 환경변수
Vercel 프로젝트 Settings → Environment Variables:

| 이름 | 값 | 노출 |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio(https://aistudio.google.com/apikey) 발급 키 | Server-only (절대 `NEXT_PUBLIC_*` 쓰지 말 것) |

## 배포
- `main` 브랜치 push → Production 자동 배포
- Preview 배포는 PR 생성 시 자동

## 수동 검증 (배포 후)
- `/api/critique`가 직접 GET 호출 시 "Method Not Allowed"/405 (POST 전용)
- 배포 URL에서 Network 탭으로 키가 클라이언트 번들에 포함 안 된 것 확인
- 실제 스크린샷으로 5 STEP 전 과정 시연 1회

## 롤백
- Vercel 대시보드 → Deployments → 이전 배포 "Promote to Production"
