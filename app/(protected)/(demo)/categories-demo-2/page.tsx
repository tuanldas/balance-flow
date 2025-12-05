'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardHeading,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/protected/components/toolbar';

// Mock data với cấu trúc tree
const incomeCategories = [
    {
        id: '1',
        name: 'Lương',
        icon: '💼',
        color: '#10b981',
        children: [
            { id: '2', name: 'Lương cơ bản', icon: '💰', color: '#10b981' },
            { id: '3', name: 'Thưởng', icon: '🎁', color: '#10b981' },
            { id: '4', name: 'Phụ cấp', icon: '💵', color: '#10b981' },
        ],
    },
    {
        id: '5',
        name: 'Đầu tư',
        icon: '📈',
        color: '#3b82f6',
        children: [
            { id: '6', name: 'Cổ phiếu', icon: '📊', color: '#3b82f6' },
            { id: '7', name: 'Bất động sản', icon: '🏠', color: '#3b82f6' },
            { id: '8', name: 'Tiền lãi', icon: '💹', color: '#3b82f6' },
        ],
    },
    {
        id: '9',
        name: 'Kinh doanh',
        icon: '💼',
        color: '#8b5cf6',
        children: [
            { id: '10', name: 'Doanh thu', icon: '💰', color: '#8b5cf6' },
            { id: '11', name: 'Hoa hồng', icon: '🤝', color: '#8b5cf6' },
        ],
    },
];

const expenseCategories = [
    {
        id: '12',
        name: 'Ăn uống',
        icon: '🍔',
        color: '#ef4444',
        children: [
            { id: '13', name: 'Nhà hàng', icon: '🍽️', color: '#ef4444' },
            { id: '14', name: 'Cafe', icon: '☕', color: '#ef4444' },
            { id: '15', name: 'Đi chợ', icon: '🛒', color: '#ef4444' },
            { id: '16', name: 'Ăn vặt', icon: '🍿', color: '#ef4444' },
        ],
    },
    {
        id: '17',
        name: 'Di chuyển',
        icon: '🚗',
        color: '#f59e0b',
        children: [
            { id: '18', name: 'Xăng xe', icon: '⛽', color: '#f59e0b' },
            { id: '19', name: 'Gửi xe', icon: '🅿️', color: '#f59e0b' },
            { id: '20', name: 'Grab/Taxi', icon: '🚕', color: '#f59e0b' },
        ],
    },
    {
        id: '21',
        name: 'Mua sắm',
        icon: '🛍️',
        color: '#ec4899',
        children: [
            { id: '22', name: 'Quần áo', icon: '👔', color: '#ec4899' },
            { id: '23', name: 'Điện tử', icon: '📱', color: '#ec4899' },
            { id: '24', name: 'Mỹ phẩm', icon: '💄', color: '#ec4899' },
        ],
    },
    {
        id: '25',
        name: 'Giải trí',
        icon: '🎮',
        color: '#6366f1',
        children: [
            { id: '26', name: 'Phim ảnh', icon: '🎬', color: '#6366f1' },
            { id: '27', name: 'Du lịch', icon: '✈️', color: '#6366f1' },
            { id: '28', name: 'Sách báo', icon: '📚', color: '#6366f1' },
        ],
    },
];

interface CategoryItemProps {
    category: {
        id: string;
        name: string;
        icon: string;
        color: string;
        children?: Array<{ id: string; name: string; icon: string; color: string }>;
    };
    level?: number;
}

function CategoryItem({ category, level = 0 }: CategoryItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className={level > 0 ? 'ml-6' : ''}>
            <div
                className={`group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent ${
                    level === 0 ? 'bg-muted/50' : ''
                }`}
            >
                {/* Expand/Collapse button */}
                {hasChildren ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent-foreground/10"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                {/* Icon */}
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: category.color + '20' }}
                >
                    {category.icon}
                </div>

                {/* Name */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`${level === 0 ? 'font-semibold' : 'font-medium'}`}>{category.name}</span>
                        {hasChildren && (
                            <Badge variant="secondary" className="text-xs">
                                {category.children!.length}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        {level === 0 && (
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

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {category.children!.map((child) => (
                        <CategoryItem key={child.id} category={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CategoriesDemo2Page() {
    return (
        <div className="container-fluid">
            <Toolbar>
                <ToolbarHeading>
                    <ToolbarPageTitle>Demo 2: Tree View (Hierarchical)</ToolbarPageTitle>
                </ToolbarHeading>
            </Toolbar>

            <Card>
                <CardHeader>
                    <CardHeading>
                        <CardTitle>Quản lý danh mục</CardTitle>
                        <CardDescription>Hiển thị cấu trúc danh mục theo dạng cây phân cấp</CardDescription>
                    </CardHeading>
                    <CardToolbar>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm danh mục
                        </Button>
                    </CardToolbar>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="income" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="income" className="gap-2">
                                📈 Thu nhập ({incomeCategories.length})
                            </TabsTrigger>
                            <TabsTrigger value="expense" className="gap-2">
                                📉 Chi tiêu ({expenseCategories.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="income" className="mt-6 space-y-2">
                            {incomeCategories.map((category) => (
                                <CategoryItem key={category.id} category={category} />
                            ))}
                        </TabsContent>

                        <TabsContent value="expense" className="mt-6 space-y-2">
                            {expenseCategories.map((category) => (
                                <CategoryItem key={category.id} category={category} />
                            ))}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <div className="mt-6 p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">✨ Ưu điểm của Option 2:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ Hiển thị relationship cha-con rõ ràng và trực quan</li>
                    <li>✅ Expand/collapse để quản lý không gian hiển thị</li>
                    <li>✅ Dễ dàng thêm/sửa/xóa theo từng level</li>
                    <li>✅ Phù hợp với cấu trúc phân cấp nhiều tầng</li>
                    <li>✅ Visual hierarchy tốt với indentation</li>
                    <li>✅ Có thể drag & drop để sắp xếp lại (nếu cần)</li>
                </ul>
            </div>
        </div>
    );
}
