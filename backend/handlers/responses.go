package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 统一响应结构
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

// SendSuccessResponse 发送成功响应
func SendSuccessResponse(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: 0,
		Msg:  "success",
		Data: data,
	})
}

// SendErrorResponse 发送错误响应
func SendErrorResponse(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, Response{
		Code: statusCode,
		Msg:  message,
		Data: nil,
	})
}
