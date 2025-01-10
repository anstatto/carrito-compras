import { memo } from 'react'

const LoadingRow = memo(() => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
  </tr>
))
LoadingRow.displayName = 'LoadingRow'

export default function OrdersLoading() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {[...Array(5)].map((_, i) => (
              <LoadingRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 