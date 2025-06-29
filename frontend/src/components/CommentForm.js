// frontend/src/components/CommentForm.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const CommentForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 基本验证
    if (!name.trim()) {
      setError('请输入您的名字');
      return;
    }
    if (!content.trim()) {
      setError('请输入评论内容');
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit({ name, content });
      // 提交成功后清空表单
      setName('');
      setContent('');
    } catch (err) {
      setError(err.message || '提交评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>User name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          disabled={submitting}
          maxLength={50}
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Comment content</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your comment..."
          disabled={submitting}
          maxLength={500}
        />
      </Form.Group>
      
      <div className="d-flex justify-content-end gap-2">
        {onCancel && (
          <Button 
            variant="outline-secondary" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button 
          variant="primary" 
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </Form>
  );
};

export default CommentForm;