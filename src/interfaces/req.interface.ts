import { Request } from 'express';
import { TokenData } from './jwt-payload.interface';

export type Req = Request & { auth: TokenData };
