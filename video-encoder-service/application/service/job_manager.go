package service

import (
	"encoder/application/repository"
	"encoder/domain"
	"encoder/framework/queue"
	"encoding/json"
	"log"
	"os"
	"strconv"
	"sync"

	"github.com/streadway/amqp"
	"gorm.io/gorm"
)

type JobManager struct {
	DB               *gorm.DB
	Domain           domain.Job
	MessageChannel   chan amqp.Delivery
	JobReturnChannel chan JobWorkerResult
	RabbitMQ         *queue.RabbitMQ
}

type JobNotificationError struct {
	Message string `json:"message"`
	Error   string `json:"error"`
}

var mutex sync.Mutex

func NewJobManager(
	db *gorm.DB,
	rabbitMQ *queue.RabbitMQ,
	jobReturnChannel chan JobWorkerResult,
	messageChannel chan amqp.Delivery,
) *JobManager {
	return &JobManager{
		DB:               db,
		Domain:           domain.Job{},
		MessageChannel:   messageChannel,
		JobReturnChannel: jobReturnChannel,
		RabbitMQ:         rabbitMQ,
	}
}

func (j *JobManager) Start(ch *amqp.Channel) {
	videoService := VideoService{
		VideoRepository: repository.VideoRepositoryDb{Db: j.DB},
	}

	jobService := JobService{
		JobRepository: repository.JobRepositoryDb{Db: j.DB},
		VideoService:  videoService,
	}

	maxConversionConcurrency, err := strconv.Atoi(os.Getenv("MAX_CONVERSION_CONCURRENCY"))
	if err != nil {
		log.Fatalf("Error to parse MAX_CONVERSION_CONCURRENCY")
	}

	for workerCount := 0; workerCount < maxConversionConcurrency; workerCount++ {
		go JobWorker(
			j.MessageChannel,
			j.JobReturnChannel,
			jobService,
			j.Domain,
			workerCount,
		)
	}

	for jobResult := range j.JobReturnChannel {
		if jobResult.Error != nil {
			err = j.checkParseErrors(jobResult)
		} else {
			err = j.notifySuccess(jobResult, ch)
		}

		if err != nil {
			jobResult.Message.Reject(false)
		}
	}
}

func (j *JobManager) notifySuccess(jobResult JobWorkerResult, ch *amqp.Channel) error {
	mutex.Lock()
	jobJson, err := json.Marshal(jobResult.Job)
	mutex.Unlock()

	if err != nil {
		return err
	}

	if err = j.notify(jobJson); err != nil {
		return err
	}

	return jobResult.Message.Ack(false)
}

func (j *JobManager) checkParseErrors(jobResult JobWorkerResult) error {
	if jobResult.Job.ID != "" {
		log.Printf(
			"MessageID: %v | VideoID: %v | JobID: %v | Status: %v\n",
			jobResult.Message.MessageId, jobResult.Job.Video.ID, jobResult.Job.ID, jobResult.Job.Status,
		)
	} else {
		log.Printf("MessageID: %v | Error: %v\n", jobResult.Message.MessageId, jobResult.Error.Error())
	}

	errorMessage := JobNotificationError{
		Message: string(jobResult.Message.Body),
		Error:   jobResult.Error.Error(),
	}

	jobJson, err := json.Marshal(errorMessage)
	if err != nil {
		return err
	}

	if err = j.notify(jobJson); err != nil {
		return err
	}

	return jobResult.Message.Reject(false)
}

func (j *JobManager) notify(jobJson []byte) error {
	return j.RabbitMQ.Notify(
		string(jobJson),
		"application/json",
		os.Getenv("RABBITMQ_NOTIFICATION_EX"),
		os.Getenv("RABBITMQ_NOTIFICATION_ROUTING_KEY"),
	)
}
