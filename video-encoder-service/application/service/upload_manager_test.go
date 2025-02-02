package service_test

import (
	"encoder/application/service"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
)

func init() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
}

func TestUploadServiceUpload(t *testing.T) {
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

	videoUpload := service.NewVideoUpload()
	videoUpload.OutputBucket = "codeflix_test"
	videoUpload.VideoPath = fmt.Sprintf("%s/%s", os.Getenv("LOCAL_STORAGE_PATH"), video.ID)

	doneUpload := make(chan string)
	go videoUpload.ProcessUpload(50, doneUpload)

	result := <-doneUpload
	assert.Equal(t, result, "Upload completed")
}
