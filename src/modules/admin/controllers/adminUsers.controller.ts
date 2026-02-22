import { UseGuards, Controller, Patch, Param, Body, Req } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from './../../../libs';
import { AdminUsersService } from '../services/adminUsers.service';
import { ChangeUserRoleDto } from '../schemas/userRole.schema';
import { Request } from './../../../libs/common/interface/request.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Patch(':id/suspend')
  suspend(@Param('id') id: number, @Req() req: Request) {
    const currentUser = req.user;

    return this.adminUsersService.suspendUser(id, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  @Patch(':id/role')
  changeRole(
    @Param('id') id: number,
    @Body() dto: ChangeUserRoleDto,
    @Req() req: Request,
  ) {
    const currentUser = req.user;

    return this.adminUsersService.changeRole(id, dto.role, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }
}
