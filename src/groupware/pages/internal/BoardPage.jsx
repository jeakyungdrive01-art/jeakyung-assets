import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getBoardType } from '../../config/boardTypes.js';
import { getAttachmentViewUrl, getBoardOverview, getBoardPosts } from '../../services/boardService.js';

export default function BoardPage() {
  const navigate = useNavigate();
  const { boardSlug } = useParams(); const [params, setParams] = useSearchParams();
  const [overview, setOverview] = useState(null); const [posts, setPosts] = useState({ items: [] }); const [thumbnails, setThumbnails] = useState({}); const [error, setError] = useState('');
  const search = params.get('q') ?? ''; const category = params.get('category') || null; const page = Number(params.get('page') ?? 1);
  useEffect(() => {
    let active = true;
    Promise.all([getBoardOverview(boardSlug), getBoardPosts(boardSlug, { search, category, page })]).then(async ([info, list]) => {
      if (!active) return;
      setOverview(info); setPosts(list); setError(''); setThumbnails({});
      if (info.board.board_type !== 'gallery') return;
      const covers = list.items.filter((item) => item.cover_attachment_id);
      const results = await Promise.allSettled(covers.map(async (item) => [item.id, await getAttachmentViewUrl(item.cover_attachment_id)]));
      if (active) setThumbnails(Object.fromEntries(results.filter((item) => item.status === 'fulfilled').map((item) => item.value)));
    }).catch(() => { if (active) setError('게시판 접근 권한이 없거나 게시판을 불러오지 못했습니다.'); });
    return () => { active = false; };
  }, [boardSlug, search, category, page]);
  if (error) return <div className="gw-route-state"><div className="gw-notice gw-notice--warning" role="alert">{error}<br /><Link to="/boards">게시판 목록으로</Link></div></div>;
  if (!overview) return <p className="gw-empty-state" role="status">게시판을 불러오고 있습니다.</p>;
  const type = getBoardType(overview.board.board_type);
  const isDiscussion = overview.board.board_type === 'discussion';
  const totalPages = Math.max(1, Math.ceil((posts.total_count ?? posts.items.length) / (posts.page_size || 20)));
  const selectCategory = (categoryId) => setParams((current) => {
    if (categoryId) current.set('category', categoryId);
    else current.delete('category');
    current.set('page', '1');
    return current;
  });
  return <article className="gw-page" aria-labelledby="board-title"><header className="gw-page-header"><div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><button type="button" className="gw-back-icon-button" onClick={() => navigate('/boards')} aria-label="게시판 목록으로"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button><div><span className="gw-eyebrow">{type.label}</span><h1 id="board-title">{overview.board.name}</h1><p>{overview.board.description || type.description}</p><div className="gw-board-access-summary" aria-label="내 게시판 권한"><span>읽기 가능</span><span className={overview.permissions.create ? 'is-allowed' : 'is-denied'}>쓰기 {overview.permissions.create ? '가능' : '불가'}</span><span className={overview.permissions.comment ? 'is-allowed' : 'is-denied'}>댓글 {overview.permissions.comment ? '가능' : '불가'}</span></div></div></div>{(overview.board.settings.shortcut_enabled && overview.board.settings.shortcut_url || overview.permissions.create) && <div className="gw-board-header-actions">{overview.board.settings.shortcut_enabled && overview.board.settings.shortcut_url && <a className="gw-secondary-button gw-board-shortcut-button" href={overview.board.settings.shortcut_url} target="_blank" rel="noopener noreferrer" aria-label={`${overview.board.settings.shortcut_label || '바로가기'}, 새 창`}>{overview.board.settings.shortcut_label || '바로가기'}<span aria-hidden="true">↗</span></a>}{overview.permissions.create && <Link className="gw-primary-button gw-board-write-button" to={`/boards/${boardSlug}/write`}>{isDiscussion ? '새 대화 시작' : '글쓰기'}</Link>}</div>}</header>
    {overview.categories.length > 0 && <nav className="gw-board-category-tabs" aria-label="게시판 카테고리"><button type="button" className={!category ? 'is-active' : ''} aria-pressed={!category} onClick={() => selectCategory(null)}>전체</button>{overview.categories.map((item) => <button type="button" key={item.id} className={category === item.id ? 'is-active' : ''} aria-pressed={category === item.id} onClick={() => selectCategory(item.id)}>{item.name}</button>)}</nav>}
    {overview.board.settings.search_enabled !== false && <form className="gw-board-toolbar gw-board-toolbar--search-only" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('search'); setParams((current) => { if (value) current.set('q', value); else current.delete('q'); current.set('page', '1'); return current; }); }}><input name="search" defaultValue={search} placeholder="제목과 내용 검색" aria-label="게시판 검색" /><button type="submit">검색</button></form>}
    <div className={`gw-post-list gw-post-list--${overview.board.board_type}`}>{posts.items.map((post) => <article key={post.id} className={post.is_pinned ? 'is-pinned' : ''}>{overview.board.board_type === 'gallery' && <Link className="gw-gallery-thumbnail" to={`/boards/${boardSlug}/posts/${post.id}`} aria-label={`${post.title} 상세 보기`}>{thumbnails[post.id] ? <img src={thumbnails[post.id]} alt="" /> : <span>대표 이미지 없음</span>}</Link>}{isDiscussion && <div className="gw-discussion-count"><strong>{post.comment_count}</strong><span>댓글</span></div>}<div><span>{post.category ?? post.prefix ?? (post.is_notice ? '공지' : isDiscussion ? '대화' : '일반')}</span><h2><Link to={`/boards/${boardSlug}/posts/${post.id}`}>{post.title}</Link></h2>{isDiscussion && post.excerpt && <p className="gw-discussion-excerpt">{post.excerpt}</p>}<p>{formatAuthor(post, overview.board.settings)} · {new Date(post.created_at).toLocaleDateString('ko-KR')}{overview.board.settings.show_views !== false ? ` · 조회 ${post.view_count}` : ''}{isDiscussion && post.last_activity_at ? ` · 최근 활동 ${new Date(post.last_activity_at).toLocaleDateString('ko-KR')}` : ''}</p></div>
      {/* 댓글·첨부 수는 본문 줄에서 빼고 우측에 아이콘 형태로 작게 모은다. */}
      <div className="gw-post-list-meta">{post.comment_count > 0 && <span title={`댓글 ${post.comment_count}개`}>💬 {post.comment_count}</span>}{post.attachment_count > 0 && <span title={`첨부 ${post.attachment_count}개`}>📎 {post.attachment_count}</span>}</div></article>)}</div>
    {posts.items.length === 0 && <p className="gw-empty-state">등록된 게시글이 없습니다.</p>}<nav className="gw-pagination" aria-label="게시글 페이지"><button type="button" disabled={page <= 1} onClick={() => setParams({ q: search, ...(category ? { category } : {}), page: String(page - 1) })}>이전</button><span>{page} / {totalPages}페이지 · 총 {posts.total_count ?? posts.items.length}건</span><button type="button" disabled={page >= totalPages} onClick={() => setParams({ q: search, ...(category ? { category } : {}), page: String(page + 1) })}>다음</button></nav>
  </article>;
}

function formatAuthor(post, settings) {
  const parts = [post.author_name];
  if (settings.show_author_department && post.author_department) parts.push(post.author_department);
  if (settings.show_author_position && post.author_position) parts.push(post.author_position);
  if (settings.show_author_job_title && post.author_job_title) parts.push(post.author_job_title);
  return parts.filter(Boolean).join(' · ');
}
