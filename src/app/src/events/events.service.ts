import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateEventDTO,
  GetEventDTO,
  UpdateEventDTO,
} from '../../../libs/common/src';
import { PrismaService } from '../../../libs';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Cria um novo evento
  async createEvent(data: CreateEventDTO): Promise<GetEventDTO> {
    const event = await this.prisma.event.create({
      data: {
        bankId: data.bankId,
        eventType: data.eventType,
        event: data.event,
        market: data.market,
        amount: data.amount,
        result: data.result || 'pending', // Valor padrão
      },
    });

    return event;
  }

  // Busca todos os eventos
  async findAllEvents(): Promise<GetEventDTO[]> {
    return this.prisma.event.findMany();
  }

  // Busca um evento por ID
  async findEventById(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    return event;
  }

  // Atualiza um evento
  async updateEvent(id: number, data: UpdateEventDTO): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data,
    });

    return updatedEvent;
  }

  // Exclui um evento
  async deleteEvent(id: number): Promise<GetEventDTO> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return event;
  }
}
