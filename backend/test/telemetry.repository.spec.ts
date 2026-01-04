import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { TelemetryRepository } from '../src/modules/telemetry/repositories/telemetry.repository';
import { BucketSize, FillType } from '../src/modules/telemetry/domain/dto/telemetry-query.dto';

describe('TelemetryRepository', () => {
  let repository: TelemetryRepository;
  let prisma: PrismaService;
  
  // Test machine ID - should be a valid UUID in your database
  const machineId = '00000000-0000-0000-0000-000000000001'; // Replace with a valid machine ID
  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetryRepository, PrismaService],
    }).compile();

    repository = module.get<TelemetryRepository>(TelemetryRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await prisma.telemetry_readings.deleteMany({
      where: { machine_id: machineId },
    });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.telemetry_readings.deleteMany({
      where: { machine_id: machineId },
    });
    await prisma.$disconnect();
  });

  describe('findSeries', () => {
    it('should return raw points when bucket is not specified', async () => {
      // Create test data
      const now = new Date();
      const readings = [
        {
          machine_id: machineId,
          ts: new Date(now.getTime() - 120000), // 2 minutes ago
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        {
          machine_id: machineId,
          ts: new Date(now.getTime() - 60000), // 1 minute ago
          payload: { voltageV: 225, currentA: 5.5, temperatureC: 46, seq: 2 },
        },
        {
          machine_id: machineId,
          ts: now, // now
          payload: { voltageV: 230, currentA: 6, temperatureC: 47, seq: 3 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test voltage series
      const result = await repository.findSeries('voltage', {
        machineId,
        from: new Date(now.getTime() - 180000).toISOString(), // 3 minutes ago
        to: now.toISOString(),
      });

      // Verify result
      expect(result.data).toHaveLength(3);
      expect(result.data[0].value).toBe(220);
      expect(result.data[1].value).toBe(225);
      expect(result.data[2].value).toBe(230);
      expect(result.total).toBe(3);
      expect(result.bucket).toBeUndefined();
    });

    it('should aggregate data when bucket is specified', async () => {
      // Create test data with timestamps that will fall into 2 buckets
      const now = new Date();
      const baseTime = Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
      
      const readings = [
        // First bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime - 14 * 60 * 1000), // 14 minutes before bucket boundary
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        {
          machine_id: machineId,
          ts: new Date(baseTime - 7 * 60 * 1000), // 7 minutes before bucket boundary
          payload: { voltageV: 230, currentA: 5.5, temperatureC: 46, seq: 2 },
        },
        // Second bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime + 5 * 60 * 1000), // 5 minutes after bucket boundary
          payload: { voltageV: 240, currentA: 6, temperatureC: 47, seq: 3 },
        },
        {
          machine_id: machineId,
          ts: new Date(baseTime + 10 * 60 * 1000), // 10 minutes after bucket boundary
          payload: { voltageV: 250, currentA: 6.5, temperatureC: 48, seq: 4 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test voltage series with 15m bucket
      const result = await repository.findSeries('voltage', {
        machineId,
        from: new Date(baseTime - 20 * 60 * 1000).toISOString(), // 20 minutes before bucket boundary
        to: new Date(baseTime + 20 * 60 * 1000).toISOString(), // 20 minutes after bucket boundary
        bucket: BucketSize.FIFTEEN_MINUTES,
      });

      // Verify result
      expect(result.data).toHaveLength(2);
      // First bucket should have average of 220 and 230
      expect(result.data[0].value).toBeCloseTo(225, 1);
      // Second bucket should have average of 240 and 250
      expect(result.data[1].value).toBeCloseTo(245, 1);
      expect(result.total).toBe(2);
      expect(result.bucket).toBe(BucketSize.FIFTEEN_MINUTES);
    });

    it('should fill gaps with null when fill=null', async () => {
      // Create test data with a gap
      const now = new Date();
      const baseTime = Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
      
      const readings = [
        // First bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime - 30 * 60 * 1000), // 30 minutes before bucket boundary
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        // Gap (no data for the middle bucket)
        // Third bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime + 5 * 60 * 1000), // 5 minutes after bucket boundary
          payload: { voltageV: 240, currentA: 6, temperatureC: 47, seq: 3 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test voltage series with 15m bucket and fill=null
      const result = await repository.findSeries('voltage', {
        machineId,
        from: new Date(baseTime - 45 * 60 * 1000).toISOString(), // 45 minutes before bucket boundary
        to: new Date(baseTime + 15 * 60 * 1000).toISOString(), // 15 minutes after bucket boundary
        bucket: BucketSize.FIFTEEN_MINUTES,
        fill: FillType.NULL,
      });

      // Verify result
      expect(result.data).toHaveLength(4); // Should have 4 buckets (including the gap)
      expect(result.data[0].value).toBe(220);
      expect(result.data[1].value).toBeNull(); // Gap should be filled with null
      expect(result.data[2].value).toBeNull(); // Gap should be filled with null
      expect(result.data[3].value).toBe(240);
      expect(result.fill).toBe(FillType.NULL);
    });

    it('should fill gaps with zero when fill=zero', async () => {
      // Create test data with a gap
      const now = new Date();
      const baseTime = Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
      
      const readings = [
        // First bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime - 30 * 60 * 1000), // 30 minutes before bucket boundary
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        // Gap (no data for the middle bucket)
        // Third bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime + 5 * 60 * 1000), // 5 minutes after bucket boundary
          payload: { voltageV: 240, currentA: 6, temperatureC: 47, seq: 3 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test voltage series with 15m bucket and fill=zero
      const result = await repository.findSeries('voltage', {
        machineId,
        from: new Date(baseTime - 45 * 60 * 1000).toISOString(), // 45 minutes before bucket boundary
        to: new Date(baseTime + 15 * 60 * 1000).toISOString(), // 15 minutes after bucket boundary
        bucket: BucketSize.FIFTEEN_MINUTES,
        fill: FillType.ZERO,
      });

      // Verify result
      expect(result.data).toHaveLength(4); // Should have 4 buckets (including the gap)
      expect(result.data[0].value).toBe(220);
      expect(result.data[1].value).toBe(0); // Gap should be filled with zero
      expect(result.data[2].value).toBe(0); // Gap should be filled with zero
      expect(result.data[3].value).toBe(240);
      expect(result.fill).toBe(FillType.ZERO);
    });
  });

  describe('findMultiSeries', () => {
    it('should return multiple metrics in a single response', async () => {
      // Create test data
      const now = new Date();
      const readings = [
        {
          machine_id: machineId,
          ts: new Date(now.getTime() - 120000), // 2 minutes ago
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        {
          machine_id: machineId,
          ts: new Date(now.getTime() - 60000), // 1 minute ago
          payload: { voltageV: 225, currentA: 5.5, temperatureC: 46, seq: 2 },
        },
        {
          machine_id: machineId,
          ts: now, // now
          payload: { voltageV: 230, currentA: 6, temperatureC: 47, seq: 3 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test multi-series
      const result = await repository.findMultiSeries({
        machineId,
        from: new Date(now.getTime() - 180000).toISOString(), // 3 minutes ago
        to: now.toISOString(),
        metrics: 'voltage,current',
      });

      // Verify result
      expect(result.data).toHaveLength(3);
      expect(result.data[0].values).toHaveProperty('voltageV', 220);
      expect(result.data[0].values).toHaveProperty('currentA', 5);
      expect(result.data[0].values).not.toHaveProperty('temperatureC');
      expect(result.data[1].values).toHaveProperty('voltageV', 225);
      expect(result.data[1].values).toHaveProperty('currentA', 5.5);
      expect(result.data[2].values).toHaveProperty('voltageV', 230);
      expect(result.data[2].values).toHaveProperty('currentA', 6);
      expect(result.total).toBe(3);
    });

    it('should aggregate multiple metrics when bucket is specified', async () => {
      // Create test data with timestamps that will fall into 2 buckets
      const now = new Date();
      const baseTime = Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
      
      const readings = [
        // First bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime - 14 * 60 * 1000), // 14 minutes before bucket boundary
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        {
          machine_id: machineId,
          ts: new Date(baseTime - 7 * 60 * 1000), // 7 minutes before bucket boundary
          payload: { voltageV: 230, currentA: 5.5, temperatureC: 46, seq: 2 },
        },
        // Second bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime + 5 * 60 * 1000), // 5 minutes after bucket boundary
          payload: { voltageV: 240, currentA: 6, temperatureC: 47, seq: 3 },
        },
        {
          machine_id: machineId,
          ts: new Date(baseTime + 10 * 60 * 1000), // 10 minutes after bucket boundary
          payload: { voltageV: 250, currentA: 6.5, temperatureC: 48, seq: 4 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test multi-series with 15m bucket
      const result = await repository.findMultiSeries({
        machineId,
        from: new Date(baseTime - 20 * 60 * 1000).toISOString(), // 20 minutes before bucket boundary
        to: new Date(baseTime + 20 * 60 * 1000).toISOString(), // 20 minutes after bucket boundary
        bucket: BucketSize.FIFTEEN_MINUTES,
        metrics: 'voltage,current,temperature',
      });

      // Verify result
      expect(result.data).toHaveLength(2);
      // First bucket should have averages
      expect(result.data[0].values.voltageV).toBeCloseTo(225, 1); // avg of 220 and 230
      expect(result.data[0].values.currentA).toBeCloseTo(5.25, 2); // avg of 5 and 5.5
      expect(result.data[0].values.temperatureC).toBeCloseTo(45.5, 1); // avg of 45 and 46
      // Second bucket should have averages
      expect(result.data[1].values.voltageV).toBeCloseTo(245, 1); // avg of 240 and 250
      expect(result.data[1].values.currentA).toBeCloseTo(6.25, 2); // avg of 6 and 6.5
      expect(result.data[1].values.temperatureC).toBeCloseTo(47.5, 1); // avg of 47 and 48
      expect(result.total).toBe(2);
      expect(result.bucket).toBe(BucketSize.FIFTEEN_MINUTES);
    });

    it('should fill gaps with null when fill=null for multi-series', async () => {
      // Create test data with a gap
      const now = new Date();
      const baseTime = Math.floor(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000);
      
      const readings = [
        // First bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime - 30 * 60 * 1000), // 30 minutes before bucket boundary
          payload: { voltageV: 220, currentA: 5, temperatureC: 45, seq: 1 },
        },
        // Gap (no data for the middle bucket)
        // Third bucket
        {
          machine_id: machineId,
          ts: new Date(baseTime + 5 * 60 * 1000), // 5 minutes after bucket boundary
          payload: { voltageV: 240, currentA: 6, temperatureC: 47, seq: 3 },
        },
      ];

      for (const reading of readings) {
        await prisma.telemetry_readings.create({ data: reading });
      }

      // Test multi-series with 15m bucket and fill=null
      const result = await repository.findMultiSeries({
        machineId,
        from: new Date(baseTime - 45 * 60 * 1000).toISOString(), // 45 minutes before bucket boundary
        to: new Date(baseTime + 15 * 60 * 1000).toISOString(), // 15 minutes after bucket boundary
        bucket: BucketSize.FIFTEEN_MINUTES,
        fill: FillType.NULL,
        metrics: 'voltage,current',
      });

      // Verify result
      expect(result.data).toHaveLength(4); // Should have 4 buckets (including the gap)
      expect(result.data[0].values.voltageV).toBe(220);
      expect(result.data[0].values.currentA).toBe(5);
      expect(result.data[1].values.voltageV).toBeNull(); // Gap should be filled with null
      expect(result.data[1].values.currentA).toBeNull(); // Gap should be filled with null
      expect(result.data[2].values.voltageV).toBeNull(); // Gap should be filled with null
      expect(result.data[2].values.currentA).toBeNull(); // Gap should be filled with null
      expect(result.data[3].values.voltageV).toBe(240);
      expect(result.data[3].values.currentA).toBe(6);
      expect(result.fill).toBe(FillType.NULL);
    });
  });
});
