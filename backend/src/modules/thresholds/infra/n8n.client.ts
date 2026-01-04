import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { response } from 'express';

interface N8nValidateDeviceRequest {
  model: string;
  query: string;
}

@Injectable()
export class N8nClient {
  private readonly client: AxiosInstance;
  private readonly validateDeviceUrl: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.validateDeviceUrl = this.configService.get<string>('N8N_VALIDATE_DEVICE_URL') ?? "";
    this.timeout = this.configService.get<number>('N8N_TIMEOUT_MS', 10000);

    this.client = axios.create({
      timeout: this.timeout,
    });
  }

  async validateDevice(manufacturer: string, model: string): Promise<Record<string, any>> {
    const modelLabel = `${manufacturer} ${model}`;
    const query = `${manufacturer} ${model} datasheet filetype:pdf`;
    console.log("Tentando realizar a pesquisa")
    const request: N8nValidateDeviceRequest = {
      model: modelLabel,
      query,
    };

    try {
      const response = await this.client.post(this.validateDeviceUrl, request);
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 502;
        const message = error.response?.data?.message || error.message;
        throw new Error(`N8N request failed with status ${status}: ${message}`);
      }
      throw error;
    }
  }
}
