import { useParams } from 'react-router-dom';

import PageScaffold from '../../components/PageScaffold.jsx';

export default function BoardPage() {
  const { boardSlug } = useParams();
  return <PageScaffold eyebrow="BOARD" title="게시판 목록" description={`게시판 식별자: ${boardSlug}`} sections={[
    { title: '카테고리와 공지', description: '게시판 설정에 따라 카테고리와 상단 공지를 표시합니다.' },
    { title: '글 목록', description: '읽기 권한이 있는 글의 제목, 작성자 정보와 상태를 표시합니다.' },
    { title: '검색과 필터', description: '제목, 작성자, 기간과 카테고리 조건을 제공합니다.' },
    { title: '페이지 이동', description: '목록 크기와 정렬 기준에 맞는 페이지 이동을 제공합니다.' },
  ]} />;
}
