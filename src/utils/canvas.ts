export type MaskShape = 'circle' | 'hexagon' | 'star' | 'diamond' | 'square' | 'triangle'

export interface MaskParams {
  width: number
  height: number
  cx: number
  cy: number
  radius: number
  blur: number
  shape: MaskShape
  points?: number
  innerRadius?: number
}

function generateGaussianBlurKernel(sigma: number): Float32Array {
  const kernelSize = Math.max(1, Math.floor(sigma * 6) | 1)
  const kernel = new Float32Array(kernelSize)
  let sum = 0

  for (let i = 0; i < kernelSize; i++) {
    const x = i - kernelSize / 2
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma))
    sum += kernel[i]
  }

  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum
  }

  return kernel
}

function applyAlphaBlur(data: Uint8ClampedArray, width: number, height: number, blur: number) {
  if (blur <= 0) return

  const sigma = blur
  const kernel = generateGaussianBlurKernel(sigma)
  const kernelSize = kernel.length

  const alpha = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    alpha[i] = data[i * 4 + 3]
  }

  const temp = new Float32Array(width * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let k = 0; k < kernelSize; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + k - Math.floor(kernelSize / 2)))
        value += alpha[y * width + sx] * kernel[k]
      }
      temp[y * width + x] = value
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let k = 0; k < kernelSize; k++) {
        const sy = Math.min(height - 1, Math.max(0, y + k - Math.floor(kernelSize / 2)))
        value += temp[sy * width + x] * kernel[k]
      }
      alpha[y * width + x] = value
    }
  }

  for (let i = 0; i < width * height; i++) {
    data[i * 4 + 3] = Math.round(alpha[i])
  }
}

function drawPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, sides: number) {
  ctx.moveTo(cx + radius * Math.cos(-Math.PI / 2), cy + radius * Math.sin(-Math.PI / 2))
  for (let i = 1; i <= sides; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
  }
  ctx.closePath()
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number) {
  const step = Math.PI / points
  ctx.moveTo(cx + outerRadius * Math.cos(-Math.PI / 2), cy + outerRadius * Math.sin(-Math.PI / 2))
  for (let i = 0; i < points; i++) {
    const outerAngle = -Math.PI / 2 + (i * 2 * Math.PI) / points
    const innerAngle = outerAngle + step
    ctx.lineTo(cx + outerRadius * Math.cos(outerAngle), cy + outerRadius * Math.sin(outerAngle))
    ctx.lineTo(cx + innerRadius * Math.cos(innerAngle), cy + innerRadius * Math.sin(innerAngle))
  }
  ctx.closePath()
}

function drawShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, shape: MaskShape, points?: number, innerRadius?: number) {
  ctx.beginPath()
  switch (shape) {
    case 'circle':
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      break
    case 'hexagon':
      drawPolygon(ctx, cx, cy, radius, 6)
      break
    case 'triangle':
      drawPolygon(ctx, cx, cy, radius, 3)
      break
    case 'diamond':
      drawPolygon(ctx, cx, cy, radius, 4)
      break
    case 'square':
      ctx.rect(cx - radius, cy - radius, radius * 2, radius * 2)
      break
    case 'star':
      const starPoints = points ?? 5
      const starInnerRadius = (innerRadius ?? 0.5) * radius
      drawStar(ctx, cx, cy, radius, starInnerRadius, starPoints)
      break
    default:
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  }
  ctx.fill()
}

export async function generateMask(params: MaskParams): Promise<Blob> {
  const { width, height, cx, cy, radius, blur, shape, points, innerRadius } = params

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#000000'
  drawShape(ctx, cx, cy, radius, shape, points, innerRadius)

  const imageData = ctx.getImageData(0, 0, width, height)
  applyAlphaBlur(imageData.data, width, height, blur)

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}