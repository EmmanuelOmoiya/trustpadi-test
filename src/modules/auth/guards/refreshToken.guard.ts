import { CanActivate, Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@//constants';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
// export class RefreshTokenGuard implements CanActivate {
//     constructor(private jwtService: JwtService, private configService: ConfigService) {}
    
//     async canActivate(context: ExecutionContext): Promise<boolean> {
//       const request = context.switchToHttp().getRequest();
//       const token = this.extractTokenFromHeader(request);
  
//       if (!token) {
//         throw new UnauthorizedException('No refresh token provided');
//       }
  
//       try {
//           const payload = await this.jwtService.verifyAsync(
//           token,
//           {
//             secret: this.configService.get<string>(ENV.JWT_REFRESH_TOKEN_SECRET)
//           }
//         )
//         request.user = payload;
        
//         return true;
//       } catch(err) {
//           console.log(err)
//         throw new UnauthorizedException('Invalid refresh token');
//       }
//     }
  
//     private extractTokenFromHeader(request: Request): string | undefined {
//       // @ts-ignore
//       const [type, token] = request.headers.authorization?.split(' ') ?? [];
//       return type === 'Bearer' ? token : undefined;
//     }
// }
