import { supabase } from '../lib/supabase';

export const approvalService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('approval_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTemplates() {
    const { data, error } = await supabase
      .from('approval_templates')
      .select(`
        *,
        category:category_id (name),
        version:current_version_id (*)
      `)
      .eq('is_active', true)
      .is('archived_at', null);

    if (error) throw error;
    return data || [];
  },

  async createDraft(templateId, versionId, title, bodyJson, formData) {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data: document, error: documentError } = await supabase
      .from('approval_documents')
      .insert({
        template_id: templateId,
        template_version_id: versionId,
        title,
        drafter_user_id: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (documentError) throw documentError;

    const { data: revision, error: revisionError } = await supabase
      .from('approval_document_revisions')
      .insert({
        document_id: document.id,
        revision_number: 1,
        title,
        body_json: bodyJson || {},
        form_data: formData || {},
        created_by: user.id
      })
      .select()
      .single();

    if (revisionError) {
      /*
       * TODO(G4-2):
       * 문서와 리비전 생성을 하나의 SECURITY DEFINER RPC 트랜잭션으로
       * 이전해야 한다. 현재는 리비전 생성 실패 시 빈 draft 문서가 남을 수 있다.
       */
      throw revisionError;
    }

    const { data: updatedDocument, error: updateError } = await supabase
      .from('approval_documents')
      .update({
        current_revision_id: revision.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', document.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return updatedDocument;
  },

  async submitDocument(documentId) {
    const { error } = await supabase.rpc('submit_approval_document', {
      p_document_id: documentId
    });

    if (error) throw error;
  },

  async getInbox() {
    const { data, error } = await supabase.rpc('get_my_approval_inbox');

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.document_id,
      document_number: row.document_number,
      title: row.title,
      status: row.document_status,
      template_name: row.template_name,
      drafter_user_id: row.drafter_user_id,
      drafter_name: row.drafter_name,
      submitted_at: row.submitted_at,
      active_line_id: row.active_line_id,
      step_order: row.step_order,
      step_kind: row.step_kind,
      line_mode: row.line_mode,
      assignee_id: row.assignee_id,
      assignee_status: row.assignee_status,
      is_delegated: row.is_delegated
    }));
  },

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
