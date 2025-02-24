import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';

import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
    .setTitle('The vending device API')
    .setDescription('API Document for iot project 3: The vending device API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
