# 데이터베이스 논리 스키마

## 범위

Supabase PostgreSQL에 적용할 논리 모델이다. G2 스키마는 `supabase/migrations/202607300001_groupware_auth_membership.sql`에서 재현한다.

## 인증·조직

| 테이블 | 주요 책임 |
| --- | --- |
| `profiles` | `auth.users`와 1:1 연결된 프로필, 신청·최종 조직과 회원 상태 |
| `departments` | 상위 부서, 명칭, 정렬, 상태와 보관 정보 |
| `positions` | 직급 코드, 명칭, 정렬과 활성 상태 |
| `job_titles` | 직책 코드, 명칭, 정렬과 활성 상태 |
| `roles` | 다섯 개 고정 역할 정의 |
| `user_role_assignments` | 사용자 다중 역할과 부여자·시각 |
| `audit_logs` | 승인·거절·조직 변경의 이전/이후 값과 작업자 |

가입 신청은 별도 권한 테이블로 사용하지 않고 `profiles.requested_*`에 보존한다. 승인 시 `department_id`, `position_id`, `job_title_id`와 역할을 관리자 RPC가 확정한다.

## 업무 모듈

| 모듈 | 주요 테이블 후보 |
| --- | --- |
| 게시판 | `boards`, `board_categories`, `board_permissions`, `posts`, `comments`, `attachments`, `board_favorites` |
| 전자결재 | `approval_templates`, `approval_documents`, `approval_steps`, `approval_actions` |
| 일정 | `calendars`, `events`, `event_attendees` |
| 파일 | `file_spaces`, `file_entries`, `file_permissions` |
| 알림 | `notifications`, `notification_preferences` |
| 감사 | `audit_logs` |

## 공통 필드 원칙

- 식별자는 UUID를 기본으로 한다.
- `created_at`, `updated_at`, 작성·수정 주체를 기록한다.
- 상태, 비활성·보관 시각과 사유를 별도 필드로 둔다.
- 업무 이력이 있는 조직·계정·게시판은 물리 삭제보다 보관을 우선한다.
- 공개 이름과 내부 추적 식별자를 분리한다.
- 시간은 UTC로 저장하고 UI에서 Asia/Seoul로 표시한다.

## 관계와 무결성

- 부서는 자기 자신이나 하위 부서를 상위로 지정할 수 없다.
- 구성원 이동은 과거 소속 기간을 보존한다.
- 게시글·결재·일정·파일이 참조하는 사용자를 임의 삭제하지 않는다.
- 첨부 메타데이터와 Storage 객체 권한을 같은 정책으로 관리한다.
- 감사 로그는 일반 관리자도 임의 수정·삭제할 수 없게 한다.

RLS와 서버 함수 기준은 [`31_SECURITY_AND_RLS.md`](31_SECURITY_AND_RLS.md)를 따른다.
