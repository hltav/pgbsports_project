import { z } from 'zod';
import { decimalSchema } from './../../../libs/common/dto/decimalSchema.interface';
import { OperationType, Result, MatchStatus, AlertType } from '@prisma/client';

// HELPERS
export const optionalDecimalSchema = decimalSchema.optional().nullable();
export const optionalNumberSchema = z.number().optional().nullable();
export const optionalStringSchema = z.string().optional().nullable();
export const optionalDateSchema = z.coerce.date().optional().nullable();

// ENUMS
export const OperationTypeEnum = z.nativeEnum(OperationType);
export const ResultEnum = z.nativeEnum(Result);
export const EventStatusEnum = z.nativeEnum(MatchStatus);
export const AlertTypeEnum = z.nativeEnum(AlertType);
