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
  download: string
  generating: string
  error: string
  footer: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    title: 'OBS 圆形掩码生成器',
    subtitle: '生成摄像头圆形遮罩图片，用于 OBS 场景抠像',
    resolutionLabel: '摄像头分辨率',
    resolutions: ['1080p', '720p', '540p', '360p', '自定义'],
    custom: '自定义',
    width: '宽度',
    height: '高度',
    centerX: '圆心 X',
    centerY: '圆心 Y',
    radius: '圆半径',
    blur: '模糊半径',
    download: '下载 PNG',
    generating: '生成中...',
    error: '生成失败',
    footer: '生成的图片为透明背景 + 黑色模糊圆形，可直接在 OBS 中使用',
  },
  en: {
    title: 'OBS Circle Mask Generator',
    subtitle: 'Generate circular mask images for OBS webcam overlay',
    resolutionLabel: 'Camera Resolution',
    resolutions: ['1080p', '720p', '540p', '360p', 'Custom'],
    custom: 'Custom',
    width: 'Width',
    height: 'Height',
    centerX: 'Center X',
    centerY: 'Center Y',
    radius: 'Radius',
    blur: 'Blur',
    download: 'Download PNG',
    generating: 'Generating...',
    error: 'Generation failed',
    footer: 'Generated image has transparent background with black blurred circle, ready for OBS',
  },
}

export function getResolutionLabel(lang: Language, index: number): string {
  return translations[lang].resolutions[index]
}
