"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super();
    }
    async onModuleInit() {
        await this.$connect();
        if (process.env.SEED_DEFAULT_ADMIN === 'true') {
            await this.ensureDefaultAdmin();
        }
    }
    async ensureDefaultAdmin() {
        const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'rotorial@admin.com';
        const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
        const existingAdmin = await this.users.findFirst({
            where: {
                email: defaultEmail,
                role: 'admin',
            },
        });
        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash(defaultPassword, 10);
            await this.users.create({
                data: {
                    email: defaultEmail,
                    password_hash: passwordHash,
                    full_name: 'Admin User',
                    role: 'admin',
                    status: 'active',
                },
            });
            console.log('Default admin user created');
        }
        else {
            console.log('Default admin user already exists');
        }
        console.log('Default admin ensured');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map