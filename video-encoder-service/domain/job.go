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
	ID               string    `valid:"uuid"`
	OutputBucketPath string    `valid:"notnull"`
	Status           string    `valid:"notnull"`
	Video            *Video    `valid:"-"`
	VideoId          string    `valid:"-"`
	Error            string    `valid:"-"`
	CreatedAt        time.Time `valid:"-"`
	UpdateAt         time.Time `valid:"-"`
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
