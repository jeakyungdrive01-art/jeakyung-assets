import { requireSupabase } from '../lib/supabase.js';

const BUCKET = 'groupware-board-attachments';
const SAFE_FILE = /[^a-zA-Z0-9._-]+/g;
const BLOCKED_EXTENSIONS = /\.(exe|dll|bat|cmd|com|scr|msi|js|jar|sh|ps1)$/i;

async function rpc(name, params = {}) {
  const { data, error } = await requireSupabase().rpc(name, params);
  if (error) throw error;
  return data;
}

export const getVisibleBoards = () => rpc('get_my_visible_boards').then((data) => data ?? []);
export const getBoardOverview = (slug) => rpc('get_board_overview', { p_slug: slug });
export const getBoardPosts = (slug, { search = '', category = null, page = 1 } = {}) => rpc('get_board_posts', { p_slug: slug, p_search: search || null, p_category: category, p_page: page });
export const getBoardPost = (postId) => rpc('get_board_post', { p_post_id: postId });
export const saveBoardPost = (post) => rpc('save_board_post', {
  p_post_id: post.id ?? null,
  p_board_id: post.boardId,
  p_title: post.title,
  p_content: post.content,
  p_category_id: post.categoryId || null,
  p_post_prefix: post.postPrefix || null,
  p_is_anonymous: Boolean(post.isAnonymous),
  p_is_notice: Boolean(post.isNotice),
  p_is_important: Boolean(post.isImportant),
  p_is_pinned: Boolean(post.isPinned),
  p_status: post.status ?? 'published',
});
export const deleteBoardPost = (postId) => rpc('delete_board_post', { p_post_id: postId });
export const saveBoardComment = (comment) => rpc('save_board_comment', {
  p_comment_id: comment.id ?? null,
  p_post_id: comment.postId,
  p_parent_comment_id: comment.parentCommentId ?? null,
  p_content: comment.content,
  p_is_anonymous: Boolean(comment.isAnonymous),
});
export const deleteBoardComment = (commentId) => rpc('delete_board_comment', { p_comment_id: commentId });
export const toggleBoardFavorite = (boardId) => rpc('toggle_board_favorite', { p_board_id: boardId });
export const getBoardAdminCatalog = () => rpc('get_board_admin_catalog').then((data) => data ?? { groups: [], boards: [] });
export const saveBoardDefinition = (board, rules, categories, managers = []) => rpc('manage_board', { p_board: board, p_rules: rules, p_categories: categories, p_managers: managers });
export const saveBoardGroup = (group) => rpc('manage_board_group', { p_group: group });
export const previewBoardPermissions = (boardId, userId) => rpc('preview_board_permissions', { p_board_id: boardId, p_user_id: userId });
export const deleteOrArchiveBoard = (boardId) => rpc('delete_or_archive_board', { p_board_id: boardId });
export const getBoardReactions = (postId) => rpc('get_board_reactions', { p_post_id: postId });
export const toggleBoardReaction = (postId, reactionType = 'like') => rpc('toggle_board_reaction', { p_post_id: postId, p_reaction_type: reactionType });
export const deleteBoardAttachment = (attachmentId) => rpc('delete_board_attachment', { p_attachment_id: attachmentId });

export async function uploadBoardAttachment({ boardId, postId, file, userId, maxSizeMb = 20 }) {
  const safeLimitMb = Math.min(Math.max(Number(maxSizeMb) || 20, 1), 20);
  if (file.size > safeLimitMb * 1024 * 1024) throw new Error(`첨부파일은 ${safeLimitMb}MB 이하여야 합니다.`);
  if (BLOCKED_EXTENSIONS.test(file.name)) throw new Error('보안상 허용되지 않는 파일 형식입니다.');
  const safeName = file.name.normalize('NFKC').replace(SAFE_FILE, '-').replace(/^-+|-+$/g, '') || 'attachment';
  const storagePath = `${boardId}/${userId}/${crypto.randomUUID()}-${safeName}`;
  const client = requireSupabase();
  const { error: uploadError } = await client.storage.from(BUCKET).upload(storagePath, file, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (uploadError) throw uploadError;
  try {
    await rpc('register_board_attachment', {
      p_board_id: boardId,
      p_post_id: postId,
      p_storage_path: storagePath,
      p_original_name: file.name,
      p_mime_type: file.type || 'application/octet-stream',
      p_file_size: file.size,
    });
  } catch (error) {
    await client.storage.from(BUCKET).remove([storagePath]);
    throw error;
  }
}

export async function getAttachmentDownloadUrl(attachmentId) {
  const metadata = await rpc('get_board_attachment_path', { p_attachment_id: attachmentId });
  const { data, error } = await requireSupabase().storage.from(BUCKET).createSignedUrl(metadata.storage_path, 60, { download: metadata.original_name });
  if (error) throw error;
  return data.signedUrl;
}
