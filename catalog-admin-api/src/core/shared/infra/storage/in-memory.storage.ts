import { IStorage } from '@core/shared/application/storage.interface';

export class InMemoryStorage implements IStorage {
  private storage: Map<string, { data: Buffer; mimeType?: string }> = new Map();

  async store(object: {
    data: Buffer;
    mimeType?: string | undefined;
    id: string;
  }): Promise<void> {
    this.storage.set(object.id, {
      data: object.data,
      mimeType: object.mimeType,
    });
  }

  async get(
    id: string,
  ): Promise<{ data: Buffer; mimeType: string | undefined }> {
    const file = this.storage.get(id);
    if (!file) {
      throw new Error(`File with id ${id} not found`);
    }

    return { data: file.data, mimeType: file.mimeType };
  }
}
