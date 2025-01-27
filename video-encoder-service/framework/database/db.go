package database

import (
	"encoder/domain"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Database struct {
	Db          *gorm.DB
	Dsn         string
	DsnTest     string
	Debug       bool
	AutoMigrate bool
	Env         string
}

func NewDb() *Database {
	return &Database{}
}

func NewDbTest() *gorm.DB {
	dbInstance := NewDb()
	dbInstance.Env = "test"
	dbInstance.AutoMigrate = true
	dbInstance.Debug = true

	conn, err := dbInstance.Connect()
	if err != nil {
		log.Fatalf("database connection error: %v", err)
	}

	return conn
}

func (db *Database) Connect() (*gorm.DB, error) {
	var err error

	if db.Env == "test" {
		db.Db, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	} else {
		db.Db, err = gorm.Open(postgres.Open(db.Dsn), &gorm.Config{})
	}

	if err != nil {
		return nil, err
	}

	if db.Debug {
		db.Db = db.Db.Debug()
	}

	if db.AutoMigrate {
		db.Db.AutoMigrate(&domain.Video{}, &domain.Job{})
	}

	return db.Db, nil
}
