import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { MissionService } from './mission.service';
import { StepsService } from '../steps/steps.service';
import { FieldReportsService } from '../field-reports/field-reports.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { CreateStepDto } from '../steps/dto/create-step.dto';
import { UpdateStepDto } from '../steps/dto/update-step.dto';
import { CreateFieldReportDto } from '../field-reports/dto/create-field-report.dto';
import { UpdateFieldReportDto } from '../field-reports/dto/update-field-report.dto';

/**
 * Controller gérant tous les endpoints liés aux missions
 * Regroupe les opérations CRUD sur les missions, leurs étapes et leurs rapports
 */
@Controller('missions')
export class MissionController {
  constructor(
    // Injection des services nécessaires
    private readonly missionService: MissionService,
    private readonly stepsService: StepsService,
    private readonly fieldReportsService: FieldReportsService,
  ) {}

  // ====== MISSIONS CRUD ======

  /**
   * GET /missions
   * Récupère la liste de toutes les missions
   */
  @Get()
  findAll() {
    return this.missionService.findAll();
  }

  /**
   * POST /missions
   * Crée une nouvelle mission
   */
  @Post()
  create(@Body() createMissionDto: CreateMissionDto) {
    return this.missionService.create(createMissionDto);
  }

  /**
   * GET /missions/:id
   * Récupère une mission spécifique par son ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missionService.findOne(id);
  }

  /**
   * PUT /missions/:id
   * Met à jour une mission existante
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto) {
    return this.missionService.update(id, updateMissionDto);
  }

  /**
   * DELETE /missions/:id
   * Supprime une mission
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.missionService.remove(id);
  }

  /**
   * PATCH /missions/:id/cancel
   * Annule une mission
   */
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.missionService.cancel(id);
  }

  /**
   * PATCH /missions/:id/complete
   * Marque une mission comme terminée
   */
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.missionService.complete(id);
  }

  // ====== STEPS (Étapes de mission) ======

  /**
   * GET /missions/:id/steps
   * Récupère toutes les étapes d'une mission
   */
  @Get(':id/steps')
  findMissionSteps(@Param('id') id: string) {
    return this.stepsService.findByMission(id);
  }

  /**
   * POST /missions/:id/steps
   * Ajoute une nouvelle étape à une mission
   */
  @Post(':id/steps')
  async createMissionStep(
    @Param('id') id: string,
    @Body() createStepDto: CreateStepDto,
  ) {
    // Récupère d'abord la mission pour l'associer à l'étape
    const mission = await this.missionService.findOne(id);
    const stepWithMission = Object.assign({}, createStepDto, { mission });
    return this.stepsService.create(stepWithMission);
  }

  /**
   * PUT /missions/:id/steps/:stepId
   * Met à jour une étape spécifique d'une mission
   */
  @Put(':id/steps/:stepId')
  updateMissionStep(
    @Param('stepId') stepId: string,
    @Body() updateStepDto: UpdateStepDto,
  ) {
    return this.stepsService.update(stepId, updateStepDto);
  }

  /**
   * DELETE /missions/:id/steps/:stepId
   * Supprime une étape d'une mission
   */
  @Delete(':id/steps/:stepId')
  removeMissionStep(@Param('stepId') stepId: string) {
    return this.stepsService.remove(stepId);
  }

  // ====== REPORTS (Rapports de terrain) ======

  /**
   * GET /missions/:id/reports
   * Récupère tous les rapports de terrain d'une mission
   */
  @Get(':id/reports')
  findMissionReports(@Param('id') id: string) {
    return this.fieldReportsService.findByMission(id);
  }

  /**
   * POST /missions/:id/reports
   * Ajoute un nouveau rapport de terrain à une mission
   */
  @Post(':id/reports')
  async createMissionReport(
    @Param('id') id: string,
    @Body() createReportDto: CreateFieldReportDto,
  ) {
    // Récupère d'abord la mission pour l'associer au rapport
    const mission = await this.missionService.findOne(id);
    const reportWithMission = Object.assign({}, createReportDto, { mission });
    return this.fieldReportsService.create(reportWithMission);
  }

  /**
   * PUT /missions/:id/reports/:reportId
   * Met à jour un rapport de terrain spécifique
   */
  @Put(':id/reports/:reportId')
  updateMissionReport(
    @Param('reportId') reportId: string,
    @Body() updateReportDto: UpdateFieldReportDto,
  ) {
    return this.fieldReportsService.update(reportId, updateReportDto);
  }

  /**
   * DELETE /missions/:id/reports/:reportId
   * Supprime un rapport de terrain
   */
  @Delete(':id/reports/:reportId')
  removeMissionReport(@Param('reportId') reportId: string) {
    return this.fieldReportsService.remove(reportId);
  }
}
