import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import FormStatus from '../../components/FormStatus.jsx';
import PasswordField from '../../components/PasswordField.jsx';
import SupabaseConfigurationNotice from '../../components/SupabaseConfigurationNotice.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSafeAuthMessage, getSignupOptions } from '../../services/authService.js';

const EMPTY_OPTIONS = { departments: [], positions: [], job_titles: [] };

export default function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [optionsLoading, setOptionsLoading] = useState(auth.configured);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.configured) return undefined;
    let active = true;
    getSignupOptions()
      .then((data) => {
        if (active) setOptions({ ...EMPTY_OPTIONS, ...(data ?? {}) });
      })
      .catch(() => {
        if (active) setError('가입 선택 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => { active = false; };
  }, [auth.configured]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    if (form.get('password') !== form.get('passwordConfirmation')) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await auth.signUp({
        name: String(form.get('name')).trim(),
        email: String(form.get('email')).trim(),
        phone: String(form.get('phone')).trim(),
        password: String(form.get('password')),
        requestedDepartmentId: String(form.get('requestedDepartmentId')),
        requestedPositionId: String(form.get('requestedPositionId')),
        requestedJobTitleId: String(form.get('requestedJobTitleId')),
      });
      navigate('/pending', {
        replace: true,
        state: { email: form.get('email'), requestSubmitted: true },
      });
    } catch (submitError) {
      setError(getSafeAuthMessage(submitError, '가입 신청을 처리하지 못했습니다. 입력 정보를 확인하고 잠시 후 다시 시도해 주세요.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="gw-auth-card gw-auth-card--wide" aria-labelledby="signup-title">
      <div className="gw-auth-card-heading">
        <span className="gw-eyebrow">MEMBERSHIP REQUEST</span>
        <h1 id="signup-title">임직원 가입 신청</h1>
        <p>신청 정보는 향후 관리자 확인과 승인 후 그룹웨어 계정으로 연결됩니다.</p>
      </div>

      {!auth.configured && <SupabaseConfigurationNotice />}

      <form className="gw-form" onSubmit={handleSubmit} aria-describedby="signup-status">
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
            <select id="signup-department" name="requestedDepartmentId" defaultValue="" required disabled={optionsLoading || !auth.configured}>
              <option value="">부서를 선택해 주세요</option>
              {options.departments.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </div>
          <div className="gw-field">
            <label htmlFor="signup-position">직급</label>
            <select id="signup-position" name="requestedPositionId" defaultValue="" required disabled={optionsLoading || !auth.configured}>
              <option value="">직급을 선택해 주세요</option>
              {options.positions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </div>
          <div className="gw-field gw-field--full">
            <label htmlFor="signup-job-title">직책</label>
            <select id="signup-job-title" name="requestedJobTitleId" defaultValue="" required disabled={optionsLoading || !auth.configured}>
              <option value="">직책을 선택해 주세요</option>
              {options.job_titles.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
            </select>
          </div>
          <PasswordField id="signup-password" name="password" label="비밀번호" autoComplete="new-password" hint="8자 이상의 안전한 비밀번호를 입력해 주세요." minLength={8} />
          <PasswordField id="signup-password-confirmation" name="passwordConfirmation" label="비밀번호 확인" autoComplete="new-password" />
        </div>
        <FormStatus id="signup-status" message={error} tone="error" />
        <button className="gw-primary-button" type="submit" disabled={!auth.configured || optionsLoading || submitting}>
          {submitting ? '가입 신청 중…' : '가입 신청'}
        </button>
      </form>

      <p className="gw-auth-return">이미 승인된 계정이 있나요? <Link to="/login">로그인으로 돌아가기</Link></p>
    </section>
  );
}
