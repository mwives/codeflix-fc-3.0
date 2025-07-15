import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { SaveCategoryInput } from '@core/category/application/use-cases/save-category/save-category.input';
import { SaveCategoryUseCase } from '@core/category/application/use-cases/save-category/save-category.use-case';
import {
  Controller,
  Inject,
  Logger,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { CDCPayloadDto } from 'src/nest-modules/kafka-module/cdc.dto';
import { KConnectEventPattern } from 'src/nest-modules/kafka-module/kconnect-event-pattern.decorator';
import { TombstoneEventInterceptor } from 'src/nest-modules/kafka-module/tombstone-event.interceptor';

@Controller()
export class CategoriesConsumer {
  private readonly logger = new Logger(CategoriesConsumer.name);
  private readonly validationPipe = new ValidationPipe({
    errorHttpStatusCode: 422,
    transform: true,
  });

  @Inject(SaveCategoryUseCase)
  private saveUseCase: SaveCategoryUseCase;

  @Inject(DeleteCategoryUseCase)
  private deleteUseCase: DeleteCategoryUseCase;

  @UseInterceptors(TombstoneEventInterceptor)
  @KConnectEventPattern('categories')
  async handle(
    @Payload(new ValidationPipe()) message: CDCPayloadDto,
  ): Promise<void> {
    this.logger.log(`Processing CDC operation: ${message.op}`);

    switch (message.op) {
      case 'r':
        this.logger.log(
          `[INFO] ${CategoriesConsumer.name} - Discarding read operation`,
        );
        return;

      case 'c':
      case 'u':
        await this.handleCreateOrUpdate(message);
        break;

      case 'd':
        await this.handleDelete(message);
        break;

      default:
        this.logger.warn(`Unknown operation: ${message.op}`);
    }
  }

  private async handleCreateOrUpdate(message: CDCPayloadDto): Promise<void> {
    try {
      const inputData = {
        category_id: message.after.category_id,
        name: message.after.name,
        description: message.after.description,
        is_active: message.after.is_active,
        created_at: message.after.created_at,
      };

      const validatedInput = await this.validationPipe.transform(inputData, {
        type: 'body',
        metatype: SaveCategoryInput,
      });

      await this.saveUseCase.execute(validatedInput);
      this.logger.log(
        `[INFO] ${CategoriesConsumer.name} - Successfully processed ${message.op} operation for category: ${message.after.id}`,
      );
    } catch (error) {
      this.logger.error(
        `[ERROR] ${CategoriesConsumer.name} - Failed to process ${message.op} operation for category: ${message.after.id}`,
        error,
      );
      throw error;
    }
  }

  private async handleDelete(message: CDCPayloadDto): Promise<void> {
    try {
      await this.deleteUseCase.execute({ id: message.before.id });
      this.logger.log(
        `[INFO] ${CategoriesConsumer.name} - Successfully deleted category: ${message.before.id}`,
      );
    } catch (error) {
      this.logger.error(
        `[ERROR] ${CategoriesConsumer.name} - Failed to process delete operation for category: ${message.before.id}`,
        error,
      );
      throw error;
    }
  }
}

