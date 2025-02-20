package domain

import (
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/google/uuid"
)

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
}

type Job struct {
	ID               string    `json:"job_id" valid:"uuid" gorm:"type:uuid;primary_key"`
	OutputBucketPath string    `json:"output_bucket_path" valid:"notnull"`
	Status           string    `json:"status" valid:"notnull"`
	Video            *Video    `json:"video" valid:"-"`
	VideoId          string    `json:"-" valid:"-" gorm:"column:video_id;type:uuid;notnull"`
	Error            string    `json:"-" valid:"-"`
	CreatedAt        time.Time `json:"created_at" valid:"-"`
	UpdateAt         time.Time `json:"updated_at" valid:"-"`
}

func (job *Job) prepare() {
	job.ID = uuid.New().String()
	job.CreatedAt = time.Now()
	job.UpdateAt = time.Now()
}

func NewJob(outputBucketPath string, status string, video *Video) (*Job, error) {
	job := Job{
		OutputBucketPath: outputBucketPath,
		Status:           status,
		Video:            video,
	}

	job.prepare()
	err := job.Validate()
	if err != nil {
		return nil, err
	}

	return &job, nil
}

func (job *Job) Validate() error {
	_, err := govalidator.ValidateStruct(job)
	if err != nil {
		return err
	}
	return nil
}
