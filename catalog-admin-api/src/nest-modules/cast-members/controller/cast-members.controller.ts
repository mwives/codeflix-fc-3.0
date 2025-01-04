import { CastMemberOutput } from '@core/cast-member/application/usecases/common/cast-member-output';
import { CreateCastMemberUseCase } from '@core/cast-member/application/usecases/create-cast-member/create-cast-member.usecase';
import { DeleteCastMemberUseCase } from '@core/cast-member/application/usecases/delete-cast-member/delete-cast-member.usecase';
import { GetCastMemberUseCase } from '@core/cast-member/application/usecases/get-cast-member/get-cast-member.usecase';
import { ListCastMembersUseCase } from '@core/cast-member/application/usecases/list-cast-members/list-cast-members.usecase';
import { UpdateCastMemberInput } from '@core/cast-member/application/usecases/update-cast-member/update-cast-member.input';
import { UpdateCastMemberUseCase } from '@core/cast-member/application/usecases/update-cast-member/update-cast-member.usecase';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import { SearchCastMemberDto } from '../dto/search-cast-member.dto';
import { UpdateCastMemberDto } from '../dto/update-cast-member.dto';

@Controller('cast-members')
export class CastMembersController {
  @Inject(CreateCastMemberUseCase)
  private createCastMemberUseCase: CreateCastMemberUseCase;

  @Inject(UpdateCastMemberUseCase)
  private updateCastMemberUseCase: UpdateCastMemberUseCase;

  @Inject(DeleteCastMemberUseCase)
  private deleteCastMemberUseCase: DeleteCastMemberUseCase;

  @Inject(GetCastMemberUseCase)
  private getCastMemberUseCase: GetCastMemberUseCase;

  @Inject(ListCastMembersUseCase)
  private listCastMembersUseCase: ListCastMembersUseCase;

  @Post()
  async create(@Body() createCastMemberDto: CreateCastMemberDto) {
    const output =
      await this.createCastMemberUseCase.execute(createCastMemberDto);
    return CastMembersController.serialize(output);
  }

  @Get()
  async search(@Query() searchParams: SearchCastMemberDto) {
    const output = await this.listCastMembersUseCase.execute(searchParams);
    return new CastMemberCollectionPresenter(output);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    const output = await this.getCastMemberUseCase.execute({ id });
    return CastMembersController.serialize(output);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateCastMemberDto: UpdateCastMemberDto,
  ) {
    const input = new UpdateCastMemberInput({ id, ...updateCastMemberDto });
    const output = await this.updateCastMemberUseCase.execute(input);
    return CastMembersController.serialize(output);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.deleteCastMemberUseCase.execute({ id });
  }

  static serialize(output: CastMemberOutput) {
    return new CastMemberPresenter(output);
  }
}
