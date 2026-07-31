import { supabase } from './supabaseClient';

export const approvalService = {
  // 양식 및 분류
  async getCategories() {
    const { data, error } = await supabase
      .from('approval_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('approval_templates')
      .select(`
        *,
        category:category_id (name),
        version:current_version_id (*)
      `)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  },

  // 문서 생성 및 기안
  async createDraft(templateId, versionId, title, bodyJson, formData) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    // 1. 문서 기본 생성
    const { data: doc, error: docError } = await supabase
      .from('approval_documents')
      .insert({
        template_id: templateId,
        template_version_id: versionId,
        title,
        drafter_user_id: userData.user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (docError) throw docError;

    // 2. 리비전 생성
    const { data: rev, error: revError } = await supabase
      .from('approval_document_revisions')
      .insert({
        document_id: doc.id,
        revision_number: 1,
        title,
        body_json: bodyJson,
        form_data: formData,
        created_by: userData.user.id
      })
      .select()
      .single();

    if (revError) throw revError;

    // 3. 문서에 리비전 연결
    await supabase
      .from('approval_documents')
      .update({ current_revision_id: rev.id })
      .eq('id', doc.id);

    return doc;
  },

  async submitDocument(documentId) {
    const { error } = await supabase.rpc('submit_approval_document', {
      p_document_id: documentId
    });
    if (error) throw error;
  },

  // 결재함 조회
  async getInbox() {
    // 내가 결재해야 할 문서들
    const { data, error } = await supabase
      .from('approval_documents')
      .select(`
        *,
        template:template_id (name),
        drafter:drafter_user_id (full_name),
        lines:approval_lines (
          *,
          assignees:approval_line_assignees (*)
        )
      `)
      .eq('status', 'in_progress');
    
    // 클라이언트 필터링: 현재 내 차례인 것만
    return data?.filter(doc => {
      const activeLine = doc.lines.find(l => l.status === 'active');
      return activeLine?.assignees.some(a => a.assigned_user_id === supabase.auth.user()?.id && a.status === 'pending');
    });
  },

  // 상세 조회
  async getDocument(documentId) {
    const { data, error } = await supabase
      .from('approval_documents')
      .select(`
        *,
        template:template_id (*),
        revision:current_revision_id (*),
        lines:approval_lines (
          *,
          assignees:approval_line_assignees (*)
        ),
        attachments:approval_attachments (*),
        comments:approval_comments (*)
      `)
      .eq('id', documentId)
      .single();
    if (error) throw error;
    return data;
  }
};
