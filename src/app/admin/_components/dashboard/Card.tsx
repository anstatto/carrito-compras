'use client'

import { FaShoppingCart, FaUsers, FaBox, FaDollarSign, FaClock, FaChartLine } from 'react-icons/fa'

const ICONS = {
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaDollarSign,
  FaClock,
  FaChartLine
} as const

interface CardProps {
  title: string
  value: string
  iconName: keyof typeof ICONS
  color: 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'indigo'
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    light: 'bg-blue-100'
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    light: 'bg-green-100'
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    light: 'bg-purple-100'
  },
  pink: {
    bg: 'bg-pink-500',
    text: 'text-pink-600',
    light: 'bg-pink-100'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    light: 'bg-yellow-100'
  },
  indigo: {
    bg: 'bg-indigo-500',
    text: 'text-indigo-600',
    light: 'bg-indigo-100'
  }
}

export function Card({ title, value, iconName, color }: CardProps) {
  const colors = colorVariants[color]
  const Icon = ICONS[iconName]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors.light} ${colors.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-semibold text-gray-900">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
} 