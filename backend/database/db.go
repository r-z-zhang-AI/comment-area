package database

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全局数据库实例
var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() error {
	// 1. 配置数据库连接
	dsn := "comments.db" // SQLite数据库文件名

	// 2. 创建数据库连接
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // 设置日志级别
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// 3. 获取底层的SQLDB连接进行连接池配置
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying DB connection: %w", err)
	}

	// 4. 配置连接池
	sqlDB.SetMaxIdleConns(10)   // 最大空闲连接数
	sqlDB.SetMaxOpenConns(100)  // 最大打开连接数
	sqlDB.SetConnMaxLifetime(0) // 连接可复用的最大时间(0表示无限制)

	// 5. 测试连接
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// 6. 将数据库实例赋值给全局变量
	DB = db

	fmt.Println("Database connection established successfully")
	return nil
}

// AutoMigrate 自动迁移数据库表结构
func AutoMigrate(models ...interface{}) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// 自动迁移所有传入的模型
	if err := DB.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to auto migrate tables: %w", err)
	}

	fmt.Println("Database tables migrated successfully")
	return nil
}
