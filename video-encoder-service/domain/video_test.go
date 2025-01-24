package domain_test

import (
	"encoder/domain"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
)

func TestValidateEmptyVideoObject(t *testing.T) {
	video := domain.NewVideo()
	err := video.Validate()

	require.Error(t, err)
}

func TestVideoIDShouldBeUUID(t *testing.T) {
	video := domain.NewVideo()

	video.ID = "abc"
	video.ResourceId = "a"
	video.FilePath = "path"

	err := video.Validate()

	require.Error(t, err)
}

func TestValidateVideo(t *testing.T) {
	video := domain.NewVideo()

	video.ID = uuid.New().String()
	video.ResourceId = "1"
	video.FilePath = "path"

	err := video.Validate()

	require.Nil(t, err)
}
