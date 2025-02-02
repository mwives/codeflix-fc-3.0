package service_test

import (
	"encoder/application/repository"
	"encoder/application/service"
	"encoder/domain"
	"encoder/framework/database"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

func init() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func prepare() (*domain.Video, *repository.VideoRepositoryDb) {
	db := database.NewDbTest()

	video := domain.NewVideo()
	video.ID = uuid.New().String()
	video.FilePath = "gratidao.mp4"

	videoRepo := repository.NewVideoRepository(db)

	return video, videoRepo
}

func TestVideoServiceWorkflow(t *testing.T) {
	video, videoRepo := prepare()

	videoService := service.NewVideoService()
	videoService.Video = video
	videoService.VideoRepository = videoRepo

	err := videoService.Download("codeflix_test")
	assert.Nil(t, err)

	err = videoService.Fragment()
	assert.Nil(t, err)

	err = videoService.Encode()
	assert.Nil(t, err)

	err = videoService.CleanUp()
	assert.Nil(t, err)
}
