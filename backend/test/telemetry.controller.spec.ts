import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { BucketSize, FillType } from '../src/modules/telemetry/domain/dto/telemetry-query.dto';

describe('TelemetryController (e2e)', () => {
  let app: INestApplication;
  
  // Test machine ID - should be a valid UUID in your database
  const machineId = '00000000-0000-0000-0000-000000000001'; // Replace with a valid machine ID
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  
  describe('GET /telemetry/series', () => {
    it('should return time series data for a specific metric', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series')
        .query({
          machineId,
          metric: 'voltage',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('from');
      expect(response.body.meta).toHaveProperty('to');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('ts');
        expect(response.body.data[0]).toHaveProperty('value');
      }
    });
    
    it('should return aggregated time series data when bucket is specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series')
        .query({
          machineId,
          metric: 'voltage',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
          bucket: BucketSize.ONE_HOUR,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('bucket', BucketSize.ONE_HOUR);
      expect(response.body.meta).toHaveProperty('fill', FillType.NONE);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return filled time series data when fill is specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series')
        .query({
          machineId,
          metric: 'voltage',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
          bucket: BucketSize.ONE_HOUR,
          fill: FillType.NULL,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('bucket', BucketSize.ONE_HOUR);
      expect(response.body.meta).toHaveProperty('fill', FillType.NULL);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have approximately 24 data points (one per hour for 24 hours)
      expect(response.body.data.length).toBeGreaterThanOrEqual(23);
      expect(response.body.data.length).toBeLessThanOrEqual(25);
    });
    
    it('should return 400 when machineId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series')
        .query({
          metric: 'voltage',
        });
      
      expect(response.status).toBe(400);
    });
    
    it('should return 400 when metric is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series')
        .query({
          machineId,
          metric: 'invalid',
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /telemetry/series/multi', () => {
    it('should return time series data for multiple metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series/multi')
        .query({
          machineId,
          metrics: 'voltage,current,temperature',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('ts');
        expect(response.body.data[0]).toHaveProperty('values');
        expect(response.body.data[0].values).toHaveProperty('voltageV');
        expect(response.body.data[0].values).toHaveProperty('currentA');
        expect(response.body.data[0].values).toHaveProperty('temperatureC');
      }
    });
    
    it('should return aggregated time series data for multiple metrics when bucket is specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series/multi')
        .query({
          machineId,
          metrics: 'voltage,current',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
          bucket: BucketSize.ONE_HOUR,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('bucket', BucketSize.ONE_HOUR);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('ts');
        expect(response.body.data[0]).toHaveProperty('values');
        expect(response.body.data[0].values).toHaveProperty('voltageV');
        expect(response.body.data[0].values).toHaveProperty('currentA');
        expect(response.body.data[0].values).not.toHaveProperty('temperatureC');
      }
    });
    
    it('should return filled time series data for multiple metrics when fill is specified', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series/multi')
        .query({
          machineId,
          metrics: 'voltage,current',
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
          to: new Date().toISOString(),
          bucket: BucketSize.ONE_HOUR,
          fill: FillType.ZERO,
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('bucket', BucketSize.ONE_HOUR);
      expect(response.body.meta).toHaveProperty('fill', FillType.ZERO);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have approximately 24 data points (one per hour for 24 hours)
      expect(response.body.data.length).toBeGreaterThanOrEqual(23);
      expect(response.body.data.length).toBeLessThanOrEqual(25);
      
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('ts');
        expect(response.body.data[0]).toHaveProperty('values');
        expect(response.body.data[0].values).toHaveProperty('voltageV');
        expect(response.body.data[0].values).toHaveProperty('currentA');
      }
    });
    
    it('should return 400 when machineId is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/telemetry/series/multi')
        .query({
          metrics: 'voltage,current',
        });
      
      expect(response.status).toBe(400);
    });
  });
});
