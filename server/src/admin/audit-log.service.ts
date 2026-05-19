import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  log(adminId: string, adminName: string, action: string, target?: string) {
    const entry = this.repo.create({ adminId, adminName, action, target });
    return this.repo.save(entry);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }
}
