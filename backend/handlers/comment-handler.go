package handlers

import (
	"net/http"
	"strconv"

	"github.com/r-z-zhang-ai/comment-backend/database"
	"github.com/r-z-zhang-ai/comment-backend/models"

	"github.com/gin-gonic/gin"
)

// GetCommentsHandler 处理获取评论请求
func GetCommentsHandler(c *gin.Context) {
	// 1. 解析查询参数
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		SendErrorResponse(c, http.StatusBadRequest, "参数page必须是大于0的整数")
		return
	}

	size, err := strconv.Atoi(c.DefaultQuery("size", "10"))
	if err != nil || (size < 1 && size != -1) {
		SendErrorResponse(c, http.StatusBadRequest, "参数size必须是大于0的整数或-1")
		return
	}

	// 2. 从数据库获取评论
	comments, total, err := models.GetComments(database.DB, page, size)
	if err != nil {
		SendErrorResponse(c, http.StatusInternalServerError, "获取评论失败: "+err.Error())
		return
	}

	// 3. 构造响应数据
	data := gin.H{
		"total":    total,
		"comments": comments,
	}

	// 4. 返回成功响应
	SendSuccessResponse(c, data)
}

// AddCommentHandler 处理添加评论请求
func AddCommentHandler(c *gin.Context) {
	// 1. 绑定请求体到Comment结构体
	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		SendErrorResponse(c, http.StatusBadRequest, "无效的请求数据")
		return
	}

	// 2. 创建评论
	if err := comment.Create(database.DB); err != nil {
		// 根据错误类型返回不同的状态码
		switch err {
		case models.ErrNameRequired, models.ErrContentRequired, models.ErrNameTooLong:
			SendErrorResponse(c, http.StatusBadRequest, err.Error())
		default:
			SendErrorResponse(c, http.StatusInternalServerError, "添加评论失败: "+err.Error())
		}
		return
	}

	// 3. 返回成功响应（包含新创建的评论）
	SendSuccessResponse(c, comment)
}

// DeleteCommentHandler 处理删除评论请求
func DeleteCommentHandler(c *gin.Context) {
	// 1. 获取查询参数中的id
	idStr := c.Query("id")
	if idStr == "" {
		SendErrorResponse(c, http.StatusBadRequest, "缺少参数id")
		return
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil || id == 0 {
		SendErrorResponse(c, http.StatusBadRequest, "参数id必须是正整数")
		return
	}

	// 2. 先获取评论（验证是否存在）
	comment, err := models.GetCommentByID(database.DB, uint(id))
	if err != nil {
		if err.Error() == "评论不存在" {
			SendErrorResponse(c, http.StatusNotFound, "评论不存在")
		} else {
			SendErrorResponse(c, http.StatusInternalServerError, "获取评论失败: "+err.Error())
		}
		return
	}

	// 3. 删除评论
	if err := comment.Delete(database.DB); err != nil {
		SendErrorResponse(c, http.StatusInternalServerError, "删除评论失败: "+err.Error())
		return
	}

	// 4. 返回成功响应（data为null）
	SendSuccessResponse(c, nil)
}
