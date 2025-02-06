package utils_test

import (
	"encoder/framework/utils"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsJson_ValidJsonFormat(t *testing.T) {
	json := `{"name": "John Doe"}`
	err := utils.IsJson(json)
	assert.Nil(t, err)
}

func TestIsJson_InvalidJsonFormat(t *testing.T) {
	json := `{"name": "John Doe"`
	err := utils.IsJson(json)
	assert.NotNil(t, err)
}
