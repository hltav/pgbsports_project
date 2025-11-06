import {
  Controller,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import axios, { AxiosResponse } from 'axios';

@Controller('proxy/badges')
export class TSDBImageProxyController {
  @Get('thesportsdb/:encodedUrl')
  async getTheSportsDbImage(
    @Param('encodedUrl') encodedUrl: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

      if (
        !decodedUrl.startsWith('https://r2.thesportsdb.com/images/media/') &&
        !decodedUrl.startsWith('https://www.thesportsdb.com/images/media/')
      ) {
        throw new HttpException('URL inválida', HttpStatus.BAD_REQUEST);
      }

      const response: AxiosResponse<ArrayBuffer> = await axios.get(decodedUrl, {
        responseType: 'arraybuffer',
      });

      res
        .header('Content-Type', response.headers['content-type'] || 'image/png')
        .header('Cache-Control', 'public, max-age=86400') // cache de 1 dia
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
        .header('Access-Control-Allow-Credentials', 'true')
        .header(
          'Access-Control-Expose-Headers',
          'Content-Type, Content-Length',
        );

      res.send(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpException('Imagem não encontrada', HttpStatus.NOT_FOUND);
      }
      if (error instanceof Error) {
        console.error('Erro ao buscar imagem:', error.message);
      } else {
        console.error('Erro desconhecido ao buscar imagem:', error);
      }
      throw new HttpException('Erro ao buscar imagem', HttpStatus.BAD_GATEWAY);
    }
  }
}
