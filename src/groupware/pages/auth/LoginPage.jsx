import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import FormStatus from '../../components/FormStatus.jsx';
import PasswordField from '../../components/PasswordField.jsx';

export default function LoginPage() {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const wasProtected = location.state?.reason === 'authentication-required';

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('현재는 화면 구축 단계로 로그인 요청을 보내지 않습니다. Supabase 인증 연결 후 사용할 수 있습니다.');
  };

  return (
    <section className="gw-auth-card" aria-labelledby="login-title">
      <div className="gw-auth-card-heading">
        <span className="gw-eyebrow">EMPLOYEE ACCESS</span>
        <h1 id="login-title">그룹웨어 로그인</h1>
        <p>승인된 재경닷컴 임직원 계정으로 이용하는 내부 시스템입니다.</p>
      </div>

      {wasProtected && (
        <div className="gw-notice gw-notice--warning" role="status">
          내부 페이지를 이용하려면 승인된 계정으로 로그인해야 합니다.
        </div>
      )}

      <form className="gw-form" onSubmit={handleSubmit} aria-describedby="login-status">
        <div className="gw-field">
          <label htmlFor="login-email">회사 이메일</label>
          <input id="login-email" name="email" type="email" autoComplete="username" placeholder="name@jeakyung.com" required />
        </div>
        <PasswordField id="login-password" name="password" label="비밀번호" autoComplete="current-password" />
        <label className="gw-check-row">
          <input type="checkbox" name="remember" />
          <span>로그인 상태 유지</span>
        </label>
        <FormStatus id="login-status" message={message} />
        <button className="gw-primary-button" type="submit">로그인</button>
      </form>

      <div className="gw-auth-links">
        <Link to="/reset-password">비밀번호를 잊으셨나요?</Link>
        <Link to="/signup">임직원 가입 신청</Link>
      </div>

      <div className="gw-account-notice">
        <strong>아직 승인되지 않은 계정인가요?</strong>
        <p>가입 신청 후 관리자의 승인이 완료되어야 로그인할 수 있습니다.</p>
        <Link to="/pending">승인 대기 안내 확인</Link>
      </div>
    </section>
  );
}
