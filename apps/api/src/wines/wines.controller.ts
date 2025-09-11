import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WinesService } from './wines.service';
import { CreateWineDto, UpdateWineDto, WineFiltersDto } from './dto/wine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Wines')
@Controller('wines')
export class WinesController {
  constructor(private readonly winesService: WinesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new wine listing' })
  @ApiResponse({ status: 201, description: 'Wine listing created successfully' })
  create(@Body() createWineDto: CreateWineDto, @CurrentUser() user: any): Promise<any> {
    return this.winesService.create(createWineDto, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search wines with filters' })
  @ApiResponse({ status: 200, description: 'Wines retrieved successfully' })
  findAll(@Query() filters: WineFiltersDto): Promise<any> {
    return this.winesService.findMany(filters);
  }

  @Public()
  @Get('filters')
  @ApiOperation({ summary: 'Get available filter options' })
  @ApiResponse({ status: 200, description: 'Filter options retrieved successfully' })
  async getFilters(): Promise<any> {
    const result = await this.winesService.findMany({ limit: 1 });
    return result.filters;
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get wine details by ID' })
  @ApiResponse({ status: 200, description: 'Wine details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  findOne(@Param('id') id: string): Promise<any> {
    return this.winesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update wine listing' })
  @ApiResponse({ status: 200, description: 'Wine updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the wine owner' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  update(
    @Param('id') id: string,
    @Body() updateWineDto: UpdateWineDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.winesService.update(id, updateWineDto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete wine listing' })
  @ApiResponse({ status: 200, description: 'Wine deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the wine owner' })
  @ApiResponse({ status: 404, description: 'Wine not found' })
  remove(@Param('id') id: string, @CurrentUser() user: any): Promise<any> {
    return this.winesService.remove(id, user.id);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get wines by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User wines retrieved successfully' })
  findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.winesService.findByUser(userId, page, limit);
  }
}