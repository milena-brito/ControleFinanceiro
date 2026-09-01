import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import {
  createTransactionSchema,
  listTransactionsQuerySchema,
  updateTransactionSchema,
  type CreateTransactionInput,
  type ListTransactionsQuery,
  type UpdateTransactionInput,
} from './transactions.schema.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    return this.transactionsService.create(user.id, body);
  }

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(listTransactionsQuerySchema))
    query: ListTransactionsQuery,
  ) {
    return this.transactionsService.list(user.id, query);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    body: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: { id: string },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.remove(user.id, id);
  }
}
