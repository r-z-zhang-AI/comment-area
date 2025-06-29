// frontend/src/api/commentService.js
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

// 统一响应处理
api.interceptors.response.use(
  response => {
    if (response.data && response.data.code === 0) {
      return response.data.data;
    } else {
      const error = new Error(response.data?.msg || '未知错误');
      error.code = response.data?.code; 
      throw error;
    }
  },
  error => {
    if (error.response) {
      const errorMsg = error.response.data?.msg || `服务器错误: ${error.response.status}`;
      return Promise.reject(new Error(errorMsg));
    } else if (error.request) {
      return Promise.reject(new Error('网络错误，请检查您的连接'));
    } else {
      return Promise.reject(new Error('请求配置错误'));
    }
  }
);

/**
 * 获取评论列表
 */
export const getComments = async (page = 1, size = 10) => {
  try {
    const response = await api.get('/comment/get', {
      params: { page, size }
    });
    return response;
  } catch (error) {
    console.error('获取评论失败:', error.message);
    throw error;
  }
};

/**
 * 添加新评论
 */
export const addComment = async (comment) => {
  try {
    const response = await api.post('/comment/add', comment);
    return response;
  } catch (error) {
    console.error('添加评论失败:', error.message);
    throw error;
  }
};

/**
 * 删除评论
 */
export const deleteComment = async (id) => {
  try {
    await api.post('/comment/delete', null, {
      params: { id }
    });
    return true;
  } catch (error) {
    console.error('删除评论失败:', error.message);
    throw error;
  }
};