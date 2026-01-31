import { useEffect, useState } from 'react'

interface GaugeProps {
  value: number // 0-100
  label: string
  unit?: string
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export default function Gauge({ value, label, unit = '', color = 'blue', size = 'md', showValue = true }: GaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= value) {
        setAnimatedValue(value)
        clearInterval(interval)
      } else {
        setAnimatedValue(current)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  }

  const colorClasses = {
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
    blue: 'stroke-blue-500',
    purple: 'stroke-purple-500'
  }

  const colorGradients = {
    green: ['#10b981', '#34d399'],
    yellow: ['#f59e0b', '#fbbf24'],
    red: ['#ef4444', '#f87171'],
    blue: ['#3b82f6', '#60a5fa'],
    purple: ['#8b5cf6', '#a78bfa']
  }

  const radius = size === 'sm' ? 50 : size === 'md' ? 70 : 90
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  const getColor = () => {
    if (animatedValue > 70) return 'red'
    if (animatedValue > 40) return 'yellow'
    return 'green'
  }

  const currentColor = color === 'blue' ? getColor() : color

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="transform -rotate-90" width={size === 'sm' ? 128 : size === 'md' ? 192 : 256} height={size === 'sm' ? 128 : size === 'md' ? 192 : 256}>
          {/* Background circle */}
          <circle
            cx={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            cy={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            cy={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
            r={radius}
            stroke={`url(#gradient-${currentColor})`}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 8px currentColor)'
            }}
          />
          <defs>
            <linearGradient id={`gradient-${currentColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorGradients[currentColor as keyof typeof colorGradients][0]} />
              <stop offset="100%" stopColor={colorGradients[currentColor as keyof typeof colorGradients][1]} />
            </linearGradient>
          </defs>
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-bold ${size === 'sm' ? 'text-2xl' : size === 'md' ? 'text-4xl' : 'text-5xl'}`} style={{
              color: colorGradients[currentColor as keyof typeof colorGradients][0]
            }}>
              {animatedValue.toFixed(1)}
            </span>
            {unit && (
              <span className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
                {unit}
              </span>
            )}
          </div>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

