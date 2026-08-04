# 현재 상태

[문서 목록](./00_INDEX.md) · [전체 계획](./03_MASTER_PLAN.md) · [진행 로그](./05_PROGRESS_LOG.md)

기준 시각: **2026-08-01 00:15 KST**

## 전체 진행률

전체 기능 기준 약 **60~65% 완료**로 추정한다.

기반·인증·조직·게시판·다중 역할·프로필과 전자결재 G4-1 보안 기반까지 완료했다. 이후 전자결재 실제 처리 흐름, 일정, 메일, 운영 전환은 별도 검증이 필요하다.

## 현재 Git 상태

현재 작업 브랜치:

```text
groupware/approval
```

현재 최신 커밋:

```text
b10fac9 fix(groupware): align delegated approval document access
```

직전 기능 커밋:

```text
779084e feat(groupware): secure approval inbox and policies
```

확인된 상태:

- 로컬 브랜치와 원격 `origin/groupware/approval` 동기화 완료
- `main` 미변경
- Production 미변경
- 도메인, CNAME, DNS 미변경
- Supabase 원격 전자결재 마이그레이션 미적용
- Vercel Preview 미배포
- PR 미생성
- force push 없음
- `npm run build` 성공
- `git diff --check` 오류 없음

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

기존 원격 환경 확인 결과:

- 원격 DB 최신 상태
- DB lint 오류 0건
- 신규 public 테이블 RLS 검증 완료
- JWT 검증 활성화
- 비인증 업로드 401
- 일반 사용자의 관리자 RPC 차단
- 비공개 Storage 직접 접근 차단

### G4 로컬 검증 상태

전자결재 신규 마이그레이션:

```text
202607310008_groupware_approval_core.sql
202607310009_groupware_approval_notifications_storage.sql
202607310010_groupware_approval_security_logic.sql
202607310011_groupware_approval_rls_inbox.sql
```

로컬 검증 결과:

- Supabase CLI 로컬 환경 시작 성공
- `npx supabase db reset` 성공
- 전체 마이그레이션 `001`부터 `011`까지 순차 적용 성공
- 011 전자결재 RLS 및 결재함 RPC 마이그레이션 적용 성공
- 위임 결재 범위 함수와 문서 열람 권한 함수 생성 성공
- 로컬 컨테이너 재시작 성공
- `supabase/seed.sql` 미존재 경고만 발생
- 원격 Supabase에는 아직 적용하지 않음

로컬 검증 시 사용한 CLI 버전:

```text
Supabase CLI v2.110.0
```

검증 중 `v2.111.0` 업데이트 안내가 있었으나 현재 버전으로 전체 마이그레이션 검증이 성공했으므로 작업 중간에는 CLI 버전을 변경하지 않았다.

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

- 기존 Preview 배포 성공
- Vercel Authentication 유지
- Shareable Link 없음
- Automation Bypass Secret 없음
- G4 변경 Preview 미배포
- Production 승격 없음

## 공개 사이트 상태

완료:

- React 전환
- `/` 정상
- `/privacy/` 정상
- 반응형 검증
- 기존 Vercel Preview 검증

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

### 전자결재 G4-1 보안 기반

완료:

- 전자결재 핵심 데이터 모델 마이그레이션 작성
- 전자결재 알림 및 Storage 기반 마이그레이션 작성
- 기본 결재 제출 로직 작성
- 결재함 조회를 클라이언트 전체 조회 방식에서 서버 RPC 방식으로 전환
- `get_my_approval_inbox()` RPC 구현
- 결재 문서 접근 판정 함수 구현
- 카테고리·양식·양식 버전 조회 RLS 보강
- 문서 및 하위 엔터티 조회 RLS 보강
- 기안자 수정 가능 상태 제한
- Supabase 최신 `auth.getUser()` API 적용
- 결재함 로딩·빈 상태·오류·재시도 UI 처리
- 문서번호 미발급 표시
- 위임 문서 배지 표시
- 누락된 대결·위임 라우트 컴포넌트 추가
- 위임 결재함과 문서 상세 접근 권한 규칙 통일

위임 접근 보완:

- `has_active_approval_delegation()` 함수 추가
- `all`, `template`, `department` 위임 범위 처리
- 위임 시작일·종료일 확인
- `scheduled`, `active` 상태 확인
- 위임 문서가 결재함에는 보이지만 상세 페이지에서 RLS에 막힐 수 있던 불일치 수정
- `SECURITY DEFINER` 함수에 명시적 `search_path`와 `row_security` 설정
- 함수 실행 권한을 `authenticated`로 제한

검증:

- `npx supabase db reset` 성공
- 전체 로컬 마이그레이션 성공
- Vite Production build 성공
- 206개 모듈 변환 성공
- `git diff --check` 오류 없음

## 모바일 상태

검증 화면:

```text
1440px
1024px
390px
320px
```

기존 통과 항목:

- App Shell
- Drawer
- 사용자 메뉴
- 프로필 카드
- 게시판 목록·상세·작성
- 본문 이미지
- 관리자 화면
- 가로 넘침 없음
- 콘솔 오류 없음

전자결재 신규 화면의 실제 모바일 UI 검수는 Vercel Preview 단계에서 수행한다.

실제 iPhone Safari와 Android 실기기 최종 검수는 운영 전 단계에서 수행한다.

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

## 현재 작업 상태

기존 모델 할당량 문제는 더 이상 현재 착수 장애가 아니다.

G4-1 보안 기반과 결재함 RPC 작업은 완료되었으며 로컬 Supabase 전체 마이그레이션과 프런트엔드 빌드도 통과했다.

다음 작업은 원격 적용이 아니라 로컬 테스트 데이터 기반 기능 검증이다.

우선순위:

1. 직접 결재자 결재함 조회
2. 위임 결재자 결재함 조회
3. 위임 문서 상세 접근
4. 권한 없는 사용자의 직접 URL 접근 차단
5. 참조·열람함 전용 조회 설계
6. 실제 대결·위임 관리 화면 구현

사용자 승인 전에는 다음 작업을 수행하지 않는다.

- Supabase 원격 마이그레이션 적용
- Vercel 배포
- Production 변경
- `main` 병합
- 도메인·DNS·CNAME 변경
