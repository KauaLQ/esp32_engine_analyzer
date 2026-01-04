import { ConfigService } from '@nestjs/config';
export declare class N8nClient {
    private readonly configService;
    private readonly client;
    private readonly validateDeviceUrl;
    private readonly timeout;
    constructor(configService: ConfigService);
    validateDevice(manufacturer: string, model: string): Promise<Record<string, any>>;
}
