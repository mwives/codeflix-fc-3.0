package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"cloud.google.com/go/storage"
)

type VideoUpload struct {
	Paths        []string
	VideoPath    string
	OutputBucket string
	Errors       []string
}

func NewVideoUpload() *VideoUpload {
	return &VideoUpload{}
}

func (vu *VideoUpload) UploadObject(objectPath string, client *storage.Client, ctx context.Context) error {
	paths := strings.Split(objectPath, fmt.Sprintf("%s/", os.Getenv("LOCAL_STORAGE_PATH")))

	f, err := os.Open(objectPath)
	if err != nil {
		return err
	}
	defer f.Close()

	wc := client.Bucket(vu.OutputBucket).Object(paths[1]).NewWriter(ctx)

	if _, err = io.Copy(wc, f); err != nil {
		return err
	}

	if err := wc.Close(); err != nil {
		return err
	}

	return nil
}

func (vu *VideoUpload) loadPaths() error {
	err := filepath.Walk(vu.VideoPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			vu.Paths = append(vu.Paths, path)
		}
		return nil
	})
	if err != nil {
		return err
	}

	return nil
}

func (vu *VideoUpload) ProcessUpload(maxConcurrentUploads int, doneUpload chan string) error {
	in := make(chan int, runtime.NumCPU())
	returnChannel := make(chan string)

	if err := vu.loadPaths(); err != nil {
		return err
	}

	client, ctx, err := getClientUpload()
	if err != nil {
		return err
	}

	for process := 0; process < maxConcurrentUploads; process++ {
		go vu.uploadWorker(in, returnChannel, client, ctx)
	}

	go func() {
		for x := 0; x < len(vu.Paths); x++ {
			in <- x
		}
	}()

	countDoneWorker := 0
	for r := range returnChannel {
		countDoneWorker++
		if r != "" {
			doneUpload <- r
			break
		}
		if countDoneWorker == len(vu.Paths) {
			close(in)
		}
	}

	return nil
}

func (vu *VideoUpload) uploadWorker(in chan int, returnChannel chan string, client *storage.Client, ctx context.Context) {
	for x := range in {
		if err := vu.UploadObject(vu.Paths[x], client, ctx); err != nil {
			vu.Errors = append(vu.Errors, vu.Paths[x])
			log.Printf("Error during the upload of the file: %v. Error: %v", vu.Paths[x], err)
			returnChannel <- err.Error()
		}
		returnChannel <- ""
	}

	returnChannel <- "Upload completed"
}

func getClientUpload() (*storage.Client, context.Context, error) {
	ctx := context.Background()

	client, err := storage.NewClient(ctx)
	if err != nil {
		return nil, nil, err
	}

	return client, ctx, nil
}
