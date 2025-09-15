# Balance Flow

## Chạy dự án bằng Docker Compose (V2)

Yêu cầu:
- Docker Desktop hoặc Docker Engine + Compose V2 (`docker compose version`)
- Node không bắt buộc trên máy local (đã đóng gói trong image)

### Cấu trúc Compose
- `compose.yml`: file base (bắt buộc)
- `compose-dev.yml`: mẫu override cho môi trường development
- `compose-prod.yml`: mẫu override cho môi trường production
- Bạn copy 1 trong 2 file mẫu thành `compose.override.yml` để sử dụng

### Development
1) Tạo override dev
```bash
cp compose-dev.yml compose.override.yml
```
2) Build và chạy
```bash
docker compose down
docker compose up -d --build
```
3) Xem log
```bash
docker compose logs -f web
```
4) Vào container (có bash)
```bash
docker compose exec web bash
```
5) Dừng
```bash
docker compose down
```

### Production
1) Tạo override prod
```bash
cp compose-prod.yml compose.override.yml
```
2) Build và chạy
```bash
docker compose up -d --build
```
3) Health & logs
```bash
docker compose ps
docker compose logs -f web
```
4) Dừng
```bash
docker compose down
```

### Ports & Env
- Mặc định app chạy port `3000` (map ra host `3000:3000`).
- Sửa port/biến môi trường trong `compose.yml` hoặc file override tương ứng.

### Ghi chú
- Image dùng Node 22, build Next.js ở chế độ `standalone` để tối ưu runtime.
- Dev image có sẵn `bash` để thuận tiện debug.

### Báo lỗi
Nếu gặp vấn đề khi chạy bằng Docker, vui lòng mở issue kèm log `docker compose logs -f web`.
