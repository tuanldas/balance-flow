'use client';

import { MoreVertical, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardHeading, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/protected/components/toolbar';

// Mock data
const incomeCategories = [
    {
        id: '1',
        name: 'Lương',
        icon: '💼',
        color: '#10b981',
        subcategories: 3,
        transactions: 45,
    },
    {
        id: '2',
        name: 'Đầu tư',
        icon: '📈',
        color: '#3b82f6',
        subcategories: 3,
        transactions: 12,
    },
    {
        id: '3',
        name: 'Kinh doanh',
        icon: '💼',
        color: '#8b5cf6',
        subcategories: 2,
        transactions: 28,
    },
    {
        id: '4',
        name: 'Cho thuê',
        icon: '🏠',
        color: '#14b8a6',
        subcategories: 0,
        transactions: 6,
    },
    {
        id: '5',
        name: 'Thu nhập khác',
        icon: '💰',
        color: '#f59e0b',
        subcategories: 0,
        transactions: 8,
    },
];

const expenseCategories = [
    {
        id: '6',
        name: 'Ăn uống',
        icon: '🍔',
        color: '#ef4444',
        subcategories: 4,
        transactions: 156,
    },
    {
        id: '7',
        name: 'Di chuyển',
        icon: '🚗',
        color: '#f59e0b',
        subcategories: 3,
        transactions: 89,
    },
    {
        id: '8',
        name: 'Mua sắm',
        icon: '🛍️',
        color: '#ec4899',
        subcategories: 3,
        transactions: 67,
    },
    {
        id: '9',
        name: 'Giải trí',
        icon: '🎮',
        color: '#6366f1',
        subcategories: 3,
        transactions: 34,
    },
    {
        id: '10',
        name: 'Nhà ở',
        icon: '🏡',
        color: '#8b5cf6',
        subcategories: 2,
        transactions: 12,
    },
    {
        id: '11',
        name: 'Sức khỏe',
        icon: '🏥',
        color: '#14b8a6',
        subcategories: 2,
        transactions: 23,
    },
    {
        id: '12',
        name: 'Giáo dục',
        icon: '📚',
        color: '#06b6d4',
        subcategories: 0,
        transactions: 8,
    },
    {
        id: '13',
        name: 'Hóa đơn',
        icon: '📄',
        color: '#f97316',
        subcategories: 4,
        transactions: 45,
    },
];

interface CategoryCardProps {
    category: {
        id: string;
        name: string;
        icon: string;
        color: string;
        subcategories: number;
        transactions: number;
    };
}

function CategoryCard({ category }: CategoryCardProps) {
    return (
        <div
            className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            style={{
                background: `linear-gradient(135deg, ${category.color}08 0%, transparent 100%)`,
            }}
        >
            {/* Icon với gradient background */}
            <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
                style={{
                    background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}CC 100%)`,
                }}
            >
                {category.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{category.name}</h4>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    {category.subcategories > 0 && (
                        <span className="flex items-center gap-1">📁 {category.subcategories} danh mục con</span>
                    )}
                    <span className="flex items-center gap-1">📊 {category.transactions} giao dịch</span>
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </DropdownMenuItem>
                    {category.subcategories > 0 && (
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
        </div>
    );
}

export default function CategoriesDemo3Page() {
    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle>Demo 3: Grid Cards (Visual)</ToolbarPageTitle>
                </ToolbarHeading>
            </Toolbar>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Income Categories */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardHeading>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                    </div>
                                    Thu nhập
                                </CardTitle>
                                <CardDescription>{incomeCategories.length} danh mục</CardDescription>
                            </CardHeading>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {incomeCategories.map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Categories */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardHeading>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                                        <TrendingDown className="h-5 w-5 text-red-600" />
                                    </div>
                                    Chi tiêu
                                </CardTitle>
                                <CardDescription>{expenseCategories.length} danh mục</CardDescription>
                            </CardHeading>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {expenseCategories.map((category) => (
                                <CategoryCard key={category.id} category={category} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground">Tổng danh mục</div>
                        <div className="mt-2 text-3xl font-bold">
                            {incomeCategories.length + expenseCategories.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground">Danh mục thu nhập</div>
                        <div className="mt-2 text-3xl font-bold text-green-600">{incomeCategories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground">Danh mục chi tiêu</div>
                        <div className="mt-2 text-3xl font-bold text-red-600">{expenseCategories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="text-sm text-muted-foreground">Tổng giao dịch</div>
                        <div className="mt-2 text-3xl font-bold">
                            {incomeCategories.reduce((sum, cat) => sum + cat.transactions, 0) +
                                expenseCategories.reduce((sum, cat) => sum + cat.transactions, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">✨ Ưu điểm của Option 3:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ Visual appeal cao, colorful và bắt mắt</li>
                    <li>✅ Hiển thị icon & color nổi bật cho mỗi danh mục</li>
                    <li>✅ Dễ scan và nhận diện nhanh</li>
                    <li>✅ Mobile-friendly với grid responsive</li>
                    <li>✅ Phân chia rõ ràng thu/chi thành 2 cột</li>
                    <li>✅ Thêm stats cards để hiển thị tổng quan</li>
                    <li>✅ Phù hợp với user không chuyên nghiệp</li>
                </ul>
            </div>
        </div>
    );
}
