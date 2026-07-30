import PageScaffold from '../../components/PageScaffold.jsx';
import { PAGE_MODULES, toSections } from '../../config/pageModules.js';

export default function AdminPage() {
  return <PageScaffold eyebrow="ADMINISTRATION" title="관리자" description="회원·조직·권한과 시스템 운영을 감사 가능한 절차로 관리합니다." notice="관리 기능은 향후 서버 권한 검증과 Supabase RLS 연결 후에만 활성화됩니다." sections={toSections(PAGE_MODULES.admin)} />;
}
