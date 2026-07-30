import { useCallback, useEffect, useState } from 'react';

import MembershipApprovalPanel from '../../components/admin/MembershipApprovalPanel.jsx';
import OrganizationManagementPanel from '../../components/admin/OrganizationManagementPanel.jsx';
import BoardBuilderPanel from '../../components/admin/BoardBuilderPanel.jsx';
import DashboardWidgetPanel from '../../components/admin/DashboardWidgetPanel.jsx';
import { getOrganizationDirectory } from '../../services/organizationService.js';

const EMPTY_DIRECTORY = { departments: [], positions: [], jobTitles: [], roles: [] };

export default function AdminPage() {
  const [directory, setDirectory] = useState(EMPTY_DIRECTORY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDirectory = useCallback(async () => {
    setError('');
    try {
      setDirectory(await getOrganizationDirectory());
    } catch {
      setError('조직·역할 기준 정보를 불러오지 못했습니다. 관리자 권한과 Supabase 연결을 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDirectory(); }, [loadDirectory]);

  return (
    <article className="gw-page gw-admin-page" aria-labelledby="page-title">
      <header className="gw-page-header">
        <div>
          <span className="gw-eyebrow">ADMINISTRATION</span>
          <h1 id="page-title">관리자</h1>
          <p>회원·조직과 대시보드·게시판 구성을 서버 권한 검증과 감사 로그를 거쳐 관리합니다.</p>
        </div>
        <span className="gw-phase-badge">G3 대시보드·게시판</span>
      </header>
      {error && <div className="gw-notice gw-notice--warning" role="alert">{error}</div>}
      {loading ? (
        <p className="gw-empty-state" role="status">관리자 데이터를 불러오고 있습니다.</p>
      ) : (
        <>
          <MembershipApprovalPanel directory={directory} />
          <OrganizationManagementPanel directory={directory} onReload={loadDirectory} />
          <DashboardWidgetPanel directory={directory} />
          <BoardBuilderPanel directory={directory} />
        </>
      )}
    </article>
  );
}
