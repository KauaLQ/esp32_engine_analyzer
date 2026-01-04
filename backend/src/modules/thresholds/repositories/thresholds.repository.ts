import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ThresholdProfileDto } from '../domain/dto';

@Injectable()
export class ThresholdsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManualProfile(
    machineId: string,
    payload: Record<string, any>,
    userId?: string,
  ): Promise<ThresholdProfileDto> {
    // Start a transaction to deactivate existing profiles and create a new one
    return this.prisma.$transaction(async (tx) => {
      // Get the latest version number for this machine
      const latestProfile = await tx.machine_threshold_profiles.findFirst({
        where: { machine_id: machineId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = latestProfile ? latestProfile.version + 1 : 1;

      // Deactivate all existing profiles for this machine
      await tx.machine_threshold_profiles.updateMany({
        where: { machine_id: machineId, active: true },
        data: { active: false },
      });

      // Create new profile
      const newProfile = await tx.machine_threshold_profiles.create({
        data: {
          machine_id: machineId,
          mode: 'MANUAL',
          active: true,
          version: nextVersion,
          payload,
          created_by: userId,
        },
      });

      return this.mapToThresholdProfileDto(newProfile);
    });
  }

  async createAiProfile(
    machineId: string,
    aiRequest: Record<string, any>,
    aiResponse: Record<string, any>,
    userId?: string,
  ): Promise<ThresholdProfileDto> {
    // Start a transaction to deactivate existing profiles and create a new one
    return this.prisma.$transaction(async (tx) => {
      // Get the latest version number for this machine
      const latestProfile = await tx.machine_threshold_profiles.findFirst({
        where: { machine_id: machineId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = latestProfile ? latestProfile.version + 1 : 1;

      // Deactivate all existing profiles for this machine
      await tx.machine_threshold_profiles.updateMany({
        where: { machine_id: machineId, active: true },
        data: { active: false },
      });

      // Create new profile
      const newProfile = await tx.machine_threshold_profiles.create({
        data: {
          machine_id: machineId,
          mode: 'AI_N8N',
          active: true,
          version: nextVersion,
          payload: aiResponse,
          ai_request: aiRequest,
          ai_response: aiResponse,
          created_by: userId,
        },
      });

      return this.mapToThresholdProfileDto(newProfile);
    });
  }

  async findActiveProfile(machineId: string): Promise<ThresholdProfileDto | null> {
    const profile = await this.prisma.machine_threshold_profiles.findFirst({
      where: {
        machine_id: machineId,
        active: true,
      },
    });

    return profile ? this.mapToThresholdProfileDto(profile) : null;
  }

  async findProfileHistory(machineId: string): Promise<ThresholdProfileDto[]> {
    const profiles = await this.prisma.machine_threshold_profiles.findMany({
      where: {
        machine_id: machineId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return profiles.map(this.mapToThresholdProfileDto);
  }

  private mapToThresholdProfileDto(profile: any): ThresholdProfileDto {
    return {
      id: profile.id,
      machineId: profile.machine_id,
      mode: profile.mode,
      active: profile.active,
      version: profile.version,
      payload: profile.payload,
      aiRequest: profile.ai_request,
      aiResponse: profile.ai_response,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  }
}
