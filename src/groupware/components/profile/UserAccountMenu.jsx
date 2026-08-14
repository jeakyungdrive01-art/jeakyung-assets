import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';

export default function UserAccountMenu({ onSignOutError }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const detailsRef = useRef(null);
  const [status, setStatus] = useState('');
  const [switching, setSwitching] = useState('');
  const profile = auth.profile ?? {};
  const displayName = profile.display_name || profile.preferred_name || profile.full_name || profile.name || '사용자';
  const activeRoleName = auth.assignedRoles.find((role) => role.code === auth.activeRole)?.name || auth.activeRole || '역할 확인 중';
  const organizationSummary = `${profile.department_name || '소속 미등록'} · ${profile.job_title_name || profile.position_name || '직급·직책 미등록'} · ${activeRoleName}`;

  const switchRole = async (role) => {
    if (role.code === auth.activeRole || switching) return;
    const confirmation = ['super_admin', 'admin'].includes(role.code)
      ? '관리자 권한으로 전환합니다. 관리자 작업은 감사 로그에 기록됩니다.'
      : `${role.name} 역할로 전환하시겠습니까?`;
    if (!window.confirm(confirmation)) return;
    setSwitching(role.code);
    setStatus('');
    try {
      await auth.switchRole(role.code);
      setStatus(`${role.name} 권한으로 전환했습니다.`);
      detailsRef.current?.removeAttribute('open');
      if (location.pathname !== '/dashboard') navigate('/dashboard', { replace: true });
    } catch {
      setStatus('역할을 전환하지 못했습니다. 배정 상태를 다시 확인해 주세요.');
    } finally {
      setSwitching('');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch {
      onSignOutError('로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <details className="gw-user-menu" ref={detailsRef}>
      <summary aria-label={`${displayName} 사용자 메뉴 열기`}>
        <ProfileAvatar profile={profile} size="small" />
        {/* 상단바는 한 줄로 끝낸다: 이름 옆에 소속·직급만, 활성 역할은 패널에서 확인. */}
        <span className="gw-user-menu-copy"><strong>{displayName}</strong><small title={organizationSummary}>{profile.department_name || '소속 미등록'} · {profile.job_title_name || profile.position_name || '직급 미등록'}</small></span>
        <span aria-hidden="true">⌄</span>
      </summary>
      <div className="gw-user-menu-panel">
        <div className="gw-user-menu-identity"><ProfileAvatar profile={profile} /><div><strong>{displayName}</strong><span>{profile.department_name || '소속 미등록'}</span><span>{profile.job_title_name || profile.position_name || '직급·직책 미등록'}</span><b>{activeRoleName}</b></div></div>
        {auth.assignedRoles.length > 1 && <section aria-labelledby="role-switch-title"><h2 id="role-switch-title">활성 역할 전환</h2><div className="gw-role-switch-list">{auth.assignedRoles.map((role) => <button type="button" key={role.code} aria-pressed={role.code === auth.activeRole} disabled={Boolean(switching)} onClick={() => switchRole(role)}><span>{role.name}</span>{role.code === auth.activeRole && <small>현재 역할</small>}</button>)}</div></section>}
        {status && <p className="gw-user-menu-status" role="status">{status}</p>}
        <div className="gw-user-menu-actions"><Link to="/profile" onClick={() => detailsRef.current?.removeAttribute('open')}>내 프로필</Link><button type="button" onClick={signOut}>로그아웃</button></div>
      </div>
    </details>
  );
}
