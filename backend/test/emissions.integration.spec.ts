import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { EmissionsService } from '../src/modules/emissions/domain/emissions.service';

describe('Emissions Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let emissionsService: EmissionsService;
  
  // Test machine ID - should be a valid UUID in your database
  const machineId = '00000000-0000-0000-0000-000000000001'; // Replace with a valid machine ID
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = app.get<PrismaService>(PrismaService);
    emissionsService = app.get<EmissionsService>(EmissionsService);
  });

  afterAll(async () => {
    await app.close();
  });
  
  it('should calculate energy_kwh_increment between two telemetry readings', async () => {
    // Create a threshold profile for the machine
    const profile = await prisma.machine_threshold_profiles.create({
      data: {
        machine_id: machineId,
        mode: 'MANUAL',
        active: true,
        version: 1,
        payload: {
          nominais: {
            vrms_nominal_v: 460,
            irms_nominal_a: 6.5,
            assumptions: {
              fp: 0.85,
              eta: 0.9,
            },
          },
        },
      },
    });
    
    // Create first telemetry reading
    const firstReading = await prisma.telemetry_readings.create({
      data: {
        machine_id: machineId,
        ts: new Date(Date.now() - 60000), // 1 minute ago
        payload: {
          voltageV: 460,
          currentA: 6.5,
          temperatureC: 50,
          seq: 1,
        },
      },
    });
    
    // Compute emissions for first reading
    await emissionsService.computeAndPersist(machineId, firstReading.id.toString());
    
    // Create second telemetry reading
    const secondReading = await prisma.telemetry_readings.create({
      data: {
        machine_id: machineId,
        ts: new Date(), // now
        payload: {
          voltageV: 460,
          currentA: 6.5,
          temperatureC: 50,
          seq: 2,
        },
      },
    });
    
    // Compute emissions for second reading
    await emissionsService.computeAndPersist(machineId, secondReading.id.toString());
    
    // Fetch the second reading to check computed values
    const updatedSecondReading = await prisma.telemetry_readings.findUnique({
      where: { id: secondReading.id },
    });
    
    const computed = (updatedSecondReading!.payload as any).computed;
    
    // Verify that energy_kwh_increment is calculated
    expect(computed).toBeDefined();
    expect(computed.energy_kwh_increment).toBeDefined();
    expect(computed.energy_kwh_increment).toBeGreaterThan(0);
    
    // Verify that delta_hours is approximately 1 minute (0.0167 hours)
    expect(computed.delta_hours).toBeCloseTo(1/60, 2);
    
    // Clean up
    await prisma.telemetry_readings.delete({ where: { id: secondReading.id } });
    await prisma.telemetry_readings.delete({ where: { id: firstReading.id } });
    await prisma.machine_threshold_profiles.delete({ where: { id: profile.id } });
  });
  
  it('should return time series data with correct buckets', async () => {
    // Make request to series endpoint
    const response = await request(app.getHttpServer())
      .get(`/machines/${machineId}/emissions/series`)
      .query({
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        to: new Date().toISOString(),
        bucket: '1h',
        metric: 'power_kw',
      });
    
    // Verify response structure
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('machineId', machineId);
    expect(response.body).toHaveProperty('metric', 'power_kw');
    expect(response.body).toHaveProperty('bucket', '1h');
    expect(response.body).toHaveProperty('points');
    expect(Array.isArray(response.body.points)).toBe(true);
  });
});
