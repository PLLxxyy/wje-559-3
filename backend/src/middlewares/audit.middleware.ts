import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../services/audit.service';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class AuditMiddleware implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const method = request.method;
    if (!['POST', 'PUT', 'DELETE'].includes(method)) return next.handle();
    return next.handle().pipe(
      tap((body) => {
        void this.auditService.log({
          userId: request.user?.id ?? null,
          action: method,
          entity: request.path.split('/')[2] || 'unknown',
          entityId: Number(request.params?.id) || null,
          details: { request: request.body, response: body },
          ip: request.ip,
          userAgent: request.headers['user-agent'] || '',
        });
      }),
    );
  }
}
