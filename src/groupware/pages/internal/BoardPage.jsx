import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getBoardOverview, getBoardPosts } from '../../services/boardService.js';

export default function BoardPage() {
  const { boardSlug } = useParams(); const [params, setParams] = useSearchParams();
  const [overview, setOverview] = useState(null); const [posts, setPosts] = useState({ items: [] }); const [error, setError] = useState('');
  const search = params.get('q') ?? ''; const category = params.get('category') || null; const page = Number(params.get('page') ?? 1);
  useEffect(() => { Promise.all([getBoardOverview(boardSlug), getBoardPosts(boardSlug, { search, category, page })]).then(([info, list]) => { setOverview(info); setPosts(list); }).catch(() => setError('게시판 접근 권한이 없거나 게시판을 불러오지 못했습니다.')); }, [boardSlug, search, category, page]);
  if (error) return <div className="gw-route-state"><div className="gw-notice gw-notice--warning" role="alert">{error}<br /><Link to="/boards">게시판 목록으로</Link></div></div>;
  if (!overview) return <p className="gw-empty-state" role="status">게시판을 불러오고 있습니다.</p>;
  return <article className="gw-page" aria-labelledby="board-title"><header className="gw-page-header"><div><span className="gw-eyebrow">{overview.board.board_type}</span><h1 id="board-title">{overview.board.name}</h1><p>{overview.board.description}</p></div>{overview.permissions.create && <Link className="gw-primary-button" to={`/boards/${boardSlug}/write`}>글쓰기</Link>}</header>
    <form className="gw-board-toolbar" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('search'); setParams((current) => { current.set('q', value); current.set('page', '1'); return current; }); }}><input name="search" defaultValue={search} placeholder="제목과 내용 검색" aria-label="게시판 검색" /><select value={category ?? ''} onChange={(e) => setParams(e.target.value ? { q: search, category: e.target.value, page: '1' } : { q: search, page: '1' })} aria-label="카테고리"><option value="">전체 카테고리</option>{overview.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="submit">검색</button></form>
    <div className={`gw-post-list gw-post-list--${overview.board.board_type}`}>{posts.items.map((post) => <article key={post.id} className={post.is_pinned ? 'is-pinned' : ''}><div><span>{post.category ?? post.prefix ?? (post.is_notice ? '공지' : '일반')}</span><h2><Link to={`/boards/${boardSlug}/posts/${post.id}`}>{post.title}</Link></h2><p>{post.author_name} · {new Date(post.created_at).toLocaleDateString('ko-KR')} · 조회 {post.view_count} · 댓글 {post.comment_count}</p></div>{post.attachment_count > 0 && <span>첨부 {post.attachment_count}</span>}</article>)}</div>
    {posts.items.length === 0 && <p className="gw-empty-state">등록된 게시글이 없습니다.</p>}<nav className="gw-pagination" aria-label="게시글 페이지"><button type="button" disabled={page <= 1} onClick={() => setParams({ q: search, ...(category ? { category } : {}), page: String(page - 1) })}>이전</button><span>{page}페이지</span><button type="button" disabled={posts.items.length < posts.page_size} onClick={() => setParams({ q: search, ...(category ? { category } : {}), page: String(page + 1) })}>다음</button></nav>
  </article>;
}
