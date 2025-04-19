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
import { JwtAuthGuard, Roles, RolesGuard } from './../../libs/common';
import {
  CreateEventDTO,
  GetEventDTO,
  UpdateEventDTO,
} from './../../libs/common/dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(@Body() data: CreateEventDTO): Promise<GetEventDTO> {
    return this.eventService.createEvent(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async findAllEvents(): Promise<GetEventDTO[]> {
    return this.eventService.findAllEvents();
  }

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

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async updateEvent(
    @Param('id') id: string,
    @Body() data: UpdateEventDTO,
  ): Promise<GetEventDTO> {
    return this.eventService.updateEvent(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER')
  async deleteEvent(@Param('id') id: string): Promise<GetEventDTO> {
    return this.eventService.deleteEvent(+id);
  }
}
