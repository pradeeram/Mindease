import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { privacyService } from './privacy.service';
import { logAudit } from '../../middleware/security';

const deleteAccountSchema = z.object({
  passwordConfirm: z.string().min(1, 'Password confirmation is required.'),
});

export class PrivacyController {
  async exportData(req: Request, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as string) === 'csv' ? 'csv' : 'json';
      const data = await privacyService.exportUserData(req.user!.id, format);

      await logAudit({
        userId: req.user!.id,
        action: 'GDPR_DATA_EXPORT',
        req,
        details: `Exported user data in ${format.toUpperCase()} format`,
      });

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="mindease-export-${Date.now()}.csv"`);
        res.send(data);
        return;
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="mindease-export-${Date.now()}.json"`);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await privacyService.getAuditLogs(req.user!.id);
      res.status(200).json({ success: true, data: { logs } });
    } catch (err) {
      next(err);
    }
  }

  async getConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const consents = await privacyService.getConsents(req.user!.id);
      res.status(200).json({ success: true, data: { consents } });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { passwordConfirm } = deleteAccountSchema.parse(req.body);
      const result = await privacyService.deleteAccountAndPurgeData(req.user!.id, passwordConfirm);

      await logAudit({
        action: 'ACCOUNT_PURGED_RIGHT_TO_BE_FORGOTTEN',
        req,
        details: `Account purged for user ID ${req.user!.id}`,
      });

      res.clearCookie('mindease_refresh_token');
      res.clearCookie('mindease_access_token');
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async withdrawConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { passwordConfirm } = deleteAccountSchema.parse(req.body);
      const result = await privacyService.withdrawConsent(req.user!.id, passwordConfirm);

      await logAudit({
        action: 'CONSENT_WITHDRAWN_DPDP_SEC6',
        req,
        details: `Consent withdrawn by user ID ${req.user!.id}`,
      });

      res.clearCookie('mindease_refresh_token');
      res.clearCookie('mindease_access_token');
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const privacyController = new PrivacyController();
