import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  CreateEventDTO,
  GetEventDTO,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UpdateEventDTO,
} from './../../libs/common';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  // Cria um novo evento
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(@Body() data: CreateEventDTO): Promise<GetEventDTO> {
    return this.eventService.createEvent(data);
  }

  // Busca todos os eventos
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findAllEvents(): Promise<GetEventDTO[]> {
    return this.eventService.findAllEvents();
  }

  // Busca um evento por ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findEventById(@Param('id') id: string): Promise<GetEventDTO> {
    const event = await this.eventService.findEventById(+id);

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    return event;
  }

  // Atualiza um evento
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async updateEvent(
    @Param('id') id: string,
    @Body() data: UpdateEventDTO,
  ): Promise<GetEventDTO> {
    return this.eventService.updateEvent(+id, data);
  }

  // Exclui um evento
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async deleteEvent(@Param('id') id: string): Promise<GetEventDTO> {
    return this.eventService.deleteEvent(+id);
  }
}
