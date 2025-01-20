import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(email: string, _password: string) {
    const payload = { email, name: 'test' };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
