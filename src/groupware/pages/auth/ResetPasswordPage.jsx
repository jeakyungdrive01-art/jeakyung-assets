import { useState } from 'react';
import { Link } from 'react-router-dom';

import FormStatus from '../../components/FormStatus.jsx';

export default function ResetPasswordPage() {
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('현재는 화면 구축 단계로 재설정 이메일을 발송하지 않습니다. 인증 연동 후 사용할 수 있습니다.');
  };

  return (
    <section className="gw-auth-card" aria-labelledby="reset-title">
      <div className="gw-auth-card-heading">
        <span className="gw-eyebrow">PASSWORD RESET</span>
        <h1 id="reset-title">비밀번호 재설정</h1>
        <p>가입 신청에 사용한 회사 이메일을 입력해 주세요.</p>
      </div>
      <form className="gw-form" onSubmit={handleSubmit} aria-describedby="reset-status">
        <div className="gw-field">
          <label htmlFor="reset-email">회사 이메일</label>
          <input id="reset-email" name="email" type="email" autoComplete="email" placeholder="name@jeakyung.com" required />
        </div>
        <FormStatus id="reset-status" message={message} />
        <button className="gw-primary-button" type="submit">재설정 요청</button>
      </form>
      <p className="gw-auth-return"><Link to="/login">로그인 화면으로 돌아가기</Link></p>
    </section>
  );
}
