import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './common/response.interceptor';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

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
        //console.log("ƯUUWUUWUWU")
        return new BadRequestException(messages);
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Temperature Sensor API')
    .setDescription('API Document for iot project 1: Temperature Sensor API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Enable CORS for all origins
  app.enableCors({
    allowedHeaders: ['content-type'],
    origin: 'http://localhost:3001',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
