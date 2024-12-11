import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async Campaign(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('id') id?: string,
    @Query('name') name?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('is_active') is_active?: string,
  ): Promise<any> {
    return this.appService.Airdrop(
      page,
      pageSize,
      id,
      name,
      start_date,
      end_date,
      is_active,
    );
  }
}
