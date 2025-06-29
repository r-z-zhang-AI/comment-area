package models

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Comment 定义评论模型结构
type Comment struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"` // 主键，自增
	Name      string    `gorm:"size:100;not null" json:"name"`      // 评论者名字，最大长度100，非空
	Content   string    `gorm:"type:text;not null" json:"content"`  // 评论内容，文本类型，非空
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`   // 创建时间，自动设置
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`   // 更新时间，自动更新
}

// 定义自定义错误类型
var (
	ErrNameRequired    = errors.New("评论者姓名不能为空")
	ErrContentRequired = errors.New("评论内容不能为空")
	ErrNameTooLong     = errors.New("评论者姓名不能超过100个字符")
)

// Validate 验证评论数据
func (c *Comment) Validate() error {
	// 验证评论者名字
	if c.Name == "" {
		return ErrNameRequired
	}
	if len(c.Name) > 100 {
		return ErrNameTooLong
	}

	// 验证评论内容
	if c.Content == "" {
		return ErrContentRequired
	}

	return nil
}

// Create 创建新评论
func (c *Comment) Create(db *gorm.DB) error {
	// 验证数据
	if err := c.Validate(); err != nil {
		return err
	}

	// 在事务中执行创建操作
	return db.Transaction(func(tx *gorm.DB) error {
		if result := tx.Create(c); result.Error != nil {
			return fmt.Errorf("创建评论失败: %w", result.Error)
		}
		return nil
	})
}

// Delete 删除评论
func (c *Comment) Delete(db *gorm.DB) error {
	if c.ID == 0 {
		return errors.New("无效的评论ID")
	}

	// 在事务中执行删除操作
	return db.Transaction(func(tx *gorm.DB) error {
		if result := tx.Delete(c); result.Error != nil {
			return fmt.Errorf("删除评论失败: %w", result.Error)
		}
		return nil
	})
}

// GetComments 获取评论列表
func GetComments(db *gorm.DB, page, size int) ([]Comment, int64, error) {
	var comments []Comment
	var total int64

	// 计算偏移量
	offset := (page - 1) * size

	// 查询总数
	if err := db.Model(&Comment{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("获取评论总数失败: %w", err)
	}

	// 处理size=-1的情况（获取所有评论）
	if size == -1 {
		if err := db.Order("created_at DESC").Find(&comments).Error; err != nil {
			return nil, 0, fmt.Errorf("获取所有评论失败: %w", err)
		}
		return comments, total, nil
	}

	// 分页查询
	if err := db.Order("created_at DESC").Offset(offset).Limit(size).Find(&comments).Error; err != nil {
		return nil, 0, fmt.Errorf("获取分页评论失败: %w", err)
	}

	return comments, total, nil
}

// GetCommentByID 根据ID获取评论
func GetCommentByID(db *gorm.DB, id uint) (*Comment, error) {
	if id == 0 {
		return nil, errors.New("无效的评论ID")
	}

	var comment Comment
	if err := db.First(&comment, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("评论ID %d 不存在", id)
		}
		return nil, fmt.Errorf("查询评论失败: %w", err)
	}

	return &comment, nil
}
