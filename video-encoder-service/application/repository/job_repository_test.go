package repository_test

import (
	"encoder/application/repository"
	"encoder/domain"
	"encoder/framework/database"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func createTestVideo(db *gorm.DB) *domain.Video {
	video := domain.NewVideo()
	video.ID = uuid.New().String()
	video.FilePath = "path"

	videoRepo := repository.NewVideoRepository(db)
	videoRepo.Insert(video)

	return video
}

func createTestJob(db *gorm.DB, video *domain.Video) (*domain.Job, error) {
	job, err := domain.NewJob("path", "pending", video)
	if err != nil {
		return nil, err
	}

	jobRepo := repository.NewJobRepository(db)
	jobRepo.Insert(job)

	return job, nil
}

func TestJobRepository_Insert(t *testing.T) {
	db := database.NewDbTest()

	video := createTestVideo(db)
	job, err := createTestJob(db, video)
	assert.Nil(t, err)

	jobRepo := repository.NewJobRepository(db)
	job.Status = "Complete"
	jobRepo.Update(job)

	j, err := jobRepo.Find(job.ID)

	assert.Nil(t, err)
	assert.NotNil(t, j.ID)
	assert.Equal(t, job.ID, j.ID)
	assert.Equal(t, job.Video.ID, j.Video.ID)
}

func TestJobRepository_Update(t *testing.T) {
	db := database.NewDbTest()

	video := createTestVideo(db)
	job, err := createTestJob(db, video)
	assert.Nil(t, err)

	jobRepo := repository.NewJobRepository(db)
	job.Status = "Complete"
	jobRepo.Update(job)

	j, err := jobRepo.Find(job.ID)

	assert.Nil(t, err)
	assert.NotNil(t, j.ID)
	assert.Equal(t, job.ID, j.ID)
	assert.Equal(t, job.Video.ID, j.Video.ID)
	assert.Equal(t, "Complete", j.Status)
}
