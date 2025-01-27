package domain

import (
	"time"

	"github.com/asaskevich/govalidator"
)

var (
	ErrVideoFilePathEmpty = "video file path can't be empty"
)

type Video struct {
	ID         string    `json:"encoded_video_folder" valid:"uuid" gorm:"type:uuid;primary_key"`
	ResourceId string    `json:"resource_id" valid:"notnull" gorm:"type:uuid;notnull"`
	FilePath   string    `json:"file_path" valid:"notnull" gorm:"notnull"`
	CreatedAt  time.Time `json:"-" valid:"-" gorm:"notnull"`
	Jobs       []*Job    `json:"-" valid:"-" gorm:"ForeignKey:VideoId;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
}

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
}

func NewVideo() *Video {
	return &Video{
		CreatedAt: time.Now(),
	}
}

func (video *Video) Validate() error {
	_, err := govalidator.ValidateStruct(video)
	if err != nil {
		return err
	}
	return nil
}
