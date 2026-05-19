import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Photographer } from '../photographers/photographer.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private msgRepo: Repository<Message>,
    @InjectRepository(Photographer)
    private phRepo: Repository<Photographer>,
  ) {}

  findByUser(userId: string) {
    return this.convRepo.find({
      where: { userId },
      relations: ['photographer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrCreate(userId: string, photographerId: number) {
    let conv = await this.convRepo.findOne({ where: { userId, photographerId } });
    if (!conv) {
      conv = this.convRepo.create({ userId, photographerId });
      conv = await this.convRepo.save(conv);
    }
    return conv;
  }

  async getMessages(convId: string, userId: string) {
    const conv = await this.convRepo.findOne({ where: { id: convId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    // Allow access to the client who started the conversation OR the photographer involved
    const isClient = conv.userId === userId;
    if (!isClient) {
      const ph = await this.phRepo.findOne({ where: { userId } });
      const isPhotographer = ph && ph.id === conv.photographerId;
      if (!isPhotographer) throw new ForbiddenException();
    }

    return this.msgRepo.find({
      where: { conversationId: convId },
      order: { createdAt: 'ASC' },
    });
  }

  async addMessage(convId: string, senderId: string, content: string) {
    const msg = this.msgRepo.create({ conversationId: convId, senderId, content });
    return this.msgRepo.save(msg);
  }

  findById(id: string) {
    return this.convRepo.findOne({
      where: { id },
      relations: ['photographer'],
    });
  }
}
