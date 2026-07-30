import { useParams } from 'react-router-dom';

import PageScaffold from '../../components/PageScaffold.jsx';

export default function PostDetailPage() {
  const { boardSlug, postId } = useParams();
  return <PageScaffold eyebrow="POST" title="게시글 상세" description={`게시판 ${boardSlug} · 게시글 ${postId}`} sections={[
    { title: '본문과 작성자', description: '표시 정책에 맞는 작성자 정보와 안전하게 처리된 본문을 제공합니다.' },
    { title: '첨부파일', description: '권한과 보안 검사를 통과한 첨부 목록을 표시합니다.' },
    { title: '댓글', description: '게시판 설정과 댓글 권한에 따라 대화를 제공합니다.' },
    { title: '권한 작업', description: '수정, 삭제, 공지와 관리 작업을 서버 권한에 따라 제공합니다.' },
  ]} />;
}
