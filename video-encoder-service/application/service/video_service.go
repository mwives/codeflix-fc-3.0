package service

import (
	"context"
	"encoder/application/repository"
	"encoder/domain"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"

	"cloud.google.com/go/storage"
)

type VideoService struct {
	Video           *domain.Video
	VideoRepository repository.VideoRepository
}

func NewVideoService() VideoService {
	return VideoService{}
}

func (v *VideoService) Download(bucketName string) error {
	ctx := context.Background()

	client, err := storage.NewClient(ctx)
	if err != nil {
		return err
	}

	bkt := client.Bucket(bucketName)
	obj := bkt.Object(v.Video.FilePath)

	r, err := obj.NewReader(ctx)
	if err != nil {
		return err
	}
	defer r.Close()

	body, err := io.ReadAll(r)
	if err != nil {
		return err
	}

	f, err := os.Create(fmt.Sprintf("%s/%s.mp4", os.Getenv("LOCAL_STORAGE_PATH"), v.Video.ID))
	if err != nil {
		return err
	}
	defer f.Close()

	// print path of the file
	log.Printf("video %v has been downloaded", f.Name())

	_, err = f.Write(body)
	if err != nil {
		return err
	}

	log.Printf("video %v has been downloaded", v.Video.ID)

	return nil
}

func (v *VideoService) Fragment() error {
	err := os.Mkdir(fmt.Sprintf("%s/%s", os.Getenv("LOCAL_STORAGE_PATH"), v.Video.ID), os.ModePerm)
	if err != nil {
		return err
	}

	source := fmt.Sprintf("%s/%s.mp4", os.Getenv("LOCAL_STORAGE_PATH"), v.Video.ID)
	target := fmt.Sprintf("%s/%s.frag", os.Getenv("LOCAL_STORAGE_PATH"), v.Video.ID)

	cmd := exec.Command("mp4fragment", source, target)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return err
	}

	printOutput(output)

	return nil
}

func (v *VideoService) Encode() error {
	localStoragePath := os.Getenv("LOCAL_STORAGE_PATH")

	cmdArgs := []string{
		fmt.Sprintf("%s/%s.frag", localStoragePath, v.Video.ID),
		"--use-segment-timeline",
		"-o",
		fmt.Sprintf("%s/%s", localStoragePath, v.Video.ID),
		"-f",
	}

	cmd := exec.Command("mp4dash", cmdArgs...)

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("error: %v\n", err)
		return err
	}

	printOutput(output)

	return nil
}

func (v *VideoService) CleanUp() error {
	localStoragePath := os.Getenv("LOCAL_STORAGE_PATH")

	err := os.Remove(fmt.Sprintf("%s/%s.mp4", localStoragePath, v.Video.ID))
	if err != nil {
		log.Fatalf("error removing mp4 %v", err)
		return err
	}

	err = os.Remove(fmt.Sprintf("%s/%s.frag", localStoragePath, v.Video.ID))
	if err != nil {
		log.Fatalf("error removing frag %v", err)
		return err
	}

	err = os.RemoveAll(fmt.Sprintf("%s/%s", localStoragePath, v.Video.ID))
	if err != nil {
		log.Fatalf("error removing folder %v", err)
		return err
	}

	fmt.Printf("video %v has been removed", v.Video.ID)

	return nil
}

func printOutput(out []byte) {
	if len(out) > 0 {
		fmt.Println("==== OUTPUT ====")
		fmt.Println(string(out))
		fmt.Println("===============")
	}
}
