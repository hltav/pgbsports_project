/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

export const sensitiveString = (message?: string) => {
  return z
    .string()
    .min(1, message)
    .transform((val) => {
      return val;
    });
};

export const sensitiveEmail = (message?: string) => {
  return z
    .string()
    .email(message)
    .transform((val) => {
      return val;
    });
};

export const sensitiveNumber = (message?: string) => {
  return z.number().transform((val) => {
    return val;
  });
};

export const sensitiveClientData = (message?: string) => {
  return z
    .string()
    .min(1, message)
    .transform((val) => {
      return val;
    })
    .optional();
};
