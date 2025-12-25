# Transactions Feature - TODO List

> **Trạng thái:** Cập nhật lần cuối 2025-12-25
>
> **Mục đích:** Theo dõi tiến độ triển khai các tính năng cho màn hình Quản lý Giao dịch

---

## ✅ Đã hoàn thành

### Core Features

- [x] Hiển thị danh sách giao dịch với infinite scroll
- [x] Group giao dịch theo ngày
- [x] Tìm kiếm giao dịch (search by merchant name/notes)
- [x] Lọc theo category (multi-select)
- [x] Sắp xếp theo date, amount (ascending/descending)
- [x] Xem chi tiết giao dịch (view-only)
- [x] Responsive design (desktop split-pane, mobile sheet)
- [x] API integration với filters và pagination
- [x] React Query hooks cho CRUD operations

### API Layer

- [x] `useTransactions` - Fetch transactions with filters
- [x] `useInfiniteTransactions` - Infinite scroll pagination
- [x] `useTransaction` - Fetch single transaction
- [x] `useTransactionSummary` - Get summary (income/expense/balance)
- [x] `useCreateTransaction` - Create hook
- [x] `useUpdateTransaction` - Update hook
- [x] `useDeleteTransaction` - Delete hook

---

## ✅ Mới hoàn thành (2025-12-25)

### CRUD Operations UI - Inline Editing

- [x] **Create Transaction Form** `page:transactions`
    - [x] Tạo dialog/drawer form để thêm giao dịch mới
    - [x] Form fields: category, amount, date, merchant, notes, status
    - [x] Validation với Zod schema
    - [x] Integration với `useCreateTransaction` hook
    - [x] Toast notification khi success/error
    - [x] File: `transaction-form-dialog.tsx` (created)

- [x] **Edit Transaction - Inline Editing** `page:transactions`
    - [x] Triển khai inline editing trong `TransactionDetail`
    - [x] Category, Merchant, Date, Status, Notes: Always editable
    - [x] Amount: Click-to-edit (toggle between display and input)
    - [x] Account: Read-only display
    - [x] Tags/Goal: Display-only (for now)
    - [x] Button "Save" gọi API update với `useUpdateTransaction` hook
    - [x] Toast notification khi success/error
    - [x] File: `transaction-detail.tsx` (refactored)

- [x] **Delete Transaction** `page:transactions`
    - [x] Thêm nút Delete trong TransactionDetail
    - [x] AlertDialog confirmation trước khi xóa
    - [x] Integration với `useDeleteTransaction` hook
    - [x] Callback onDeleteSuccess để xử lý UI
    - [x] File: `transaction-detail.tsx`

- [x] **Transaction Summary Dashboard** `page:transactions`
    - [x] Tạo TransactionSummaryCard component
    - [x] Hiển thị Total Income, Total Expense, Balance
    - [x] Integration với `useTransactionSummary` hook
    - [x] Responsive grid layout (3 columns desktop, stack mobile)
    - [x] Loading skeleton states
    - [x] Error handling UI
    - [x] Currency formatting với i18n (VND)
    - [x] Color-coded cards (green/red/blue)
    - [x] Real-time updates (React Query invalidation)
    - [x] Dark mode support
    - [x] Translations (vi, en)
    - [x] File: `transaction-summary-card.tsx` (created)

## 🔴 Ưu tiên cao (Critical)

---

## 🟡 Ưu tiên trung bình (Important)

### 3. Advanced Filters

- [ ] **Date Range Filter** `page:transactions`
    - [ ] Date picker component (from/to dates)
    - [ ] Integration với API filters `start_date`, `end_date`
    - [ ] Preset ranges: Today, This Week, This Month, Custom
    - [ ] File: Sửa `filter-bar.tsx`

- [ ] **Status Filter** `page:transactions`
    - [ ] Filter theo Pending, Completed, Cancelled, To Review
    - [ ] Multi-select hoặc radio buttons
    - [ ] Integration với API filter `status`
    - [ ] File: Sửa `filter-bar.tsx`

- [ ] **Type Tabs/Filter** `page:transactions`
    - [ ] Tabs: All / Income / Expense
    - [ ] Hoặc dropdown filter
    - [ ] Integration với API filter `type`
    - [ ] File: Sửa `page.tsx` hoặc `filter-bar.tsx`

### 4. Tags & Goal Management

- [ ] **Tags Editor** `page:transactions`
    - [ ] Thêm/xóa tags trong TransactionDetail
    - [ ] Tag input với autocomplete
    - [ ] Save tags khi update transaction
    - [ ] File: Sửa `transaction-detail.tsx:220-238`

- [ ] **Goal Editor** `page:transactions`
    - [ ] Enable edit goal field
    - [ ] Save goal khi update transaction
    - [ ] File: Sửa `transaction-detail.tsx:196-206`

---

## 🟢 Ưu tiên thấp (Nice to have)

### 5. UX Improvements

- [ ] **Empty State** `page:transactions`
    - [ ] Hiển thị UI đẹp khi chưa có transaction
    - [ ] Call-to-action button "Create First Transaction"
    - [ ] File: Sửa `page.tsx`

- [ ] **Skeleton Loading** `page:transactions`
    - [ ] Replace Loader2 spinner bằng skeleton UI
    - [ ] Skeleton cho transaction list items
    - [ ] File: Sửa `page.tsx:63-72`

- [ ] **Toast Notifications** `global`
    - [ ] Success toast khi create/update/delete
    - [ ] Error toast với error message
    - [ ] Sử dụng `sonner` (đã có trong dependencies)
    - [ ] File: Thêm vào các mutation callbacks

- [ ] **Optimistic Updates** `page:transactions`
    - [ ] Update UI ngay lập tức trước khi API response
    - [ ] Rollback nếu API fail
    - [ ] Cải thiện perceived performance
    - [ ] File: Sửa `use-transactions.ts` mutation hooks

### 6. Advanced Features

- [ ] **Recurring Transactions** `page:transactions`
    - [ ] UI để set recurring frequency
    - [ ] Auto-create recurring transactions (backend)
    - [ ] Hiển thị recurring badge
    - [ ] File: Mới hoặc extend `transaction-form-dialog.tsx`

- [ ] **Bulk Actions** `page:transactions`
    - [ ] Multi-select transactions (checkbox)
    - [ ] Bulk delete
    - [ ] Bulk update category/status
    - [ ] File: Sửa `page.tsx`, `transaction-row.tsx`

- [ ] **Export Data** `page:transactions`
    - [ ] Export to CSV
    - [ ] Export to Excel
    - [ ] Apply current filters to export
    - [ ] File: Tạo mới `export-transactions.tsx`

- [ ] **Charts & Analytics** `page:transactions`
    - [ ] Spending by category (pie chart)
    - [ ] Income vs Expense trend (line chart)
    - [ ] Monthly comparison (bar chart)
    - [ ] File: Tạo mới `transaction-analytics.tsx`

---

## 📝 Notes

### API Support Status

| Feature            | API Endpoint                    | Status  |
| ------------------ | ------------------------------- | ------- |
| List transactions  | `GET /api/transactions`         | ✅ Done |
| Get transaction    | `GET /api/transactions/:id`     | ✅ Done |
| Create transaction | `POST /api/transactions`        | ✅ Done |
| Update transaction | `PUT /api/transactions/:id`     | ✅ Done |
| Delete transaction | `DELETE /api/transactions/:id`  | ✅ Done |
| Get summary        | `GET /api/transactions/summary` | ✅ Done |

### Filters Support

| Filter     | API Param                   | UI Status          |
| ---------- | --------------------------- | ------------------ |
| Search     | `search`                    | ✅ Implemented     |
| Category   | `category_id`               | ✅ Implemented     |
| Date range | `start_date`, `end_date`    | ❌ Not implemented |
| Status     | `status`                    | ❌ Not implemented |
| Type       | `type`                      | ❌ Not implemented |
| Sort       | `sort_by`, `sort_direction` | ✅ Implemented     |
| Pagination | `page`, `per_page`          | ✅ Implemented     |

### Dependencies Required

- ✅ `@tanstack/react-query` - Already installed
- ✅ `react-hook-form` + `zod` - Already installed
- ✅ `sonner` - Already installed (toast notifications)
- ✅ `date-fns` or `dayjs` - Check if needed for date picker
- ❌ Date picker component - Need to add or use existing UI library

---

## 🎯 Roadmap Đề xuất

### Phase 1: Core CRUD (Sprint 1-2 tuần)

1. Create Transaction Form
2. Edit Transaction (activate form)
3. Delete Transaction
4. Transaction Summary Card

### Phase 2: Enhanced Filters (Sprint 1 tuần)

1. Date Range Filter
2. Status Filter
3. Type Tabs/Filter

### Phase 3: UX Polish (Sprint 1 tuần)

1. Tags & Goal Editor
2. Toast Notifications
3. Empty States
4. Skeleton Loading
5. Optimistic Updates

### Phase 4: Advanced Features (Sprint 2-3 tuần)

1. Recurring Transactions
2. Bulk Actions
3. Export Data
4. Charts & Analytics

---

## 📚 Related Files

### Main Pages

- `/workspace/app/(protected)/transactions/page.tsx` - Main transactions page
- `/workspace/app/(protected)/transactions/filter-bar.tsx` - Filter UI
- `/workspace/app/(protected)/transactions/transaction-detail.tsx` - Detail panel
- `/workspace/app/(protected)/transactions/transaction-row.tsx` - List item

### API Layer

- `/workspace/lib/api/transactions.ts` - API client
- `/workspace/lib/types/transaction.ts` - TypeScript types
- `/workspace/hooks/use-transactions.ts` - React Query hooks

### Utilities

- `/workspace/lib/utils/transaction-utils.ts` - Helper functions
- `/workspace/i18n/messages/vi.json` - Vietnamese translations
- `/workspace/i18n/messages/en.json` - English translations

---

**Last updated:** 2025-12-25
**Maintained by:** Development Team
