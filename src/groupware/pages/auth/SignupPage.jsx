import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormStatus from '../../components/FormStatus.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import { FOUNDATION_DEPARTMENTS, FOUNDATION_OPTIONS_NOTICE, FOUNDATION_POSITIONS } from '../../config/foundationOptions.js';

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('passwordConfirmation')) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setError('');
    navigate('/pending', {
      state: {
        email: form.get('email'),
        foundationOnly: true,
      },
    });
  };

  return (
    <section className="gw-auth-card gw-auth-card--wide" aria-labelledby="signup-title">
      <div className="gw-auth-card-heading">
        <span className="gw-eyebrow">MEMBERSHIP REQUEST</span>
        <h1 id="signup-title">임직원 가입 신청</h1>
        <p>신청 정보는 향후 관리자 확인과 승인 후 그룹웨어 계정으로 연결됩니다.</p>
      </div>

      <form className="gw-form" onSubmit={handleSubmit} aria-describedby="signup-status signup-options-notice">
        <div className="gw-form-grid">
          <div className="gw-field">
            <label htmlFor="signup-name">이름</label>
            <input id="signup-name" name="name" type="text" autoComplete="name" required />
          </div>
          <div className="gw-field">
            <label htmlFor="signup-email">회사 이메일</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="name@jeakyung.com" required />
          </div>
          <div className="gw-field">
            <label htmlFor="signup-phone">연락처</label>
            <input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="010-0000-0000" required />
          </div>
          <div className="gw-field">
            <label htmlFor="signup-department">부서</label>
            <select id="signup-department" name="department" defaultValue="" data-source="foundation-static" required>
              {FOUNDATION_DEPARTMENTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="gw-field gw-field--full">
            <label htmlFor="signup-position">직급 또는 직책</label>
            <select id="signup-position" name="position" defaultValue="" data-source="foundation-static" required>
              {FOUNDATION_POSITIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <PasswordField id="signup-password" name="password" label="비밀번호" autoComplete="new-password" hint="향후 보안 정책 확정 후 최소 길이와 조합 규칙을 적용합니다." />
          <PasswordField id="signup-password-confirmation" name="passwordConfirmation" label="비밀번호 확인" autoComplete="new-password" />
        </div>
        <p className="gw-field-hint" id="signup-options-notice">{FOUNDATION_OPTIONS_NOTICE}</p>
        <FormStatus id="signup-status" message={error} tone="error" />
        <button className="gw-primary-button" type="submit">가입 신청</button>
      </form>

      <p className="gw-auth-return">이미 승인된 계정이 있나요? <Link to="/login">로그인으로 돌아가기</Link></p>
    </section>
  );
}
