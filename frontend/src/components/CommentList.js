// frontend/src/components/CommentList.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  ListGroup, 
  Button, 
  Spinner, 
  Alert,
  Badge
} from 'react-bootstrap';
import { getComments, deleteComment, addComment } from '../api/commentService';
import CommentForm from './CommentForm';
import Pagination from './Pagination';

const CommentList = () => {
  // 状态管理
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 加载评论
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getComments(page, pageSize);
      setComments(data.comments);
      setTotal(data.total);
    } catch (err) {
      setError(err.message || 'Failed to load comment, please try again later');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // 添加新评论
  const handleAddComment = async (newComment) => {
    try {
      const createdComment = await addComment(newComment);
      
      // 更新评论列表：新评论添加到顶部
      setComments(prev => [createdComment, ...prev]);
      setTotal(prev => prev + 1);
      
      setShowForm(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      return false;
    }
  };

  // 删除评论
  const handleDelete = async (id) => {
    if (!window.confirm('Sure to delete?')) return;
    
    try {
      await deleteComment(id);
      
      // 更新评论列表：过滤掉已删除的评论
      setComments(prev => prev.filter(comment => comment.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  // 切换页面大小
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1); // 重置到第一页
  };

  // 加载评论数据
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          Comment Area <Badge bg="secondary">{total}</Badge>
        </h5>
        <div>
          <Button 
            variant={showForm ? "outline-secondary" : "primary"} 
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Comment'}
          </Button>
        </div>
      </Card.Header>
      
      {/* 评论表单 */}
      {showForm && (
        <Card.Body className="border-bottom">
          <CommentForm onSubmit={handleAddComment} onCancel={() => setShowForm(false)} />
        </Card.Body>
      )}
      
      <Card.Body>
        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">loading...</span>
            </Spinner>
            <p className="mt-2">loading comments...</p>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && !loading && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {/* 空状态 */}
        {!loading && !error && comments.length === 0 && (
          <div className="text-center py-4 text-muted">
            No comments yet. Be the first to comment!
          </div>
        )}
        
        {/* 评论列表 */}
        {!loading && !error && comments.length > 0 && (
          <ListGroup variant="flush">
            {comments.map(comment => (
              <ListGroup.Item 
                key={comment.id} 
                className="py-3 px-0 border-0"
              >
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-1 d-flex align-items-center">
                      <span className="fw-bold">{comment.name}</span>
                      <span className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
                        The {comment.id}th comment  
                      </span>
                    </h6>
                    <p className="mb-1">{comment.content}</p>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="删除评论"
                  >
                    Delete
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      
      {/* 分页控件 */}
      {totalPages > 1 && !loading && (
        <Card.Footer className="bg-light">
          <Pagination 
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            totalItems={total}
          />
        </Card.Footer>
      )}
    </Card>
  );
};

export default CommentList;