import PageScaffold from '../../components/PageScaffold.jsx';
import { PAGE_MODULES, toSections } from '../../config/pageModules.js';

export default function DashboardPage() {
  return <PageScaffold eyebrow="WORKSPACE" title="대시보드" description="오늘 확인해야 할 업무와 소식을 빠르게 파악하는 시작 화면입니다." sections={toSections(PAGE_MODULES.dashboard)} />;
}
