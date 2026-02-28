import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import axios, { AxiosResponse } from 'axios';
import * as https from 'https';
import { JwtAuthGuard, RolesGuard } from './../../../libs';

@Controller('proxy/images')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImageUrlProxyController {
  // Apenas o hostname, sem protocolo
  private readonly ALLOWED_DOMAINS = ['media.api-sports.io'];

  @Get(':encodedUrl')
  async getImage(
    @Param('encodedUrl') encodedUrl: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      // Decodifica a URL original
      const cleanBase64 = decodeURIComponent(encodedUrl);
      const decodedUrl = Buffer.from(cleanBase64, 'base64').toString('utf-8');

      // Extrai o hostname da URL
      const hostname = new URL(decodedUrl).hostname;

      // Valida se o domínio é permitido
      if (!this.ALLOWED_DOMAINS.includes(hostname)) {
        throw new HttpException(
          'Domínio não permitido',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Faz a requisição da imagem
      const response: AxiosResponse<ArrayBuffer> = await axios.get(decodedUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (NestJS Proxy)',
          Accept: 'image/*',
        },
        // Ignora problemas de certificado em ambiente local
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      });

      // Define os headers da resposta
      const contentType =
        (response.headers['content-type'] as string | undefined) ??
        'application/octet-stream';

      res
        .header('Content-Type', contentType)
        .header('Cache-Control', 'public, max-age=2592000') // cache de 30 dias
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin');

      res.send(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new HttpException(
            'Imagem não encontrada',
            HttpStatus.NOT_FOUND,
          );
        }
        console.error('Erro axios:', error.message, error.code);
      } else {
        console.error('Erro desconhecido:', error);
      }
      throw new HttpException('Erro ao buscar imagem', HttpStatus.BAD_GATEWAY);
    }
  }
}
