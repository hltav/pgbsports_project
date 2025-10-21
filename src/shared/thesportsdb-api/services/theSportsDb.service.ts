import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TheSportsDbService {
  private readonly API_URL = 'https://www.thesportsdb.com/api/v2/json/';
  private readonly API_KEY: string;

  constructor(private readonly httpService: HttpService) {
    const apiKey = process.env.THESPORTSDB_KEY;
    if (!apiKey) {
      throw new Error(
        'THESPORTSDB_KEY is not defined in environment variables',
      );
    }
    this.API_KEY = apiKey;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.API_URL}${endpoint}`;
    const response = await firstValueFrom(
      this.httpService.get(url, {
        headers: { 'X-API-KEY': this.API_KEY },
        params,
      }),
    );
    return response.data as T;
  }
}
