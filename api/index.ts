import dotenv from 'dotenv';
dotenv.config();

import { app } from '../backend/dist/app';

export default function handler(req: any, res: any) {
  return app(req, res);
}
