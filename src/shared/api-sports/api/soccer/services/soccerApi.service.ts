import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SoccerApiService {
  private readonly API_URL = 'https://v3.football.api-sports.io';
  private readonly API_KEY: string;

  constructor(private readonly httpService: HttpService) {
    const apiKey = process.env.APISPORTS_API_KEY;
    if (!apiKey) {
      throw new Error(
        'APISPORTS_API_KEY is not defined in environment variables',
      );
    }
    this.API_KEY = apiKey;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.API_URL}${endpoint}`;
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: { 'x-apisports-key': this.API_KEY },
        params,
      }),
    );
    return response.data as T;
  }
}
