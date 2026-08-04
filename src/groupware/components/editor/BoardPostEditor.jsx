import { useCallback, useMemo, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Plugin } from '@tiptap/pm/state';

import { getAttachmentViewUrl, uploadInlineBoardImage } from '../../services/boardService.js';
import { countInlineImages, prepareInlineImage, sanitizePastedHtml } from '../../utils/boardDocument.js';
import { InlineAttachmentImage } from './InlineAttachmentImage.js';

const MAX_PARALLEL_SELECTION = 20;

function imageFiles(fileList) {
  return [...(fileList ?? [])].filter((file) => file.type.startsWith('image/'));
}

const ImageTransfer = Extension.create({
  name: 'imageTransfer',
  priority: 1000,
  addOptions() { return { receiveFiles: () => {} }; },
  addProseMirrorPlugins() {
    return [new Plugin({
      props: {
        handlePaste: (view, event) => {
          const files = imageFiles(event.clipboardData?.files);
          if (!files.length) return false;
          event.preventDefault();
          this.options.receiveFiles(files, view.state.selection.from);
          return true;
        },
        handleDrop: (view, event, _slice, moved) => {
          if (moved) return false;
          const files = imageFiles(event.dataTransfer?.files);
          if (!files.length) return false;
          event.preventDefault();
          const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from;
          this.options.receiveFiles(files, position);
          return true;
        },
      },
    })];
  },
});

function ToolbarButton({ active = false, children, onClick, label }) {
  return <button type="button" aria-label={label} aria-pressed={active} onClick={onClick}>{children}</button>;
}

export default function BoardPostEditor({ board, postId, initialDocument, initialUrls = {}, initialAttachments = [], onChange, onImageIdsChange, uploadImage = uploadInlineBoardImage, getImageUrl = getAttachmentViewUrl }) {
  const urlsRef = useRef(initialUrls);
  const attachmentSizesRef = useRef(Object.fromEntries(initialAttachments.map((item) => [item.id, Number(item.file_size) || 0])));
  const generalBytesRef = useRef(initialAttachments.filter((item) => item.purpose !== 'inline_image').reduce((sum, item) => sum + (Number(item.file_size) || 0), 0));
  const totalBytesRef = useRef(initialAttachments.reduce((sum, item) => sum + (Number(item.file_size) || 0), 0));
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const limits = useMemo(() => ({
    maxBytes: Math.min(Math.max(Number(board.settings.max_inline_image_size_mb) || 10, 1), 10) * 1024 * 1024,
    maxImages: Math.min(Math.max(Number(board.settings.max_inline_images) || 20, 1), 20),
    maxTotalBytes: Math.min(Math.max(Number(board.settings.max_total_attachment_mb) || 50, 1), 50) * 1024 * 1024,
    preserveOriginal: Boolean(board.settings.preserve_image_originals),
  }), [board.settings]);

  const uploadOne = useCallback(async (file, replacesAttachmentId = null) => {
    const prepared = await prepareInlineImage(file, { maxBytes: limits.maxBytes, preserveOriginal: limits.preserveOriginal });
    const replacedBytes = replacesAttachmentId ? (attachmentSizesRef.current[replacesAttachmentId] ?? 0) : 0;
    if (totalBytesRef.current - replacedBytes + prepared.file.size > limits.maxTotalBytes) {
      throw new Error(`본문 이미지와 첨부파일의 합계는 ${limits.maxTotalBytes / 1024 / 1024}MB 이하여야 합니다.`);
    }
    const attachment = await uploadImage({ boardId: board.id, postId, file: prepared.file, originalName: prepared.originalName, replacesAttachmentId });
    const url = await getImageUrl(attachment.id);
    urlsRef.current = { ...urlsRef.current, [attachment.id]: url };
    totalBytesRef.current = totalBytesRef.current - replacedBytes + Number(attachment.file_size || prepared.file.size);
    attachmentSizesRef.current = { ...attachmentSizesRef.current, [attachment.id]: Number(attachment.file_size || prepared.file.size) };
    return attachment;
  }, [board.id, getImageUrl, limits, postId, uploadImage]);

  const receiveFiles = useCallback(async (incomingFiles, requestedPosition) => {
    const editor = editorRef.current;
    const files = imageFiles(incomingFiles).slice(0, MAX_PARALLEL_SELECTION);
    if (!editor || !files.length) return;
    const existingCount = countInlineImages(editor.getJSON());
    if (existingCount + files.length > limits.maxImages) {
      setUploads([{ id: crypto.randomUUID(), name: '선택한 이미지', state: 'error', message: `게시글당 이미지는 최대 ${limits.maxImages}장입니다.` }]);
      return;
    }
    if (totalBytesRef.current + files.reduce((sum, file) => sum + file.size, 0) > limits.maxTotalBytes) {
      setUploads([{ id: crypto.randomUUID(), name: '선택한 이미지', state: 'error', message: `본문 이미지와 첨부파일의 합계는 ${limits.maxTotalBytes / 1024 / 1024}MB 이하여야 합니다.` }]);
      return;
    }

    const jobs = files.map((file) => ({ id: crypto.randomUUID(), file, name: file.name, state: 'queued', message: '업로드 대기' }));
    setUploads((current) => [...current.filter((item) => item.state === 'uploading'), ...jobs]);
    let insertionPosition = Math.min(requestedPosition ?? editor.state.selection.from, editor.state.doc.content.size);
    for (const job of jobs) {
      setUploads((current) => current.map((item) => item.id === job.id ? { ...item, state: 'uploading', message: '검사·최적화 후 업로드 중' } : item));
      try {
        const attachment = await uploadOne(job.file);
        editor.chain().focus().insertContentAt(insertionPosition, {
          type: 'inlineImage',
          attrs: { attachmentId: attachment.id, alt: '', caption: '', alignment: 'center', size: 'medium', width: null },
        }).run();
        insertionPosition = Math.min(insertionPosition + 1, editor.state.doc.content.size);
        setUploads((current) => current.map((item) => item.id === job.id ? { ...item, state: 'success', message: '본문에 삽입됨' } : item));
      } catch (error) {
        setUploads((current) => current.map((item) => item.id === job.id ? { ...item, state: 'error', message: error instanceof Error ? error.message : '업로드 실패' } : item));
      }
    }
  }, [limits, uploadOne]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, underline: false, heading: { levels: [1, 2, 3] } }),
      InlineAttachmentImage.configure({
        resolveUrl: (attachmentId) => urlsRef.current[attachmentId] ?? '',
        replaceImage: async (file, attachmentId) => uploadOne(file, attachmentId),
      }),
      ImageTransfer.configure({ receiveFiles }),
    ],
    content: initialDocument,
    editorProps: {
      attributes: { class: 'gw-rich-editor-content', 'aria-label': '게시글 본문 편집기' },
      transformPastedHTML: sanitizePastedHtml,
    },
    onCreate: ({ editor: createdEditor }) => { editorRef.current = createdEditor; },
    onUpdate: ({ editor: updatedEditor }) => {
      const documentValue = updatedEditor.getJSON();
      onChange(documentValue);
      const ids = [];
      updatedEditor.state.doc.descendants((node) => { if (node.type.name === 'inlineImage') ids.push(node.attrs.attachmentId); });
      totalBytesRef.current = generalBytesRef.current + [...new Set(ids)].reduce((sum, id) => sum + (attachmentSizesRef.current[id] ?? 0), 0);
      onImageIdsChange(ids);
    },
  }, [postId]);
  editorRef.current = editor;

  if (!editor) return <p className="gw-empty-state" role="status">본문 편집기를 준비하고 있습니다.</p>;
  const retry = (job) => receiveFiles([job.file], editor.state.selection.from);

  return <div className="gw-rich-editor">
    <div className="gw-editor-toolbar" role="toolbar" aria-label="본문 서식">
      <ToolbarButton label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>굵게</ToolbarButton>
      <ToolbarButton label="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>기울임</ToolbarButton>
      <ToolbarButton label="제목 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>제목</ToolbarButton>
      <ToolbarButton label="글머리표" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>목록</ToolbarButton>
      <ToolbarButton label="번호 목록" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>번호</ToolbarButton>
      {board.settings.allow_images && <button type="button" className="gw-editor-photo-button" onClick={() => fileInputRef.current?.click()}>사진 선택</button>}
      <input ref={fileInputRef} className="gw-visually-hidden" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { receiveFiles(event.target.files, editor.state.selection.from); event.target.value = ''; }} />
    </div>
    <EditorContent editor={editor} />
    <p className="gw-editor-hint">이미지를 끌어 놓거나 클립보드에서 붙여넣을 수 있습니다. JPEG·PNG·WebP·GIF, 장당 최대 {limits.maxBytes / 1024 / 1024}MB, 최대 {limits.maxImages}장.</p>
    {uploads.length > 0 && <ul className="gw-upload-status" aria-label="이미지 업로드 상태" aria-live="polite">{uploads.map((item) => <li key={item.id} className={`is-${item.state}`}><span>{item.name}</span><strong>{item.message}</strong>{item.state === 'error' && item.file && <button type="button" onClick={() => retry(item)}>재시도</button>}</li>)}</ul>}
  </div>;
}
