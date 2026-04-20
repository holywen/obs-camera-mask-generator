export interface MaskParams {
  width: number
  height: number
  cx: number
  cy: number
  radius: number
  blur: number
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

export async function generateMask(params: MaskParams): Promise<Blob> {
  const { width, height, cx, cy, radius, blur } = params

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, width, height)

  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  const imageData = ctx.getImageData(0, 0, width, height)
  applyAlphaBlur(imageData.data, width, height, blur)

  ctx.putImageData(imageData, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}