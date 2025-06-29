package main

import (
	"log"

	"github.com/r-z-zhang-ai/comment-backend/database"
	"github.com/r-z-zhang-ai/comment-backend/handlers"
	"github.com/r-z-zhang-ai/comment-backend/models"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. 初始化数据库连接
	if err := database.InitDB(); err != nil {
		log.Fatalf("数据库初始化失败: %v", err) // 使用Fatalf确保错误时退出
	}
	log.Println("数据库连接成功")

	// 2. 自动迁移模型
	if err := database.AutoMigrate(&models.Comment{}); err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}
	log.Println("数据库表迁移完成")

	// 3. 创建Gin路由器
	r := gin.Default()

	// 4. 添加CORS中间件（开发环境允许所有跨域请求）
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

		// 处理预检请求
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 5. 注册API路由
	api := r.Group("/api")
	{
		api.GET("/comment/get", handlers.GetCommentsHandler)
		api.POST("/comment/add", handlers.AddCommentHandler)
		api.POST("/comment/delete", handlers.DeleteCommentHandler)
	}

	// 6. 添加健康检查端点
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "ok",
			"database": "connected",
		})
	})

	// 7. 启动服务器
	port := ":8080"
	log.Printf("服务器启动中，监听端口 %s...", port)
	if err := r.Run(port); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
