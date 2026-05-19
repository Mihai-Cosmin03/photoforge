import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'admin_id' })
  adminId: string;

  @Column({ name: 'admin_name' })
  adminName: string;

  @Column()
  action: string; // e.g. 'approve_portfolio', 'delete_user', 'change_role'

  @Column({ nullable: true })
  target: string; // e.g. 'Portfolio #12: "Wedding Stories"'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
