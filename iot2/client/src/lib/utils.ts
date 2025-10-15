import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function assertApiResponse<T>(data: any): T {
  console.log("http data:", data)
  // if (typeof data.status !== 'boolean' ||
  //   (Array.isArray(data.message) === false && data.message !== null)) {
  //   throw new Error('Invalid API response structure');
  // }
  // else if (data.status == false) {
  //   //handleErrorApi({error:data.message});
  //   //console.log(data.message)
  //   throw new Array(data.message);
  // }
  return data as T;
}