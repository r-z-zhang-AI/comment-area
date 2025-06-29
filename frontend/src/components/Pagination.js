// frontend/src/components/Pagination.js
import React from 'react';
import { Pagination as BootstrapPagination, Row, Col, Form } from 'react-bootstrap';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange,
  totalItems,
  className = ''
}) => {
  // 生成页码按钮
  const renderPageItems = () => {
    const items = [];
    const maxVisiblePages = 5; // 最多显示5个页码
    
    let startPage = 1;
    let endPage = totalPages;
    
    if (totalPages > maxVisiblePages) {
      // 计算当前页周围的页码
      const half = Math.floor(maxVisiblePages / 2);
      startPage = Math.max(1, currentPage - half);
      endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // 第一页按钮
    if (startPage > 1) {
      items.push(
        <BootstrapPagination.Item 
          key={1} 
          active={1 === currentPage}
          onClick={() => onPageChange(1)}
        >
          1
        </BootstrapPagination.Item>
      );
      
      if (startPage > 2) {
        items.push(<BootstrapPagination.Ellipsis key="start-ellipsis" disabled />);
      }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <BootstrapPagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </BootstrapPagination.Item>
      );
    }
    
    // 最后一页按钮
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<BootstrapPagination.Ellipsis key="end-ellipsis" disabled />);
      }
      
      items.push(
        <BootstrapPagination.Item 
          key={totalPages} 
          active={totalPages === currentPage}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </BootstrapPagination.Item>
      );
    }
    
    return items;
  };

  return (
    <Row className={`align-items-center ${className}`}>
      <Col xs={12} md={4} className="mb-2 mb-md-0">
        <div className="d-flex align-items-center">
          <span className="me-2 text-muted">每页显示:</span>
          <Form.Select 
            size="sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-auto"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={-1}>全部</option>
          </Form.Select>
        </div>
      </Col>
      
      <Col xs={12} md={8}>
        <BootstrapPagination className="flex-wrap justify-content-center justify-content-md-end">
          <BootstrapPagination.Prev 
            disabled={currentPage <= 1} 
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="上一页"
          />
          
          {renderPageItems()}
          
          <BootstrapPagination.Next 
            disabled={currentPage >= totalPages} 
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="下一页"
          />
        </BootstrapPagination>
      </Col>
    </Row>
  );
};

export default Pagination;