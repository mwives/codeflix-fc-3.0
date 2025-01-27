package repository_test

import (
	"encoder/application/repository"
	"encoder/domain"
	"encoder/framework/database"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestVideoRepository_Insert(t *testing.T) {
	db := database.NewDbTest()

	video := domain.NewVideo()
	video.ID = uuid.New().String()
	video.FilePath = "path"

	repo := repository.NewVideoRepository(db)
	repo.Insert(video)

	v, err := repo.Find(video.ID)

	assert.Nil(t, err)
	assert.NotNil(t, v.ID)
	assert.Equal(t, video.ID, v.ID)
}
