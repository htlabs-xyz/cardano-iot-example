import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  //app.useLogger(false);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (validateErrors: ValidationError[] = []) => {
        const messages = validateErrors.reduce((acc, error) => {
          const constraints = Object.values(error.constraints ?? {});
          return [...acc, ...constraints];
        }, [] as string[]);
        return new BadRequestException(messages);
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('The locking device API')
    .setDescription('API Document for iot project 2: The locking device API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: process.env.FRONT_END_HOST ?? '*',
    credentials: true,
  });
  await app.listen(process.env.SERVER_PORT ?? 3002);
}
bootstrap();
