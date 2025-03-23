import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000','https://barber-sys1.vercel.app'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000
  //global validationPipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  //error handling
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(port,()=>console.log(`server listening on ${port}`));
}
bootstrap();
