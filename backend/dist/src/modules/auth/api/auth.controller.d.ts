import { AuthService } from '../domain/auth.service';
import { RegisterDto } from '../domain/dto/register.dto';
import { LoginDto } from '../domain/dto/login.dto';
import { RefreshTokenDto } from '../domain/dto/refresh-token.dto';
import { AuthResponseDto, UserDto } from '../domain/dto/auth-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    logout(refreshTokenDto: RefreshTokenDto): Promise<void>;
    getProfile(req: any): Promise<UserDto>;
}
