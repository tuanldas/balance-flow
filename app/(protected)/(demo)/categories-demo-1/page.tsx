'use client';

import { useState } from 'react';
import { MoreVertical, Pencil, Plus, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardHeading,
    CardTable,
    CardTitle,
    CardToolbar,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/protected/components/toolbar';

// Mock data
const mockCategories = [
    {
        id: '1',
        name: 'Lương',
        type: 'income',
        icon: '💼',
        color: '#10b981',
        parent: null,
        subcategories: 2,
    },
    {
        id: '2',
        name: 'Lương cơ bản',
        type: 'income',
        icon: '💰',
        color: '#10b981',
        parent: 'Lương',
        subcategories: 0,
    },
    {
        id: '3',
        name: 'Thưởng',
        type: 'income',
        icon: '🎁',
        color: '#10b981',
        parent: 'Lương',
        subcategories: 0,
    },
    {
        id: '4',
        name: 'Đầu tư',
        type: 'income',
        icon: '📈',
        color: '#3b82f6',
        parent: null,
        subcategories: 2,
    },
    {
        id: '5',
        name: 'Cổ phiếu',
        type: 'income',
        icon: '📊',
        color: '#3b82f6',
        parent: 'Đầu tư',
        subcategories: 0,
    },
    {
        id: '6',
        name: 'Ăn uống',
        type: 'expense',
        icon: '🍔',
        color: '#ef4444',
        parent: null,
        subcategories: 3,
    },
    {
        id: '7',
        name: 'Nhà hàng',
        type: 'expense',
        icon: '🍽️',
        color: '#ef4444',
        parent: 'Ăn uống',
        subcategories: 0,
    },
    {
        id: '8',
        name: 'Cafe',
        type: 'expense',
        icon: '☕',
        color: '#ef4444',
        parent: 'Ăn uống',
        subcategories: 0,
    },
    {
        id: '9',
        name: 'Đi chợ',
        type: 'expense',
        icon: '🛒',
        color: '#ef4444',
        parent: 'Ăn uống',
        subcategories: 0,
    },
    {
        id: '10',
        name: 'Di chuyển',
        type: 'expense',
        icon: '🚗',
        color: '#f59e0b',
        parent: null,
        subcategories: 2,
    },
    {
        id: '11',
        name: 'Xăng xe',
        type: 'expense',
        icon: '⛽',
        color: '#f59e0b',
        parent: 'Di chuyển',
        subcategories: 0,
    },
    {
        id: '12',
        name: 'Gửi xe',
        type: 'expense',
        icon: '🅿️',
        color: '#f59e0b',
        parent: 'Di chuyển',
        subcategories: 0,
    },
];

export default function CategoriesDemo1Page() {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredCategories = mockCategories.filter((cat) => {
        const matchesType = filter === 'all' || cat.type === filter;
        const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle>Demo 1: DataGrid Table</ToolbarPageTitle>
                </ToolbarHeading>
            </Toolbar>

            <Card>
                <CardHeader>
                    <CardHeading>
                        <CardTitle>Quản lý danh mục</CardTitle>
                        <CardDescription>Quản lý danh mục thu chi của bạn với bảng dữ liệu</CardDescription>
                    </CardHeading>
                    <CardToolbar>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm danh mục..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="income">Thu nhập</SelectItem>
                                <SelectItem value="expense">Chi tiêu</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    </CardToolbar>
                </CardHeader>

                <CardTable>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Tên danh mục</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Danh mục cha</TableHead>
                                <TableHead>Danh mục con</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id} className="hover:bg-accent/50 cursor-pointer">
                                    <TableCell>
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                                            style={{ backgroundColor: category.color + '20' }}
                                        >
                                            {category.icon}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.name}</span>
                                            {!category.parent && category.subcategories > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {category.subcategories} con
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={category.type === 'income' ? 'default' : 'destructive'}
                                            className="gap-1"
                                        >
                                            {category.type === 'income' ? (
                                                <>
                                                    <TrendingUp className="h-3 w-3" />
                                                    Thu nhập
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingDown className="h-3 w-3" />
                                                    Chi tiêu
                                                </>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {category.parent ? (
                                            <span className="text-muted-foreground">{category.parent}</span>
                                        ) : (
                                            <span className="text-muted-foreground italic">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {category.subcategories > 0 ? (
                                            <span className="text-muted-foreground">{category.subcategories}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                {!category.parent && category.subcategories > 0 && (
                                                    <DropdownMenuItem>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Thêm danh mục con
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardTable>

                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            Hiển thị {filteredCategories.length} / {mockCategories.length} danh mục
                        </p>
                        <div className="text-sm text-muted-foreground">Trang 1 / 1</div>
                    </div>
                </CardFooter>
            </Card>

            <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">✨ Ưu điểm của Option 1:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ Professional, phù hợp với admin dashboard</li>
                    <li>✅ Dễ dàng sort, filter, search</li>
                    <li>✅ Hiển thị nhiều thông tin trong 1 màn hình</li>
                    <li>✅ Có thể thêm pagination khi data nhiều</li>
                    <li>✅ Actions menu rõ ràng với dropdown</li>
                </ul>
            </div>
        </div>
    );
}
