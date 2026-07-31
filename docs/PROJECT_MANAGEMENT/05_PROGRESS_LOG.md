# 진행 로그

[문서 목록](./00_INDEX.md) · [현재 상태](./02_CURRENT_STATUS.md) · [전체 계획](./03_MASTER_PLAN.md)

## 2026-07-29 — 초기 백업과 공개 사이트 기반

- 영구 백업 생성:

```text
/Users/sgk/Documents/jeakyung-backups/phase0-20260729/
```

- 공개 사이트 React 전환 진행
- 공개 사이트와 그룹웨어 라우트 분리
- Vercel Preview 준비
- 0바이트 Placeholder 11개는 의도적으로 미추적 유지

주요 공개 사이트 커밋:

```text
6bbf8f... refactor: complete public site React migration
795e851... feat: prepare public site for preview deployment
6da5d704c9a8df602919f0d1ef2e76aa10ff1f4b
fix: refine mobile headings and consultation buttons
```

## 2026-07-30 — Phase G2 인증·조직

브랜치:

```text
groupware/auth-membership
```

주요 커밋:

```text
e3a35f3 docs: refine groupware product requirements
bc077693a6734962810d45297d3ecc9938c23eb8
feat: connect groupware authentication and membership
```

완료:

- Supabase Auth
- 가입 신청·승인·거절
- 계정 상태
- 비밀번호 재설정
- 부서·직급·직책·역할
- 조직 관리
- 최고 관리자 Bootstrap
- 감사 로그
- RLS
- Preview 검증

원격 마이그레이션:

```text
202607300001_groupware_auth_membership.sql
```

## 2026-07-31 — Phase G3 대시보드·게시판

브랜치:

```text
groupware/dashboard-boards
```

초기 G3 완료 커밋:

```text
2bbad81b9d2ebb9e16a86c343bf76ac15ba52933
feat: add board inline images and admin usage monitoring
```

완료:

- 게시판 빌더
- 게시판 그룹·카테고리
- 게시판별 권한
- 게시글·댓글
- 본문 이미지
- Tiptap 기반 에디터
- 비공개 Storage
- 이미지 리사이즈와 검증
- attachment ID 도용 차단
- 시스템 사용량 화면
- Storage 정리 후보

원격 마이그레이션:

```text
202607310001_groupware_dashboards_boards.sql
202607310002_fix_board_author_permissions.sql
202607310003_board_inline_images.sql
202607310004_admin_system_usage.sql
202607310005_fix_inline_upload_policy_lint.sql
```

Edge Function:

```text
board-image-upload
```

## 2026-07-31 — Phase G3 보완: 다중 역할·프로필

최종 커밋:

```text
25f47d13def530f65d5641ad6389a34753d90b88
feat: add role switching and employee profiles
```

완료:

- 한 계정 여러 역할
- 활성 역할 전환
- employee ↔ super_admin 전환
- 새로고침 후 유지
- employee 모드 관리자 차단
- localStorage 권한 상승 차단
- 마지막 super_admin 보호
- 직원 프로필
- 회원가입 프로필 확장
- 상단 사용자 정보
- 대시보드 프로필 카드
- 프로필 사진 비공개 Storage
- 관리자 직원 검색·편집·역할 배정

원격 마이그레이션:

```text
202607310006_multi_roles_and_employee_profiles.sql
202607310007_admin_file_cleanup_details.sql
```

Edge Function:

```text
profile-photo-upload
```

검증:

- DB lint 오류 0건
- 1440·1024·390·320px 통과
- 공개 사이트 회귀 통과
- 게시판·이미지·사용량 회귀 통과
- 콘솔 오류 0건
- `npm run build` 성공
- Git 로컬·원격 차이 0/0

Preview:

```text
https://jeakyung-preview-9jp65p8q0-3372.vercel.app
```

## 2026-07-31 — Phase G4 준비

전자결재 전체 지시서 작성 완료.

예정 범위:

- 양식 빌더
- 기안
- 결재선
- 순차·병렬·합의·협조
- 승인·반려·보류·회수
- 대결·위임
- 제한적 전결
- 참조·열람
- 첨부파일
- 내부 알림
- 대시보드 연동
- 관리자 결재 시스템

실제 착수 전 모델 오류 발생:

```text
Gemini 3.1 Pro Preview
HTTP 429
Quota exceeded
free tier limit: 0
```

판단:

- 코드나 저장소 문제 아님
- 모델/API 프로젝트의 무료 할당량 또는 결제 설정 문제
- 사용 가능한 Codex 또는 다른 정상 모델에서 동일 G4 지시로 재개해야 함

## 다음 로그 작성 규칙

새 작업 완료 후 아래 형식으로 추가한다.

```text
## YYYY-MM-DD — Phase/작업명

브랜치:
커밋:
마이그레이션:
Edge Function:
완료 기능:
보안 검증:
UI 검증:
회귀 검사:
Push:
Preview:
남은 항목:
```
