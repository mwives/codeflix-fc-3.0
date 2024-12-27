import crypto from 'node:crypto';

export class MediaFileValidator {
  constructor(
    private readonly maxSize: number,
    private readonly validMimeTypes: string[],
  ) {}

  validate({
    rawName: rawName,
    mimeType: mimeType,
    size,
  }: {
    rawName: string;
    size: number;
    mimeType: string;
  }) {
    if (!this.validateSize(size)) {
      throw new InvalidMediaFileSizeError(size, this.maxSize);
    }

    if (!this.validateMimeType(mimeType)) {
      throw new InvalidMediaFileMimeTypeError(mimeType, this.validMimeTypes);
    }

    return {
      name: this.generateRandomName(rawName),
    };
  }

  private validateSize(size: number) {
    return size <= this.maxSize;
  }

  private validateMimeType(mimeType: string) {
    return this.validMimeTypes.includes(mimeType);
  }

  private generateRandomName(rawName: string) {
    const extension = rawName.split('.').pop();
    const randomName = crypto
      .createHash('sha256')
      .update(rawName + Math.random() + Date.now())
      .digest('hex');

    return `${randomName}.${extension}`;
  }
}

export class InvalidMediaFileSizeError extends Error {
  constructor(fileSize: number, maxSize: number) {
    super(
      `Invalid media file size: ${fileSize} bytes exceeds ${maxSize} bytes`,
    );
  }
}

export class InvalidMediaFileMimeTypeError extends Error {
  constructor(currentMimeType: string, validMimeTypes: string[]) {
    super(
      `Invalid media file mime type: ${currentMimeType} is not one of the valid mime types: ${validMimeTypes.join(', ')}`,
    );
  }
}
