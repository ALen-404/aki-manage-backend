import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '4YnqqKz8lqdtqasjNCyOOZRDHz4lWyKw', // 请使用更安全的密钥
    });
  }

  async validate(payload: any) {
    return { address: payload.address };
  }
}
