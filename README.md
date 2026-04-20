# OBS Circle Mask Generator

生成摄像头圆形掩码图片，用于 OBS 场景抠像。

Generate circular mask images for OBS webcam overlay.

## 在线使用 / Online

部署后可访问: https://holywen.github.io/obs-camera-mask-generator

## 功能 / Features

- 支持多种分辨率预设 (1080p/720p/540p/360p/Custom)
- 实时预览生成效果
- 中英文双语支持
- 纯前端实现，无需后端服务
- 移动端适配

## 技术栈 / Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Canvas API (高斯模糊仅作用于 Alpha 通道)

## 开发 / Development

```bash
npm install
npm run dev
```

## 构建 / Build

```bash
npm run build
```

## 等效 ImageMagick 命令

```bash
magick -size 1280x720 xc:none \
  -fill black \
  -draw "circle 640,360 640,0" \
  -channel A -blur 0x6 +channel \
  -strip \
  obs_circle_mask_final.png
```

## License

MIT