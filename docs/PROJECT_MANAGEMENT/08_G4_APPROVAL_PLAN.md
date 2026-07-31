# Phase G4 전자결재 계획

[문서 목록](./00_INDEX.md) · [현재 상태](./02_CURRENT_STATUS.md) · [전체 계획](./03_MASTER_PLAN.md)

상태: **지시서 준비 완료, 실제 착수 미확인**

## 시작 기준

기준 브랜치:

```text
groupware/dashboard-boards
```

기준 HEAD:

```text
25f47d13def530f65d5641ad6389a34753d90b88
```

새 브랜치:

```text
groupware/approval
```

## 목표

사내에서 실제 사용할 수 있는 전자결재 핵심 기능을 구현한다.

### 양식

- 양식 분류
- 양식 빌더
- 필드 설정
- 기본 결재선
- 양식 버전 발행
- 기존 문서 버전 고정
- 양식 비활성·보관·복원

### 문서

- 기안
- 임시 저장
- 제출
- 문서번호
- Revision
- 재기안
- 인쇄용 화면
- 첨부파일

### 결재 흐름

- 순차 결재
- 병렬 전체 승인
- 병렬 필수 인원
- 합의
- 협조
- 승인
- 반려
- 보류
- 보류 해제
- 회수
- 관리자 취소

### 권한과 조직

- 특정 사용자
- 기안자 부서장
- 팀장
- 특정 부서·역할
- 제출 시 실제 사용자 Snapshot
- 조직 변경 후에도 진행 문서 결재선 유지
- 본인 결재 기본 차단
- 차례가 아닌 결재 차단

### 대결·위임

- 기간
- 전체 또는 특정 양식
- 순환 위임 차단
- 만료
- 원 결재자와 실제 처리자 표시
- 감사 로그

### 전결

- 기본 비활성
- 양식·부서·역할·금액 조건
- 서버 재검증
- 적용 규칙 기록
- super_admin 자동 전결 금지

### 참조·열람

- 참조
- 열람자
- 읽음 시각
- 읽지 않은 개수
- 직접 URL 차단

### 알림

그룹웨어 내부 알림만 구현한다.

- 결재 요청
- 승인
- 반려
- 보류
- 회수
- 참조
- 위임
- Badge
- 읽음 처리
- 관련 문서 이동

외부 이메일, 모바일 Push는 제외한다.

### 대시보드

실제 데이터로 연결:

- 처리할 결재
- 보류
- 진행 중 기안
- 반려
- 최근 승인 완료
- 읽지 않은 참조
- 위임 상태

## 예상 데이터 영역

- `approval_categories`
- `approval_templates`
- `approval_template_versions`
- `approval_number_sequences`
- `approval_documents`
- `approval_document_revisions`
- `approval_lines`
- `approval_line_assignees`
- `approval_actions`
- `approval_references`
- `approval_comments`
- `approval_attachments`
- `approval_delegations`
- `approval_authority_rules`
- `approval_saved_lines`
- `groupware_notifications`

최종 스키마는 기존 조직·역할·감사 로그와 충돌하지 않게 조정할 수 있다.

## Storage

권장 비공개 버킷:

```text
groupware-approval-attachments
```

기본 제한:

- 파일당 20MB
- 문서당 10개
- 문서 합계 100MB
- 위험 파일 차단
- 짧은 signed URL
- 다른 문서 attachment ID 도용 차단
- soft delete와 고아 파일 후보

## 권장 마이그레이션

```text
202607310008_groupware_approval_core.sql
202607310009_groupware_approval_notifications_storage.sql
```

번호가 이미 사용되었으면 현재 원격 최신 번호 다음으로 조정한다.

## 주요 E2E

- 기안자
- 중간 결재자
- 최종 결재자
- employee 모드 관리자 차단
- super_admin 모드 관리자 허용
- 순차 조기 승인 차단
- 병렬 조건
- 반려 후 Revision
- 첫 처리 전 회수
- 처리 후 회수 차단
- 위임 기간·범위
- 전결 조건
- 첨부 직접 접근 차단
- 알림 타인 접근 차단

## 제외

- 메일 발송
- mail.jeakyung.com 연동
- 일정 연동
- 모바일 Push
- 일반 파일함
- 급여·인사평가·근태
- 공인전자서명 주장
- Production과 도메인

## 현재 착수 장애

최근 Gemini 3.1 Pro Preview 호출은 HTTP 429로 실패했다.

```text
Quota exceeded
free tier limit: 0
```

새 작업자는 사용 가능한 모델로 전환한 뒤 G4 지시를 다시 제출해야 한다. 동일 메시지 재전송만으로는 해결되지 않을 수 있다.
