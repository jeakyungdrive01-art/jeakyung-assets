import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';

const ApprovalDraftPage = ({ isEdit = false }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await approvalService.getTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (err) {
      console.error('Failed to load templates', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedTemplate) return;
    setSubmitting(true);
    try {
      const doc = await approvalService.createDraft(
        selectedTemplate.id,
        selectedTemplate.current_version_id,
        title || '제목 없음',
        {}, // bodyJson
        formData
      );
      alert('임시 저장이 완료되었습니다.');
      navigate(`/approval/documents/${doc.id}/edit`);
    } catch (err) {
      alert('저장 실패: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. 먼저 저장 (신규인 경우)
      let docId = documentId;
      if (!isEdit) {
        const doc = await approvalService.createDraft(
          selectedTemplate.id,
          selectedTemplate.current_version_id,
          title,
          {},
          formData
        );
        docId = doc.id;
      }
      
      // 2. 제출
      await approvalService.submitDocument(docId);
      alert('기안서가 성공적으로 제출되었습니다.');
      navigate('/approval/outbox');
    } catch (err) {
      alert('제출 실패: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="gw-loading">로딩 중...</div>;

  return (
    <div className="gw-content-card max-w-4xl mx-auto">
      <div className="gw-header-with-actions">
        <h2 className="gw-heading-xl">{isEdit ? '기안서 수정' : '새 기안 작성'}</h2>
        <div className="gw-button-group">
          <button 
            className="gw-button-secondary" 
            onClick={handleSaveDraft}
            disabled={submitting}
          >
            임시 저장
          </button>
          <button 
            className="gw-button-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            기안 요청
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <div className="gw-form-field">
          <label className="gw-label">결재 양식</label>
          <select 
            className="gw-input" 
            value={selectedTemplate?.id || ''}
            onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value))}
            disabled={isEdit}
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="gw-form-field">
          <label className="gw-label">제목</label>
          <input 
            type="text" 
            className="gw-input" 
            placeholder="기안서 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <p className="text-center text-gray-500">양식에 따른 상세 입력 필드가 여기에 표시됩니다.</p>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="gw-heading-md mb-4">결재선 설정</h3>
          <div className="gw-empty-state py-4">
            <p className="text-sm">양식별 기본 결재선이 자동으로 구성됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDraftPage;
