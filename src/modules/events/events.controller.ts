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
  Req,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard, Roles, RolesGuard } from './../../libs/common';
import {
  CreateEventDTO,
  GetEventDTO,
  UpdateEventDTO,
} from './../../libs/common/dto';
import { AuthenticatedRequest } from '../auth/dto/auth.schema';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER', 'TEST_USER')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(@Body() data: CreateEventDTO): Promise<GetEventDTO> {
    return this.eventService.createEvent(data);
  }

  @Get()
  async findAllEvents(
    @Req() req: AuthenticatedRequest,
  ): Promise<GetEventDTO[]> {
    const userId = req.user.id;
    return this.eventService.findAllEventsByUser(userId);
  }

  @Get(':id')
  async findEventById(@Param('id') id: string): Promise<GetEventDTO> {
    const event = await this.eventService.findEventById(+id);

    if (!event) {
      throw new NotFoundException('Event not found!');
    }

    return event;
  }

  @Put(':id')
  async updateEvent(
    @Param('id') id: string,
    @Body() data: UpdateEventDTO,
  ): Promise<GetEventDTO> {
    return this.eventService.updateEvent(+id, data);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string): Promise<GetEventDTO> {
    return this.eventService.deleteEvent(+id);
  }
}
