import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { SportsApiService } from '../api/sportsApi.service';
import { AxiosHeaders, AxiosResponse } from 'axios';

describe('SportsApiService', () => {
  let service: SportsApiService;
  let httpService: HttpService;
  let httpServiceGetSpy: jest.SpyInstance;

  beforeEach(async () => {
    process.env.APISPORTS_API_KEY = 'fake-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SportsApiService,
        {
          provide: HttpService,
          useValue: {
            get: () => of({}),
          },
        },
      ],
    }).compile();

    service = module.get<SportsApiService>(SportsApiService);
    httpService = module.get<HttpService>(HttpService);

    httpServiceGetSpy = jest.spyOn(httpService, 'get');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se a API_KEY não estiver definida', () => {
    delete process.env.APISPORTS_API_KEY;
    expect(() => new SportsApiService(httpService)).toThrowError(
      'APISPORTS_API_KEY is not defined in environment variables',
    );
  });

  it('deve chamar a API com headers e params corretos', async () => {
    const mockData = { result: 'ok' };

    const mockHeaders = new AxiosHeaders();

    mockHeaders.set('content-type', 'application/json');
    const mockResponse: AxiosResponse = {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: mockHeaders,
      },
    };

    httpServiceGetSpy.mockReturnValueOnce(of(mockResponse));

    const result = await service.get<{ result: string }>('/leagues', {
      country: 'Brazil',
    });

    expect(httpServiceGetSpy).toHaveBeenCalledWith(
      'https://v3.football.api-sports.io/leagues',
      {
        headers: { 'x-apisports-key': 'fake-key' },
        params: { country: 'Brazil' },
      },
    );
    expect(result).toEqual(mockData);
  });
});
