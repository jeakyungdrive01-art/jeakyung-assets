import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext.jsx';
import ProfileAvatar from './ProfileAvatar.jsx';

function value(input) { return input || '미등록'; }
function tenure(hireDate) {
  if (!hireDate) return '미등록';
  const start = new Date(`${hireDate}T00:00:00`);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) return '입사 예정';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years ? `${years}년 ` : ''}${rest}개월`;
}

export default function ProfileCard() {
  const auth = useAuth();
  const profile = auth.profile ?? {};
  const displayName = profile.display_name || profile.preferred_name || profile.full_name || profile.name || '사용자';
  const activeRoleName = auth.assignedRoles.find((role) => role.code === auth.activeRole)?.name || auth.activeRole || '미등록';
  return (
    <section className="gw-profile-card" aria-labelledby="my-profile-card-title">
      <div className="gw-profile-card-hero"><ProfileAvatar profile={profile} size="large" /><div><span className="gw-eyebrow">MY PROFILE</span><h2 id="my-profile-card-title">{displayName}</h2><p>{value(profile.department_name)} · {value(profile.position_name)} · {value(profile.job_title_name)}</p><span className="gw-active-role-badge">현재 {activeRoleName}</span></div><Link className="gw-secondary-button" to="/profile">내 프로필 편집</Link></div>
      <dl className="gw-profile-facts">
        <div><dt>사번</dt><dd>{value(profile.employee_number)}</dd></div><div><dt>입사일</dt><dd>{value(profile.hire_date)}</dd></div><div><dt>재직 기간</dt><dd>{tenure(profile.hire_date)}</dd></div><div><dt>회사 이메일</dt><dd>{value(profile.company_email)}</dd></div><div><dt>휴대전화</dt><dd>{value(profile.mobile_phone)}</dd></div><div><dt>사무실 전화</dt><dd>{value(profile.office_phone)}{profile.extension_number ? ` · 내선 ${profile.extension_number}` : ''}</dd></div><div><dt>근무지</dt><dd>{value(profile.work_location)}</dd></div><div><dt>보유 역할</dt><dd>{auth.assignedRoles.map((role) => role.name).join(', ') || '미등록'}</dd></div>
      </dl>
    </section>
  );
}
