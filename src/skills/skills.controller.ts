import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SkillsService } from './skill.service';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import * as SkillsDtoSchema from './skills.dto';
import * as SkillsSwaggerSchemas from './skills.swagger.schemas';
import * as SkillsSwaggerExample from './skills.swagger.example';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /**
   * Skills
   */

  @Get()
  findAll() {
    return this.skillsService.findAllAndCompute('ALL_SKILLS_WITH_COUNTS');
  }

  @Get('formattedSeries/:allSkills')
  @ApiParam({
    name: 'allSkills',
    type: 'boolean',
    description:
      'Use false to get only the T1 series which have an option to choose sub-electives. ',
  })
  findFormattedSeries(@Param('allSkills') allSkills: string) {
    return this.skillsService.getFormattedSeries(allSkills);
  }

  @Get('tier1-total-skills')
  tier1TotalSkills() {
    return this.skillsService.findAllAndCompute('TIER1_TOTAL_SKILLS');
  }

  /**
   * Tier 1
   */
  @Get('tier1')
  findAllTier1() {
    return this.skillsService.findAllTier1();
  }

  @Get(':skillId')
  findOne(@Param('skillId') skillId: string) {
    return this.skillsService.findAllAndCompute(+skillId);
  }

  @Post('tier1')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier1SwaggerSchema,
    examples: SkillsSwaggerExample.tier1DtoSwaggerExample,
  })
  createTier1(@Body() createTier1Dto: SkillsDtoSchema.Tier1DtoSchema) {
    const validatedData = SkillsDtoSchema.tier1DtoSchema.parse(createTier1Dto);
    return this.skillsService.createTier1(validatedData);
  }

  @Get('tier1/:tier1Id')
  findTier1(@Param('tier1Id') tier1Id: string) {
    return this.skillsService.findTier1(+tier1Id);
  }

  @Patch('tier1/:tier1Id')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier1SwaggerSchema,
    examples: SkillsSwaggerExample.tier1DtoSwaggerExample,
  })
  updateTier1(
    @Param('tier1Id') tier1Id: string,
    @Body() updateTier1Dto: SkillsDtoSchema.Tier1DtoSchema,
  ) {
    const validatedData = SkillsDtoSchema.tier1DtoSchema.parse(updateTier1Dto);
    return this.skillsService.updateTier1(+tier1Id, validatedData);
  }

  @Delete('tier1/:tier1Id')
  deleteTier1(@Param('tier1Id') tier1Id: string) {
    return this.skillsService.deleteTier1(+tier1Id);
  }

  /**
   * Tier 2
   */
  @Get('tier1/:tier1Id/tier2')
  findAllTier2(@Param('tier1Id') tier1Id: string) {
    return this.skillsService.findAllTier2(+tier1Id);
  }

  @Post('tier1/:tier1Id/tier2')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier2SwaggerSchema,
    examples: SkillsSwaggerExample.tier2DtoSwaggerExample,
  })
  createTier2(
    @Param('tier1Id') tier1Id: string,
    @Body() createTier2Dto: SkillsDtoSchema.Tier2DtoSchema,
  ) {
    const validatedData = SkillsDtoSchema.tier2DtoSchema.parse(createTier2Dto);
    return this.skillsService.createTier2(+tier1Id, validatedData);
  }

  @Get('tier1/:tier1Id/tier2/:tier2Id')
  findTier2(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
  ) {
    return this.skillsService.findTier2(+tier1Id, +tier2Id);
  }

  @Patch('tier1/:tier1Id/tier2/:tier2Id')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier2SwaggerSchema,
    examples: SkillsSwaggerExample.tier2DtoSwaggerExample,
  })
  updateTier2(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Body() updateTier2Dto: SkillsDtoSchema.Tier2DtoSchema,
  ) {
    const validatedData = SkillsDtoSchema.tier2DtoSchema.parse(updateTier2Dto);
    return this.skillsService.updateTier2(+tier1Id, +tier2Id, validatedData);
  }

  @Delete('tier1/:tier1Id/tier2/:tier2Id')
  deleteTier2(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
  ) {
    return this.skillsService.deleteTier2(+tier1Id, +tier2Id);
  }

  /**
   * Tier 3
   */
  @Get('tier1/:tier1Id/tier2/:tier2Id/tier3')
  findAllTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
  ) {
    return this.skillsService.findAllTier3(+tier1Id, +tier2Id);
  }

  @Post('tier1/:tier1Id/tier2/:tier2Id/tier3')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier3SwaggerSchema,
    examples: SkillsSwaggerExample.tier3DtoSwaggerExample,
  })
  createTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Body() createTier3Dto: SkillsDtoSchema.Tier3DtoSchema,
  ) {
    const validatedData = SkillsDtoSchema.tier3DtoSchema.parse(createTier3Dto);
    return this.skillsService.createTier3(+tier1Id, +tier2Id, validatedData);
  }

  @Get('tier1/:tier1Id/tier2/:tier2Id/tier3/:tier3Id')
  findTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Param('tier3Id') tier3Id: string,
  ) {
    return this.skillsService.findTier3(+tier1Id, +tier2Id, +tier3Id);
  }

  @Patch('tier1/:tier1Id/tier2/:tier2Id/tier3/:tier3Id')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier3SwaggerSchema,
    examples: SkillsSwaggerExample.tier3DtoSwaggerExample,
  })
  updateTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Param('tier3Id') tier3Id: string,
    @Body() updateTier3Dto: SkillsDtoSchema.Tier3DtoSchema,
  ) {
    const validatedData = SkillsDtoSchema.tier3DtoSchema.parse(updateTier3Dto);
    return this.skillsService.updateTier3(
      +tier1Id,
      +tier2Id,
      +tier3Id,
      validatedData,
    );
  }

  @Patch('tier1/:tier1Id/tier2/:tier2Id/tier3/:tier3Id/isActive')
  @ApiBody({
    schema: SkillsSwaggerSchemas.tier3IsActiveSwaggerSchema,
    examples: SkillsSwaggerExample.tier3IsActiveDtoSwaggerExample,
  })
  updateIsActiveTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Param('tier3Id') tier3Id: string,
    @Body() updateIsActiveTier3: SkillsDtoSchema.IsActiveDtoSchema,
  ) {
    const validatedData =
      SkillsDtoSchema.isActiveDtoSchema.parse(updateIsActiveTier3);
    return this.skillsService.updateIsActiveTier3(
      +tier1Id,
      +tier2Id,
      +tier3Id,
      validatedData,
    );
  }

  @Delete('tier1/:tier1Id/tier2/:tier2Id/tier3/:tier3Id')
  deleteTier3(
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Param('tier3Id') tier3Id: string,
  ) {
    return this.skillsService.deleteTier3(+tier1Id, +tier2Id, +tier3Id);
  }
}
