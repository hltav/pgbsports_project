import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { z } from 'zod';
import { AxiosError, AxiosRequestConfig } from 'axios';

@Injectable()
export class ApiFetcherService {
  constructor(private readonly httpService: HttpService) {}

  async fetchFromApi<T>(
    url: string,
    schema: z.ZodSchema<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.httpService.get(url, config).toPromise();

      if (!response) {
        throw new Error('No response received from API');
      }

      return schema.parse(response.data);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  private handleApiError(error: unknown): Error {
    if (this.isAxiosError(error)) {
      const axiosError = error;
      if (axiosError.response) {
        return new Error(
          `API Error: ${axiosError.response.status} - ${axiosError.response.statusText}`,
        );
      }
      return new Error(`Network Error: ${axiosError.message}`);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('Unknown error occurred');
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }
}
