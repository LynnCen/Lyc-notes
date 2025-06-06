# Vue组件PDF导出

## 具体实现

### 类型定义

```ts
import type html2canvas from 'html2canvas';
import type { jsPDF, jsPDFOptions } from 'jspdf';

export type PageOrientation = 'portrait' | 'landscape';
export type PageFormat = 'a4' | 'a3' | 'letter' | 'custom';
export type SizeUnit = 'pt' | 'mm' | 'px';

export enum FillMode {
    FIT = 'fit', // 适应模式：保持比例，完全显示，可能有空白
    COVER = 'cover', // 覆盖模式：保持比例，铺满页面，可能裁剪
    STRETCH = 'stretch', // 拉伸模式：完全铺满，可能变形
}

export enum CanvasPreset {
    DEFAULT = 'default',
    HIGH_QUALITY = 'high-quality',
    PERFORMANCE = 'performance',
}

export interface Size {
    readonly width: number;
    readonly height: number;
}

export interface Position {
    readonly x: number;
    readonly y: number;
}

export interface Rect extends Size, Position {}

export interface Margins {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface SizeWithUnit extends Size {
    unit?: SizeUnit;
}

//  第三方库类型
export type Html2Canvas = typeof html2canvas;
export type JsPDF = typeof jsPDF;
export type JsPDFInstance = InstanceType<JsPDF>;
export type JsPDFOptions = jsPDFOptions;
export type Html2CanvasConfig = Parameters<typeof html2canvas>[1];
export type CanvasConfig = Html2CanvasConfig & { preset?: CanvasPreset };

//  主要配置接口
export interface ExportConfig {
    filename?: string;
    quality?: number;
    orientation?: PageOrientation;
    format?: PageFormat;
    customSize?: SizeWithUnit;
    fillMode?: FillMode;
    margins?: Margins;
    html2canvasOptions?: CanvasConfig;
    jsPDFOptions?: Partial<JsPDFOptions>;
}

//  图片布局计算结果
export interface ImageLayout extends Rect {
    readonly pageWidth: number;
    readonly pageHeight: number;
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    readonly finalWidth: number;
    readonly finalHeight: number;
    readonly fillMode: FillMode;
    readonly scaleRatio: number;
}

//  PDF尺寸配置
export interface PDFDimensions extends Size {
    readonly unit: SizeUnit;
}

//  导出进度
export interface ExportProgress {
    percentage: number;
    message: string;
}

//  导出进度回调
export type ProgressCallback = (progress: ExportProgress) => void;

//  导出结果
export interface ExportResult {
    success: boolean;
    error?: string;
    fileSize?: number;
    processingTime?: number;
    layout?: ImageLayout;
}

```

### 图片生成器CanvasGenerator

```ts
import type { Html2CanvasConfig, Html2Canvas, CanvasConfig } from './type';
import { CanvasPreset } from './type';

export class CanvasGenerator {
    private html2canvas: Html2Canvas | null = null;

    //  默认配置常量
    private static readonly DEFAULT_CONFIG: Html2CanvasConfig = {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
        imageTimeout: 0,
    } as const;

    //  高质量配置预设
    private static readonly HIGH_QUALITY_CONFIG: Html2CanvasConfig = {
        ...CanvasGenerator.DEFAULT_CONFIG,
        scale: 4,
    } as const;

    //  性能优先配置预设
    private static readonly PERFORMANCE_CONFIG: Html2CanvasConfig = {
        ...CanvasGenerator.DEFAULT_CONFIG,
        scale: 1,
        imageTimeout: 5000,
    } as const;

    private async loadHtml2Canvas(): Promise<Html2Canvas> {
        if (!this.html2canvas) {
            const module = await import('html2canvas');
            this.html2canvas = module.default;
        }
        return this.html2canvas;
    }

    /**
     *  将元素转换为Canvas
     * @param element - 目标DOM元素
     * @param userOptions - 用户自定义配置（会覆盖默认配置）
     */
    async elementToCanvas(
        element: HTMLElement,
        userOptions: CanvasConfig = {},
    ): Promise<HTMLCanvasElement> {
        const html2canvas = await this.loadHtml2Canvas();

        // 配置合并：默认配置 + 元素自适应配置 + 用户自定义配置
        const elementAdaptiveConfig = this.createElementAdaptiveConfig(element);
        const presetConfig = this.getPresetConfig(userOptions.preset || CanvasPreset.DEFAULT);
        const finalConfig = this.mergeConfigs(presetConfig, elementAdaptiveConfig, userOptions);

        try {
            const canvas = await html2canvas(element, finalConfig);
            this.validateCanvas(canvas);
            return canvas;
        } catch (error) {
            throw new Error(`生成Canvas失败: ${error.message}`);
        }
    }

    /**
     *  创建元素自适应配置
     */
    private createElementAdaptiveConfig(element: HTMLElement): Html2CanvasConfig {
        // 获取元素的实际尺寸
        const rect = element.getBoundingClientRect();
        return {
            height: element.scrollHeight || rect.height,
            width: element.scrollWidth || rect.width,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth || rect.width,
            windowHeight: element.scrollHeight || rect.height,
        };
    }

    /**
     *  配置合并策略
     */
    private mergeConfigs(...configs: Html2CanvasConfig[]): Html2CanvasConfig {
        return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
    }

    /**
     *  Canvas验证
     */
    private validateCanvas(canvas: HTMLCanvasElement): void {
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('生成的Canvas无效：尺寸为0');
        }
    }

    /**
     *  Canvas转图像数据
     */
    canvasToImageData(canvas: HTMLCanvasElement, quality = 1): string {
        if (quality < 0 || quality > 1) {
            throw new Error('图片质量必须在0-1之间');
        }
        return canvas.toDataURL('image/png', quality);
    }

    /**
     *  获取预设配置 - 使用枚举
     */
    private getPresetConfig(preset: CanvasPreset): Html2CanvasConfig {
        switch (preset) {
            case CanvasPreset.HIGH_QUALITY:
                return { ...CanvasGenerator.HIGH_QUALITY_CONFIG };
            case CanvasPreset.PERFORMANCE:
                return { ...CanvasGenerator.PERFORMANCE_CONFIG };
            case CanvasPreset.DEFAULT:
            default:
                return { ...CanvasGenerator.DEFAULT_CONFIG };
        }
    }
}

```

### PDF生成器PDFGenerator

```ts
import type {
    ExportConfig,
    JsPDF,
    JsPDFOptions,
    PDFDimensions,
    JsPDFInstance,
    ImageLayout,
    Size,
    SizeUnit,
    PageFormat,
} from './type';
import { FillMode } from './type';

export class PDFGenerator {
    private jsPDF: JsPDF | null = null;

    //  PDF格式预设尺寸（点单位）
    private static readonly FORMAT_DIMENSIONS: Record<Exclude<PageFormat, 'custom'>, Size> = {
        a4: { width: 595.28, height: 841.89 },
        a3: { width: 841.89, height: 1190.55 },
        letter: { width: 612, height: 792 },
    } as const;

    // 单位转换系数（转为点单位）
    private static readonly UNIT_CONVERSION: Record<SizeUnit, number> = {
        px: 0.75, // 96 DPI to 72 DPI
        mm: 2.834645669, // 1mm = 2.834645669pt
        pt: 1, // 点单位不转换
    } as const;

    private async loadJsPDF() {
        if (!this.jsPDF) {
            const module = await import('jspdf');
            this.jsPDF = module.default;
        }
        return this.jsPDF;
    }

    async createPDF(config: ExportConfig = {}) {
        const JsPDF = await this.loadJsPDF();

        const pdfOptions = this.buildJsPDFOptions(config);

        return new JsPDF(pdfOptions);
    }

    /**
     *  构建jsPDF配置选项
     */
    private buildJsPDFOptions(config: ExportConfig): JsPDFOptions {
        const baseOptions: JsPDFOptions = {
            orientation: config.orientation || 'portrait',
            unit: 'pt',
            format: this.getPDFFormat(config),
            compress: true,
            precision: 16,
        };

        // 合并用户自定义jsPDF配置
        return { ...baseOptions, ...config.jsPDFOptions };
    }

    private getPDFFormat(config: ExportConfig): string | [number, number] {
        if (config.format === 'custom' && config.customSize) {
            const dimensions = this.convertToPDFDimensions(config.customSize);
            return [dimensions.width, dimensions.height];
        }
        return config.format || 'a4';
    }

    private convertToPDFDimensions(
        customSize: NonNullable<ExportConfig['customSize']>,
    ): PDFDimensions {
        const { width, height, unit = 'pt' } = customSize;
        const conversionFactor = PDFGenerator.UNIT_CONVERSION[unit];
        return {
            width: width * conversionFactor,
            height: height * conversionFactor,
            unit: 'pt',
        };
    }

    addImageToPDF(
        pdf: JsPDFInstance,
        imageData: string,
        canvas: HTMLCanvasElement,
        config: ExportConfig,
    ): ImageLayout {
        // 步骤1:获取PDF的尺寸
        const pageDimensions = this.getPDFPageDimensions(config);
        // 步骤2：获取Canvas尺寸
        const canvasDimensions: Size = {
            width: canvas.width,
            height: canvas.height,
        };

        // 步骤3：计算图片布局
        const layout = this.calculateImageLayout(
            pageDimensions,
            canvasDimensions,
            config.fillMode || FillMode.FIT,
        );

        // 步骤4：应用边距（如果有）
        const finalLayout = this.applyMargins(layout, config.margins);

        // 步骤5：添加图片到PDF
        pdf.addImage(
            imageData,
            'PNG',
            finalLayout.x,
            finalLayout.y,
            finalLayout.finalWidth,
            finalLayout.finalHeight,
        );

        // 调试信息
        this.logLayoutInfo(finalLayout);

        return finalLayout;
    }

    /**
     * 获取PDF页面尺寸
     */
    private getPDFPageDimensions(config: ExportConfig): Size {
        if (config.format === 'custom' && config.customSize) {
            const dimensions = this.convertToPDFDimensions(config.customSize);
            return { width: dimensions.width, height: dimensions.height };
        }

        const format = config.format || 'a4';
        const baseDimensions =
            PDFGenerator.FORMAT_DIMENSIONS[format as Exclude<PageFormat, 'custom'>];

        // 处理横向/纵向
        if (config.orientation === 'landscape') {
            return {
                width: baseDimensions.height,
                height: baseDimensions.width,
            };
        }

        return baseDimensions;
    }

    /**
     * 计算图片布局
     */
    private calculateImageLayout(
        pageDimensions: Size,
        canvasDimensions: Size,
        fillMode: FillMode,
    ): ImageLayout {
        const { width: pageWidth, height: pageHeight } = pageDimensions;
        const { width: canvasWidth, height: canvasHeight } = canvasDimensions;

        // 计算缩放比例
        const scaleX = pageWidth / canvasWidth;
        const scaleY = pageHeight / canvasHeight;

        let finalWidth: number; // 最终图片宽度
        let finalHeight: number; // 最终图片高度
        let x: number; // 图片在页面中的x坐标
        let y: number; // 图片在页面中的y坐标
        let scaleRatio: number;

        switch (fillMode) {
            case FillMode.STRETCH:
                // 拉伸模式：完全铺满，可能变形
                finalWidth = pageWidth;
                finalHeight = pageHeight;
                x = 0;
                y = 0;
                scaleRatio = Math.max(scaleX, scaleY);
                break;
            case FillMode.COVER:
                // 覆盖模式：保持比例，铺满页面，可能裁剪
                scaleRatio = Math.max(scaleX, scaleY);
                finalWidth = canvasWidth * scaleRatio;
                finalHeight = canvasHeight * scaleRatio;
                x = (pageWidth - finalWidth) / 2;
                y = (pageHeight - finalHeight) / 2;
                break;

            case FillMode.FIT:
            default:
                // 适应模式：保持比例，完全显示，可能有空白
                scaleRatio = Math.min(scaleX, scaleY);
                finalWidth = canvasWidth * scaleRatio;
                finalHeight = canvasHeight * scaleRatio;
                x = (pageWidth - finalWidth) / 2;
                y = (pageHeight - finalHeight) / 2;
                break;
        }

        return {
            pageWidth,
            pageHeight,
            canvasWidth,
            canvasHeight,
            finalWidth,
            finalHeight,
            x,
            y,
            width: finalWidth,
            height: finalHeight,
            fillMode,
            scaleRatio,
        };
    }

    /**
     * 应用边距
     */
    private applyMargins(layout: ImageLayout, margins?: ExportConfig['margins']): ImageLayout {
        if (!margins) return layout;

        const { top = 0, right = 0, bottom = 0, left = 0 } = margins;

        return {
            ...layout,
            x: layout.x + left,
            y: layout.y + top,
            finalWidth: layout.finalWidth - left - right,
            finalHeight: layout.finalHeight - top - bottom,
            width: layout.finalWidth - left - right,
            height: layout.finalHeight - top - bottom,
        };
    }

    /**
     * 输出布局调试信息
     */
    private logLayoutInfo(layout: ImageLayout): void {
        console.group('📄 PDF布局信息');
        console.table({
            页面尺寸: `${layout.pageWidth.toFixed(2)} × ${layout.pageHeight.toFixed(2)} pt`,
            Canvas尺寸: `${layout.canvasWidth} × ${layout.canvasHeight} px`,
            最终图片尺寸: `${layout.finalWidth.toFixed(2)} × ${layout.finalHeight.toFixed(2)} pt`,
            位置偏移: `(${layout.x.toFixed(2)}, ${layout.y.toFixed(2)})`,
            缩放比例: layout.scaleRatio.toFixed(3),
            填充模式: layout.fillMode,
        });
        console.groupEnd();
    }

    savePDF(pdf: JsPDFInstance, filename: string) {
        if (!filename.endsWith('.pdf')) {
            filename += '.pdf';
        }
        pdf.save(filename);
    }
}

```

### 组合控制类VueToPDFExporter

```ts
import type { ExportConfig, ProgressCallback, ExportResult, ImageLayout } from './type';
import { FillMode } from './type';
import { CanvasGenerator } from './canvas-generator';
import { PDFGenerator } from './pdf-generator';

export class VueToPDFExporter {
    private readonly canvasGenerator = new CanvasGenerator();
    private readonly pdfGenerator = new PDFGenerator();

    /**
     *  导出元素为PDF
     */
    async export(
        element: HTMLElement,
        config: ExportConfig = {},
        onProgress?: ProgressCallback,
    ): Promise<ExportResult> {
        const startTime = Date.now();

        try {
            this.validateInput(element);

            const finalConfig = this.normalizeConfig(config);

            //  步骤1：生成Canvas
            onProgress?.({ percentage: 20, message: '正在捕获页面内容...' });
            const canvas = await this.generateCanvas(element, finalConfig);

            //  步骤2：转换图像数据
            onProgress?.({ percentage: 50, message: '正在处理图像数据...' });
            const imageData = this.generateImageData(canvas, finalConfig);

            //  步骤3：创建PDF并添加内容
            onProgress?.({ percentage: 70, message: '正在生成PDF文档...' });
            const pdf = await this.pdfGenerator.createPDF(finalConfig);

            onProgress?.({ percentage: 85, message: '正在添加内容到PDF...' });
            const layout = this.pdfGenerator.addImageToPDF(pdf, imageData, canvas, finalConfig);

            //  步骤4：保存文件
            onProgress?.({ percentage: 95, message: '正在下载文件...' });
            this.pdfGenerator.savePDF(pdf, finalConfig.filename!);

            onProgress?.({ percentage: 100, message: '导出完成！' });

            return this.buildSuccessResult(imageData, startTime, layout);
        } catch (error) {
            return this.buildErrorResult(error);
        }
    }

    /**
     *  输入验证
     */
    private validateInput(element: HTMLElement): void {
        if (!element) {
            throw new Error('目标元素不存在');
        }
        if (!(element instanceof HTMLElement)) {
            throw new Error('目标必须是有效的HTML元素');
        }
    }

    /**
     *  配置标准化
     */
    private normalizeConfig(
        config: ExportConfig,
    ): Required<Pick<ExportConfig, 'filename' | 'quality' | 'orientation' | 'format'>> &
        ExportConfig {
        return {
            filename: `export-${Date.now()}.pdf`,
            quality: 1,
            orientation: 'portrait',
            format: 'a4',
            fillMode: FillMode.FIT,
            ...config,
        };
    }

    /**
     *  生成Canvas（使用用户配置）
     */
    private async generateCanvas(
        element: HTMLElement,
        config: ExportConfig,
    ): Promise<HTMLCanvasElement> {
        //  使用用户提供的html2canvas配置
        const html2canvasOptions = config.html2canvasOptions || {};
        const canvas = await this.canvasGenerator.elementToCanvas(element, html2canvasOptions);
        return canvas;
    }

    /**
     *  生成图像数据
     */
    private generateImageData(canvas: HTMLCanvasElement, config: ExportConfig): string {
        return this.canvasGenerator.canvasToImageData(canvas, config.quality);
    }

    /**
     *  构建成功结果
     */
    private buildSuccessResult(
        imageData: string,
        startTime: number,
        layout: ImageLayout,
    ): ExportResult {
        return {
            success: true,
            fileSize: Math.round(imageData.length * 0.75),
            processingTime: Date.now() - startTime,
            layout, //  返回布局信息用于调试
        };
    }

    /**
     *  构建错误结果
     */
    private buildErrorResult(error: unknown): ExportResult {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

```

### 响应式状态钩子usePDFExport

```ts
import { ref, computed } from 'vue';
import type { ExportConfig, ExportResult } from '~/utils/pdf/type';
import { VueToPDFExporter } from '~/utils/pdf';

export function usePDFExport() {
    const isExporting = ref(false);
    const exportProgress = ref(0);
    const exportMessage = ref('');
    const lastResult = ref<ExportResult | null>(null);

    const exporter = new VueToPDFExporter();

    const exportToPDF = async (
        element: HTMLElement | (() => HTMLElement),
        config: ExportConfig = {},
    ): Promise<ExportResult> => {
        try {
            isExporting.value = true;

            // 获取目标元素
            const targetElement = typeof element === 'function' ? element() : element;
            if (!targetElement) {
                throw new Error('未找到目标元素');
            }

            // 执行导出
            const result = await exporter.export(targetElement, config, (progress) => {
                exportProgress.value = progress.percentage;
                exportMessage.value = progress.message;
            });

            lastResult.value = result;
            return result;
        } catch (error) {
            const errorResult: ExportResult = {
                success: false,
                error: error.message,
            };
            lastResult.value = errorResult;
            return errorResult;
        } finally {
            isExporting.value = false;
            // 延迟重置进度
            setTimeout(() => {
                exportProgress.value = 0;
                exportMessage.value = '';
            }, 1000);
        }
    };

    return {
        // 状态
        isExporting: computed(() => isExporting.value),
        exportProgress: computed(() => exportProgress.value),
        exportMessage: computed(() => exportMessage.value),
        lastResult: computed(() => lastResult.value),

        // 方法
        exportToPDF,
    };
}

```
