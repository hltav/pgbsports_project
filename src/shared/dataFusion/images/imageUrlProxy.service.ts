import { Injectable } from '@nestjs/common';

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string | null | undefined ? K : never;
}[keyof T];

@Injectable()
export class ImageUrlProxyService {
  convertToProxyUrl(externalUrl: string | null | undefined): string | null {
    if (!externalUrl) return null;

    if (externalUrl.startsWith('/proxy/images/')) {
      return externalUrl;
    }

    try {
      const encodedUrl = Buffer.from(externalUrl).toString('base64');

      return `/proxy/images/${encodeURIComponent(encodedUrl)}`;
    } catch (error) {
      console.error('Erro ao converter URL:', externalUrl, error);
      return null;
    }
  }

  processImageUrls<T extends Record<string, unknown>>(
    data: T,
    imageFields: StringKeys<T>[],
  ): T {
    const processed = { ...data };

    imageFields.forEach((field) => {
      const fieldValue = processed[field];
      if (typeof fieldValue === 'string') {
        processed[field] = (this.convertToProxyUrl(fieldValue) ??
          fieldValue) as T[typeof field];
      }
    });

    return processed;
  }

  processImageUrlsArray<T extends Record<string, unknown>>(
    dataArray: T[],
    imageFields: StringKeys<T>[],
  ): T[] {
    return dataArray.map((item) => this.processImageUrls(item, imageFields));
  }
}
