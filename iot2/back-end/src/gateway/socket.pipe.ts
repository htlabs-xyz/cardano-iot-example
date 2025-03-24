import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  ValidationPipe,
  ValidationError,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class SocketValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  // Define exceptionFactory as a property, not a method
  exceptionFactory = (validateErrors: ValidationError[] = []) => {
    const messages = validateErrors.reduce((acc, error) => {
      const constraints = Object.values(error.constraints ?? {});
      return [...acc, ...constraints];
    }, [] as string[]);

    return new WsException({
      statusCode: 1003,
      message: messages,
      error: 'Socket server internal error',
    });
  };

  // Optionally, override transform method to log the payload or perform other tasks
  transform(value: any, metadata: ArgumentMetadata) {
    // console.log('Transformed Payload:', value);  // Log or inspect the transformed payload
    // console.log("typeof payload: ", typeof value)
    // console.log("typeof metadata: ", typeof metadata)
    const jsonObject = JSON.parse(value);
    return super.transform(jsonObject, metadata); // Call the parent method to proceed with transformation
  }
}
