package service

import (
	"encoder/domain"
	"encoder/framework/utils"
	"encoding/json"
	"os"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/streadway/amqp"
)

type JobWorkerResult struct {
	Job     domain.Job
	Message *amqp.Delivery
	Error   error
}

var Mutex = &sync.Mutex{}

func JobWorker(messageChannel chan amqp.Delivery, returnChan chan JobWorkerResult, jobService JobService, job domain.Job, workerID int) {
	for message := range messageChannel {
		err := utils.IsJson(string(message.Body))
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		err = json.Unmarshal(message.Body, &jobService.VideoService.Video)
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		Mutex.Lock()
		jobService.VideoService.Video.ID = uuid.New().String()
		Mutex.Unlock()

		err = jobService.VideoService.Video.Validate()
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		Mutex.Lock()
		err = jobService.VideoService.InsertVideo()
		Mutex.Unlock()
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		job.Video = jobService.VideoService.Video
		job.OutputBucketPath = os.Getenv("OUTPUT_BUCKET_NAME")
		job.ID = uuid.New().String()
		job.Status = "STARTING"
		job.CreatedAt = time.Now()

		Mutex.Lock()
		_, err = jobService.JobRepository.Insert(&job)
		Mutex.Unlock()
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		jobService.Job = &job

		err = jobService.Start()
		if err != nil {
			returnChan <- returnJobResult(domain.Job{}, &message, err)
			continue
		}

		returnChan <- returnJobResult(job, &message, nil)
	}
}

func returnJobResult(job domain.Job, message *amqp.Delivery, err error) JobWorkerResult {
	return JobWorkerResult{
		Job:     job,
		Message: message,
		Error:   err,
	}
}
