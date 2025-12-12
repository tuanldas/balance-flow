'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useCategoryIcons } from '@/hooks/use-category-icons';
import { formatBytes, useFileUpload } from '@/hooks/use-file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IconPickerProps {
    value?: string; // Current icon URL or default icon name
    uploadedFile?: File | null; // Custom uploaded file
    onSelectIcon: (iconUrl: string | null) => void;
    onUploadIcon: (file: File | null) => void;
    disabled?: boolean;
}

const MAX_FILE_SIZE = 512 * 1024; // 512KB
const ACCEPTED_FILE_TYPES = '.svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg';

export function IconPicker({ value, uploadedFile, onSelectIcon, onUploadIcon, disabled = false }: IconPickerProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: iconsData, isLoading, error } = useCategoryIcons();

    const [fileState, fileActions] = useFileUpload({
        maxSize: MAX_FILE_SIZE,
        accept: ACCEPTED_FILE_TYPES,
        multiple: false,
        onFilesChange: (files) => {
            if (files.length > 0 && files[0].file instanceof File) {
                onUploadIcon(files[0].file);
                onSelectIcon(null); // Clear selected default icon when uploading
            } else if (files.length === 0) {
                onUploadIcon(null);
            }
        },
    });

    // Sync external uploadedFile with internal state
    useEffect(() => {
        if (!uploadedFile && fileState.files.length > 0) {
            fileActions.clearFiles();
        }
    }, [uploadedFile, fileState.files.length, fileActions]);

    // Get preview URL for uploaded file or current value
    const previewUrl = useMemo(() => {
        if (uploadedFile) {
            return URL.createObjectURL(uploadedFile);
        }
        return value || null;
    }, [uploadedFile, value]);

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (uploadedFile && previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [uploadedFile, previewUrl]);

    const icons = useMemo(() => iconsData?.data || [], [iconsData?.data]);

    // Filter icons by search query
    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) return icons;
        const query = searchQuery.toLowerCase();
        return icons.filter((icon) => icon.name.toLowerCase().includes(query));
    }, [icons, searchQuery]);

    const handleSelectDefaultIcon = (iconUrl: string) => {
        if (disabled) return;
        onSelectIcon(iconUrl);
        onUploadIcon(null);
        fileActions.clearFiles();
    };

    const handleRemoveUploadedFile = () => {
        fileActions.clearFiles();
        onUploadIcon(null);
    };

    const isIconSelected = (iconUrl: string) => {
        return value === iconUrl && !uploadedFile;
    };

    return (
        <div className="space-y-3">
            {/* Tabs */}
            <Tabs defaultValue="default" className="w-full">
                <TabsList variant="default" size="sm" className="w-full">
                    <TabsTrigger value="default" className="flex-1">
                        {t('categories.iconPicker.defaultIcons')}
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">
                        {t('categories.iconPicker.uploadCustom')}
                    </TabsTrigger>
                </TabsList>

                {/* Default Icons Tab */}
                <TabsContent value="default" className="mt-3">
                    {/* Search Input */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                            disabled={disabled}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Icons Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-7 gap-1.5 p-2 border rounded-lg bg-background">
                            {Array.from({ length: 14 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-lg" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-sm text-destructive border rounded-lg">
                            {t('categories.iconPicker.errorLoadingIcons')}
                        </div>
                    ) : filteredIcons.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg">
                            {searchQuery ? 'Không tìm thấy icon phù hợp' : 'Không có icon nào'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1.5 p-2 max-h-60 overflow-y-auto border rounded-lg bg-background">
                            {filteredIcons.map((icon) => (
                                <button
                                    key={icon.name}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleSelectDefaultIcon(icon.url)}
                                    className={cn(
                                        'aspect-square flex items-center justify-center rounded-lg transition-all hover:bg-accent',
                                        isIconSelected(icon.url)
                                            ? 'bg-primary/10 ring-2 ring-primary ring-offset-1'
                                            : 'hover:scale-105',
                                        disabled && 'opacity-50 cursor-not-allowed',
                                    )}
                                    title={icon.name}
                                >
                                    <img src={icon.url} alt={icon.name} className="w-7 h-7 object-contain" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Preview */}
                    {previewUrl && !uploadedFile && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted">
                                <img src={previewUrl} alt="Selected" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {t('categories.iconPicker.selectIcon')}
                            </span>
                        </div>
                    )}
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="mt-3">
                    {uploadedFile ? (
                        <div className="p-4 border rounded-lg bg-background">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                                        <img
                                            src={previewUrl || ''}
                                            alt="Uploaded icon"
                                            className="h-8 w-8 object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium truncate max-w-[200px]">
                                            {uploadedFile.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(uploadedFile.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleRemoveUploadedFile}
                                    disabled={disabled}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                'p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer bg-background',
                                fileState.isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50',
                                disabled && 'opacity-50 cursor-not-allowed',
                            )}
                            onDragEnter={fileActions.handleDragEnter}
                            onDragLeave={fileActions.handleDragLeave}
                            onDragOver={fileActions.handleDragOver}
                            onDrop={fileActions.handleDrop}
                            onClick={() => !disabled && fileActions.openFileDialog()}
                        >
                            <input {...fileActions.getInputProps()} className="hidden" disabled={disabled} />
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">{t('categories.iconPicker.dropZone')}</p>
                                <p className="text-xs text-muted-foreground">
                                    {t('categories.iconPicker.acceptedFormats')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error messages */}
                    {fileState.errors.length > 0 && (
                        <div className="mt-2 text-sm text-destructive">
                            {fileState.errors.map((error, i) => (
                                <p key={i}>{error}</p>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
