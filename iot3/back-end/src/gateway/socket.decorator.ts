import { SetMetadata } from '@nestjs/common';

export const EVENT_NAME_KEY = 'error_event_name';

export const ErrorEventName = (eventName: string) => SetMetadata(EVENT_NAME_KEY, eventName);
