# 현재 상태

[문서 목록](./00_INDEX.md) · [전체 계획](./03_MASTER_PLAN.md) · [진행 로그](./05_PROGRESS_LOG.md)

기준 시각: **2026-08-01 00:05 KST**

## 전체 진행률

전체 기능 기준 약 **55~60% 완료**로 추정한다.

완료된 기반의 비중이 크기 때문에 이후 기능 개발은 초반보다 빨라질 수 있으나, 전자결재·일정·메일·운영 전환은 별도 검증이 필요하다.

## 현재 Git 상태

현재 작업 브랜치:

```text
groupware/approval

## Supabase 상태

프로젝트:

```text
jeakyung-dotcom
```

Project Ref:

```text
vzswlvumcdxnryrfwkkl
```

원격 적용 완료 마이그레이션:

```text
202607300001_groupware_auth_membership.sql
202607310001_groupware_dashboards_boards.sql
202607310002_fix_board_author_permissions.sql
202607310003_board_inline_images.sql
202607310004_admin_system_usage.sql
202607310005_fix_inline_upload_policy_lint.sql
202607310006_multi_roles_and_employee_profiles.sql
202607310007_admin_file_cleanup_details.sql
```

활성 Edge Functions:

```text
board-image-upload
profile-photo-upload
```

확인 결과:

- 원격 DB 최신 상태
- DB lint 오류 0건
- 신규 public 테이블 RLS 검증 완료
- JWT 검증 활성화
- 비인증 업로드 401
- 일반 사용자의 관리자 RPC 차단
- 비공개 Storage 직접 접근 차단

## Vercel 상태

프로젝트:

```text
jeakyung-preview
```

최근 확인된 Preview:

```text
https://jeakyung-preview-9jp65p8q0-3372.vercel.app
```

상태:

- Preview 배포 성공
- Vercel Authentication 유지
- Shareable Link 없음
- Automation Bypass Secret 없음
- Production 승격 없음

## 공개 사이트 상태

완료:

- React 전환
- `/` 정상
- `/privacy/` 정상
- 반응형 검증
- Vercel Preview 검증

현재 운영 홈페이지의 기존 그룹웨어 링크:

```text
https://jeakyung.quv.kr
```

중요:

- 새 그룹웨어 운영 전환 승인 전까지 기존 링크를 유지한다.
- 공개 사이트 코드는 그룹웨어 Phase에서 수정하지 않는다.

## 그룹웨어 완료 기능

### 기반과 인증

- React Router SPA
- App Shell
- 모바일 Drawer
- 로그인·로그아웃
- 회원가입 신청
- 가입 승인·거절
- pending, approved, rejected, locked, resigned 상태
- 비밀번호 재설정
- ProtectedRoute
- AdminRoute
- 감사 로그

### 조직과 회원

- 부서
- 직급
- 직책
- 역할
- 조직 순서
- 활성·비활성
- 관리자 회원 승인
- 직원 프로필 관리

### 다중 역할과 프로필

- 한 사용자에게 여러 역할 배정
- `employee ↔ super_admin` 활성 역할 전환
- 새로고침 후 활성 역할 유지
- employee 모드에서 관리자 메뉴·경로·RPC 차단
- localStorage 조작 권한 상승 차단
- 마지막 super_admin 제거 차단
- 상단 이름·소속·현재 역할 표시
- 대시보드 최상단 프로필 카드
- 내 프로필 편집
- 프로필 사진 비공개 Storage
- 관리자 전용 필드 사용자 수정 차단

### 대시보드와 게시판

- 관리자 대시보드 위젯
- 사용자 위젯 설정
- 게시판 빌더
- 게시판 그룹·카테고리
- 게시판별 권한
- 동적 Sidebar
- 게시글·댓글
- 익명 게시판
- 본문 이미지
- 첨부파일
- 비공개 Storage
- signed URL
- 관리자 시스템 사용량
- 용량 경고와 정리 후보

## 최신 커밋
b10fac9 fix(groupware): align delegated approval document access

## 직전 기능 커밋
779084e feat(groupware): secure approval inbox and policies

## 모바일 상태

검증 화면:

```text
1440px
1024px
390px
320px
```

통과 항목:

- App Shell
- Drawer
- 사용자 메뉴
- 프로필 카드
- 게시판 목록·상세·작성
- 본문 이미지
- 관리자 화면
- 가로 넘침 없음
- 콘솔 오류 없음

실제 iPhone Safari와 Android 실기기 최종 검수는 운영 전 단계에서 수행한다.

## 아직 시작하지 않은 핵심 기능

## 아직 완료되지 않은 핵심 기능

### 전자결재

- 실제 사용자 기반 결재함 데이터 테스트
- 직접 결재자 시나리오 테스트
- 위임 결재자 시나리오 테스트
- 참조·열람함 전용 RPC
- 실제 대결·위임 관리 페이지
- 양식 빌더
- 양식 버전 발행
- 기안 생성 트랜잭션 RPC
- 승인·반려·보류·회수 처리 RPC
- 병렬·합의·협조 결재 처리
- 제한적 전결
- 첨부파일 실제 업로드
- 내부 알림 실제 연동
- 대시보드 전자결재 위젯
- 관리자 전자결재 화면
- Vercel Preview UI 검수
- Supabase 원격 적용
- PR 및 `main` 병합

### 후속 Phase

- 일정·캘린더
- 공통 알림 확장
- 일반 파일함
- mail.jeakyung.com 연동
- 운영 Production 전환
- 공개 사이트 그룹웨어 링크 교체
- 유지보수·디자인 토큰·팝업 관리자
- 일정·캘린더
- 공통 알림 확장
- 일반 파일함
- mail.jeakyung.com 연동
- 운영 Production 전환
- 공개 사이트 그룹웨어 링크 교체
- 유지보수·디자인 토큰·팝업 관리자

## 현재 중단 사유

Phase G4 지시문은 준비되었지만 실제 착수는 아직 확인되지 않았다.

최근 사용한 Gemini 3.1 Pro Preview는 다음 오류로 응답하지 못했다.

```text
HTTP 429
Quota exceeded
free tier request/input token limit: 0
```

이는 저장소나 코드 오류가 아니라 해당 Gemini API 프로젝트의 사용량·결제 설정 문제다.

다음 작업자는 사용 가능한 Codex 또는 다른 정상 모델에서 G4를 시작해야 한다.
