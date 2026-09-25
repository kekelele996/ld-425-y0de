import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { DesignService } from '../services/design.service';
import { ok } from '../utils/response';

interface SubmitBody {
  description?: string;
  fileUrls?: string[];
}

interface ReviewBody {
  approved: boolean;
  comment: string;
}

@Controller('designs')
export class DesignController {
  constructor(private readonly service: DesignService) {}

  @Get()
  async list() {
    return ok(await this.service.findAll());
  }

  @Get(':id/submissions')
  async submissions(@Param('id') id: string) {
    return ok(await this.service.findSubmissions(id));
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() body: SubmitBody, @Req() req: Request) {
    const userId = req.user?.id ?? 'demo-designer';
    return ok(await this.service.submit(id, userId, {
      description: body.description ?? '',
      fileUrls: body.fileUrls ?? [],
      submitterId: userId
    }));
  }

  @Post(':id/review')
  async review(@Param('id') id: string, @Body() body: ReviewBody, @Req() req: Request) {
    return ok(await this.service.review(id, body.approved, body.comment, req.user?.id ?? 'demo-owner'));
  }
}
