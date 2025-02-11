package service

import (
	"encoder/application/repository"
	"encoder/domain"
	"errors"
	"fmt"
	"os"
	"strconv"
)

type JobService struct {
	Job           *domain.Job
	JobRepository repository.JobRepository
	VideoService  VideoService
}

func (j *JobService) Start() error {
	if err := j.updateJobStatus("UPLOADING"); err != nil {
		return j.failJob(err)
	}

	if err := j.VideoService.Download(os.Getenv("INPUT_BUCKET_NAME")); err != nil {
		return j.failJob(err)
	}

	if err := j.updateJobStatus("FRAGMENTING"); err != nil {
		return j.failJob(err)
	}

	if err := j.VideoService.Fragment(); err != nil {
		return j.failJob(err)
	}

	if err := j.updateJobStatus("ENCODING"); err != nil {
		return j.failJob(err)
	}

	if err := j.VideoService.Encode(); err != nil {
		return j.failJob(err)
	}

	if err := j.updateJobStatus("UPLOADING"); err != nil {
		return j.failJob(err)
	}

	if err := j.performUpload(); err != nil {
		return j.failJob(err)
	}

	if err := j.updateJobStatus("FINISHING"); err != nil {
		return j.failJob(err)
	}

	if err := j.VideoService.CleanUp(); err != nil {
		return j.failJob(err)
	}

	if err := j.updateJobStatus("COMPLETED"); err != nil {
		return j.failJob(err)
	}

	return nil
}

func (j *JobService) performUpload() error {
	videoUpload := NewVideoUpload()
	videoUpload.OutputBucket = os.Getenv("OUTPUT_BUCKET_NAME")
	videoUpload.VideoPath = fmt.Sprintf("%s/%s", os.Getenv("LOCAL_STORAGE_PATH"), j.VideoService.Video.ID)

	maxConcurrentUploads, err := strconv.Atoi(os.Getenv("MAX_UPLOAD_CONCURRENCY"))
	if err != nil {
		return fmt.Errorf("invalid MAX_UPLOAD_CONCURRENCY value: %w", err)
	}

	doneUpload := make(chan string)
	go videoUpload.ProcessUpload(maxConcurrentUploads, doneUpload)

	uploadResult := <-doneUpload

	if uploadResult != "Upload completed" {
		return j.failJob(errors.New(uploadResult))
	}

	return nil
}

func (j *JobService) updateJobStatus(status string) error {
	var err error

	j.Job.Status = status
	j.Job, err = j.JobRepository.Update(j.Job)

	if err != nil {
		return j.failJob(err)
	}

	return nil
}

func (j *JobService) failJob(error error) error {
	j.Job.Status = "FAILED"
	j.Job.Error = error.Error()

	_, err := j.JobRepository.Update(j.Job)

	if err != nil {
		return err
	}

	return error
}

func (v *VideoService) InsertVideo() error {
	_, err := v.VideoRepository.Insert(v.Video)
	if err != nil {
		return err
	}

	return nil
}
