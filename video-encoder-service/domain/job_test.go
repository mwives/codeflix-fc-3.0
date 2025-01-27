package domain_test

import (
	"encoder/domain"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestNewJob(t *testing.T) {
	video := domain.NewVideo()
	video.ID = uuid.New().String()
	video.FilePath = "path"

	job, err := domain.NewJob("path", "pending", video)

	assert.Nil(t, err)
	assert.NotNil(t, job.ID)
}
