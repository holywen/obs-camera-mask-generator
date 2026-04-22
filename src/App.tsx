import './App.css'
import { useState, useCallback, useRef, useEffect } from 'react'
import { generateMask, type MaskParams, type MaskShape } from './utils/canvas'
import { translations, type Language } from './i18n'

interface Resolution {
  width: number
  height: number
}

const RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 960, height: 540 },
  { width: 640, height: 360 },
]

interface InputFieldProps {
  label: string
  name: keyof MaskParams
  value: number
  onChange: (name: keyof MaskParams, value: number) => void
  min?: number
  max?: number
  step?: number
}

function InputField({ label, name, value, onChange, min = 1, max = 10000, step = 1 }: InputFieldProps) {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(name, Number(e.target.value))}
      />
    </div>
  )
}

function App() {
  const [lang, setLang] = useState<Language>('zh')
  const [selectedRes, setSelectedRes] = useState<number>(1)
  const [isCustom, setIsCustom] = useState(false)
  const [params, setParams] = useState<MaskParams>({
    width: 1280,
    height: 720,
    cx: 640,
    cy: 360,
    radius: 360,
    blur: 0,
    shape: 'circle',
    points: 5,
    innerRadius: 0.5,
  })
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showError, setShowError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const t = translations[lang]

  const handleResolutionChange = useCallback((index: number) => {
    setSelectedRes(index)
    if (index < RESOLUTIONS.length) {
      setIsCustom(false)
      const res = RESOLUTIONS[index]
      setParams((prev) => ({
        ...prev,
        width: res.width,
        height: res.height,
        cx: Math.floor(res.width / 2),
        cy: Math.floor(res.height / 2),
        radius: Math.floor(res.height / 2),
      }))
    } else {
      setIsCustom(true)
    }
  }, [])

  const updateParam = useCallback((name: keyof MaskParams, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'))
  }, [])

  useEffect(() => {
    let url = ''
    const timer = setTimeout(async () => {
      setIsGenerating(true)
      setShowError(false)
      try {
        const blob = await generateMask(params)
        url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch {
        setShowError(true)
      } finally {
        setIsGenerating(false)
      }
    }, 150)

    return () => {
      if (url) URL.revokeObjectURL(url)
      clearTimeout(timer)
    }
  }, [params])

  const handleDownload = async () => {
    const blob = await generateMask(params)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `obs_mask_${params.shape}_${params.width}x${params.height}.png`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main>
      <header>
        <button className="lang-toggle" onClick={toggleLang}>
          {lang === 'zh' ? 'EN' : '中'}
        </button>
        <h1>{t.title}</h1>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <section className="form-section">
        <label className="section-label">{t.resolutionLabel}</label>
        <div className="resolution-selector">
          {t.resolutions.map((label, index) => (
            <button
              key={label}
              className={`res-btn ${selectedRes === index ? 'active' : ''}`}
              onClick={() => handleResolutionChange(index)}
            >
              {label}
            </button>
          ))}
        </div>

        {isCustom ? (
          <div className="input-row">
            <InputField label={t.width} name="width" value={params.width} onChange={updateParam} min={1} max={4096} />
            <InputField label={t.height} name="height" value={params.height} onChange={updateParam} min={1} max={4096} />
          </div>
        ) : null}

        <div className="input-row">
          <InputField label={t.centerX} name="cx" value={params.cx} onChange={updateParam} min={0} max={params.width} />
          <InputField label={t.centerY} name="cy" value={params.cy} onChange={updateParam} min={0} max={params.height} />
        </div>
        <div className="input-row">
          <InputField label={t.radius} name="radius" value={params.radius} onChange={updateParam} min={1} max={Math.max(params.width, params.height)} />
          <InputField label={t.blur} name="blur" value={params.blur} onChange={updateParam} min={0} max={100} step={0.5} />
        </div>

        <div className="input-row">
          <div className="input-group shape-input-group">
            <label>{t.shape}</label>
            <div className="shape-selector">
              {t.shapes.map((label, index) => {
                const shapeTypes: MaskShape[] = ['circle', 'hexagon', 'star', 'diamond', 'square', 'triangle']
                return (
                  <button
                    key={label}
                    className={`shape-btn ${params.shape === shapeTypes[index] ? 'active' : ''}`}
                    onClick={() => setParams((prev) => ({ ...prev, shape: shapeTypes[index] }))}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {params.shape === 'star' && (
          <div className="input-row">
            <InputField label={t.points} name="points" value={params.points ?? 5} onChange={(_, value) => setParams((prev) => ({ ...prev, points: value }))} min={3} max={12} />
            <InputField label={t.innerRadius} name="innerRadius" value={Math.round((params.innerRadius ?? 0.5) * 100)} onChange={(_, value) => setParams((prev) => ({ ...prev, innerRadius: value / 100 }))} min={10} max={90} />
          </div>
        )}
      </section>

      <section className="preview-section">
        <div className="preview-container">
          {isGenerating ? (
            <div className="loading">{t.generating}</div>
          ) : showError ? (
            <div className="error">{t.error}</div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Preview" className="preview-image" />
          ) : null}
        </div>
        <div className="preview-info">
          <span>{params.width} × {params.height}</span>
          <span>({params.cx}, {params.cy})</span>
          <span>{t.radius} {params.radius}</span>
          <span>{t.blur} {params.blur}</span>
        </div>
      </section>

      <button className="download-btn" onClick={handleDownload} disabled={isGenerating}>
        {t.download}
      </button>

      <footer>
        <p>{t.footer}</p>
      </footer>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </main>
  )
}

export default App