import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SessionService } from 'src/modules/sessions/session.service';

@WebSocketGateway({
  cors: { origin: '*' }, // Cấp phép cho Frontend React kết nối
  namespace: 'attendance', // Đường dẫn kết nối: ws://localhost:3000/attendance
})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('SessionGateway');

  // Lưu trữ các bộ đếm (interval) theo sessionId để có thể clear khi đóng phiên
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly sessionService: SessionService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Lắng nghe sự kiện từ Frontend giảng viên khi họ muốn host một phiên
  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; interval: number },
  ) {
    const { sessionId, interval = 5000 } = payload;

    // 1. Cho client của giảng viên vào một "phòng" riêng biệt
    client.join(sessionId);
    this.logger.log(`Giảng viên [${client.id}] đã tham gia phòng điểm danh: ${sessionId}`);

    // 2. Nếu phòng này chưa có vòng lặp sinh QR, ta bắt đầu tạo
    if (!this.activeIntervals.has(sessionId)) {
      const timer = setInterval(async () => {
        try {
          // Gọi Service cập nhật mã mới vào Database
          const newQrCode = await this.sessionService.rotateQrCode(sessionId);

          // Phát mã mới tới TẤT CẢ các client đang ở trong phòng này (thường chỉ có 1 màn hình của giảng viên)
          this.server.to(sessionId).emit('qr_updated', { qrCode: newQrCode });

          this.logger.debug(`[${sessionId}] Đã sinh mã QR mới: ${newQrCode}`);
        } catch (error) {
          this.logger.error(`Lỗi khi xoay vòng QR cho session ${sessionId}`, error);
        }
      }, interval);

      // Lưu lại ID của timer để sau này huỷ
      this.activeIntervals.set(sessionId, timer);
    }
  }

  // Lắng nghe sự kiện khi giảng viên bấm nút "Dừng điểm danh"
  @SubscribeMessage('leave_session')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string },
  ) {
    const { sessionId } = payload;
    client.leave(sessionId);

    // Xoá vòng lặp sinh QR
    if (this.activeIntervals.has(sessionId)) {
      clearInterval(this.activeIntervals.get(sessionId));
      this.activeIntervals.delete(sessionId);
      this.logger.log(`Đã dừng xoay vòng QR cho phòng: ${sessionId}`);
    }
  }
}
