  import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
  import { TransactionService } from './transaction.service';
  import { UpdateStatusDto } from './dto/update-status.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { RoleGuard, Roles } from '../helper/roles-guard';
  import { FileInterceptor } from '@nestjs/platform-express';

  @Controller('transaction')
  export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('checkout')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles('CUSTOMER')
    checkout(@Req() req: any) {
      return this.transactionService.checkout(req.user.id);
    }

    @Get('history')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles('CUSTOMER')
    getMyHistory(@Req() req: any) {
      return this.transactionService.getMyHistory(req.user.id);
    }

    @Patch(':id/payment')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles('CUSTOMER')
    @UseInterceptors(FileInterceptor('paymentProof'))
    uploadPaymentProof(
      @Param('id') id: string, 
      @UploadedFile() file: Express.Multer.File, 
      @Req() req: any
    ) {
      return this.transactionService.uploadPaymentProof(+id, file, req.user.id);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles('ADMIN', 'SELLER')
    getAllTransactions() {
      return this.transactionService.getAllTransactions();
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles('ADMIN', 'SELLER')
    updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
      return this.transactionService.updateStatus(+id, updateStatusDto);
    }
  }