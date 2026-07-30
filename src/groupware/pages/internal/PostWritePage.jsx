import { useParams } from 'react-router-dom';

import PageScaffold from '../../components/PageScaffold.jsx';

export default function PostWritePage() {
  const { boardSlug } = useParams();
  return <PageScaffold eyebrow="WRITE" title="게시글 작성" description={`게시판 식별자: ${boardSlug}`} notice="현재는 작성 폼 구조만 계획되어 있으며 게시글을 저장하지 않습니다." sections={[
    { title: '제목과 카테고리', description: '필수 제목과 게시판 설정에 맞는 카테고리를 선택합니다.' },
    { title: '본문 편집', description: '허용된 서식만 안전하게 입력하는 편집 영역을 제공합니다.' },
    { title: '첨부파일', description: '크기, 형식과 보안 정책을 통과한 파일만 등록합니다.' },
    { title: '게시 옵션', description: '권한이 있을 때 공지와 익명 옵션을 제공합니다.' },
  ]} />;
}
