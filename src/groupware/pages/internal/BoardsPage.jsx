import PageScaffold from '../../components/PageScaffold.jsx';
import { PAGE_MODULES, toSections } from '../../config/pageModules.js';

export default function BoardsPage() {
  return <PageScaffold eyebrow="BOARDS" title="게시판" description="즐겨찾기부터 전사·부서·프로젝트 게시판까지 권한에 맞게 구성합니다." sections={toSections(PAGE_MODULES.boards)} />;
}
