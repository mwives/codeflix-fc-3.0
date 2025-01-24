package domain

import (
	"time"

	"github.com/asaskevich/govalidator"
)

var (
	ErrVideoFilePathEmpty = "video file path can't be empty"
)

type Video struct {
	ID         string    `valid:"uuid"`
	ResourceId string    `valid:"notnull"`
	FilePath   string    `valid:"notnull"`
	CreatedAt  time.Time `valid:"-"`
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
