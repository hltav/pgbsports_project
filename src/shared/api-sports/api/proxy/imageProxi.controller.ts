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
import { JwtAuthGuard, RolesGuard } from '../../../../libs';

@Controller('proxy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImageProxyController {
  @Get('league-logo/:encodedUrl')
  async getLeagueLogo(
    @Param('encodedUrl') encodedUrl: string,
    @Res() res: FastifyReply,
  ): Promise<void> {
    try {
      const decodedUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');

      if (!decodedUrl.startsWith('https://media.api-sports.io/')) {
        throw new HttpException('URL inválida', HttpStatus.BAD_REQUEST);
      }

      const response: AxiosResponse<ArrayBuffer> = await axios.get(decodedUrl, {
        responseType: 'arraybuffer',
      });

      res
        .header('Content-Type', response.headers['content-type'] || 'image/png')
        .header('Cache-Control', 'public, max-age=86400')
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
        .header('Access-Control-Allow-Credentials', 'true')
        .header(
          'Access-Control-Expose-Headers',
          'Content-Type, Content-Length',
        );

      res.send(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpException('Imagem não encontrada', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Erro ao buscar imagem', HttpStatus.BAD_GATEWAY);
    }
  }
}
