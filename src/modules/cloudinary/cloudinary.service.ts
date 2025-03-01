
import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary, ConfigOptions, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

import { CloudinaryResponse } from './cloudinary-response';

interface CloudinaryObj{
  folder: string;
  public_id?: string;
}

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinaryProvider: ConfigOptions) {
    cloudinary.config(cloudinaryProvider); 
  }

  async deleteResourcesByPrefix(prefix: string): Promise<any> {
    return cloudinary.api.delete_resources_by_prefix(prefix)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      });
  }

  async deleteFolder(folderPath: string): Promise<any> {
    return cloudinary.api.delete_folder(folderPath)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      });
  }

  //uploade image from device
  uploadFile(
    file: Express.Multer.File,
    options: CloudinaryObj,
  ): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  //uploade online image form goole ..
  async uploadeImage(imagePath: string, options: CloudinaryObj):Promise<UploadApiResponse> {
    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
