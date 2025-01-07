import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { Config } from '../config';
import { GoogleCloudStorage } from './google-cloud.storage';

describe('GoogleCloudStorage', () => {
  let googleCloudStorage: GoogleCloudStorage;
  let storageSdk: GoogleCloudStorageSdk;

  beforeEach(() => {
    const bucketName = Config.bucketName();

    storageSdk = new GoogleCloudStorageSdk({
      credentials: Config.googleCredentials(),
    });
    googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);
  });

  describe('store', () => {
    it('should store a file', async () => {
      const saveMock = jest.fn().mockImplementation(undefined);
      const fileMock = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));

      jest.spyOn(storageSdk, 'bucket').mockImplementation(
        () =>
          ({
            file: fileMock,
          }) as any,
      );

      await googleCloudStorage.store({
        data: Buffer.from('data'),
        id: 'location/any.txt',
        mimeType: 'text/plain',
      });

      expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
      expect(fileMock).toHaveBeenCalledWith('location/any.txt');
      expect(saveMock).toHaveBeenCalledWith(Buffer.from('data'), {
        metadata: {
          contentType: 'text/plain',
        },
      });
    });
  });

  describe('get', () => {
    it('should get a file', async () => {
      const getMetadataMock = jest.fn().mockResolvedValue(
        Promise.resolve([
          {
            contentType: 'text/plain',
            name: 'location/1.txt',
          },
        ]),
      );
      const downloadMock = jest
        .fn()
        .mockResolvedValue(Promise.resolve([Buffer.from('data')]));
      const fileMock = jest.fn().mockImplementation(() => ({
        getMetadata: getMetadataMock,
        download: downloadMock,
      }));

      jest.spyOn(storageSdk, 'bucket').mockImplementation(
        () =>
          ({
            file: fileMock,
          }) as any,
      );

      const result = await googleCloudStorage.get('location/1.txt');

      expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
      expect(fileMock).toHaveBeenCalledWith('location/1.txt');
      expect(getMetadataMock).toHaveBeenCalled();
      expect(downloadMock).toHaveBeenCalled();
      expect(result).toEqual({
        data: Buffer.from('data'),
        mimeType: 'text/plain',
      });
    });
  });
});
