import { ParseFilePipeBuilder } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

import { extentions } from '../shared/constants.shared';

export function createFileUploadPipe() {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: extentions.images, 
    })
    .addMaxSizeValidator({
      maxSize: 1000000, // 1MB
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, 
    });
}
