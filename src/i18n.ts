export type Language = 'zh' | 'en'

export interface Translations {
  title: string
  subtitle: string
  resolutionLabel: string
  resolutions: string[]
  custom: string
  width: string
  height: string
  centerX: string
  centerY: string
  radius: string
  blur: string
  shape: string
  shapes: string[]
  points: string
  innerRadius: string
  download: string
  generating: string
  error: string
  footer: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    title: 'OBS 蒙版生成器',
    subtitle: '生成摄像头蒙版图片，用于 OBS 场景抠像',
    resolutionLabel: '摄像头分辨率',
    resolutions: ['1080p', '720p', '540p', '360p', '自定义'],
    custom: '自定义',
    width: '宽度',
    height: '高度',
    centerX: '中心 X',
    centerY: '中心 Y',
    radius: '半径',
    blur: '模糊',
    shape: '形状',
    shapes: ['圆形', '六边形', '星形', '菱形', '正方形', '三角形'],
    points: '星形角数',
    innerRadius: '星形内径比',
    download: '下载 PNG',
    generating: '生成中...',
    error: '生成失败',
    footer: '生成的图片为透明背景 + 模糊形状，可直接在 OBS 中使用',
  },
  en: {
    title: 'OBS Mask Generator',
    subtitle: 'Generate mask images for OBS webcam overlay',
    resolutionLabel: 'Camera Resolution',
    resolutions: ['1080p', '720p', '540p', '360p', 'Custom'],
    custom: 'Custom',
    width: 'Width',
    height: 'Height',
    centerX: 'Center X',
    centerY: 'Center Y',
    radius: 'Radius',
    blur: 'Blur',
    shape: 'Shape',
    shapes: ['Circle', 'Hexagon', 'Star', 'Diamond', 'Square', 'Triangle'],
    points: 'Star Points',
    innerRadius: 'Inner Radius Ratio',
    download: 'Download PNG',
    generating: 'Generating...',
    error: 'Generation failed',
    footer: 'Generated image has transparent background with blurred shape, ready for OBS',
  },
}

export function getResolutionLabel(lang: Language, index: number): string {
  return translations[lang].resolutions[index]
}
