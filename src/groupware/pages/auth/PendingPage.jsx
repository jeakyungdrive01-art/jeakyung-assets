import { Link, useLocation } from 'react-router-dom';

export default function PendingPage() {
  const location = useLocation();
  const email = location.state?.email || '신청 시 입력한 회사 이메일';
  const foundationOnly = location.state?.foundationOnly;

  return (
    <section className="gw-auth-card gw-status-card" aria-labelledby="pending-title">
      <div className="gw-status-symbol" aria-hidden="true">✓</div>
      <div className="gw-auth-card-heading">
        <span className="gw-eyebrow">APPROVAL PENDING</span>
        <h1 id="pending-title">가입 승인 대기</h1>
        <p>가입 신청이 접수되면 관리자가 임직원 정보와 소속을 확인합니다.</p>
      </div>
      <div className="gw-pending-email">
        <span>확인할 이메일</span>
        <strong>{email}</strong>
      </div>
      {foundationOnly && (
        <div className="gw-notice gw-notice--warning" role="status">
          현재는 UI 기반 단계이므로 입력 내용이 서버에 저장되거나 실제 신청으로 접수되지 않았습니다.
        </div>
      )}
      <ol className="gw-status-steps">
        <li><span>1</span><div><strong>신청 정보 확인</strong><p>관리자가 회사 이메일과 소속 정보를 확인합니다.</p></div></li>
        <li><span>2</span><div><strong>승인 또는 보완 안내</strong><p>승인 결과와 필요한 안내는 향후 인증 시스템에서 제공합니다.</p></div></li>
        <li><span>3</span><div><strong>그룹웨어 이용</strong><p>승인된 계정만 내부 업무 화면에 접근할 수 있습니다.</p></div></li>
      </ol>
      <Link className="gw-primary-button gw-button-link" to="/login">로그인 화면으로 돌아가기</Link>
      <p className="gw-help-text">문의: 경영지원부 · 070-800-8100 · sk@jeakyung.com</p>
    </section>
  );
}
