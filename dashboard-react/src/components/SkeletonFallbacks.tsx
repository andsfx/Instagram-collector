import type React from 'react'

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton rounded-[var(--radius-sm)] ${className ?? ''}`} style={style} />
}

export function GrowthSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5 sm:col-span-2">
        <Bone className="mb-2 h-3 w-24" />
        <Bone className="mb-2 h-10 w-48" />
        <Bone className="h-4 w-32" />
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5">
        <Bone className="mb-2 h-3 w-20" />
        <Bone className="mb-2 h-7 w-32" />
        <Bone className="h-3 w-24" />
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-5">
        <Bone className="mb-2 h-3 w-16" />
        <Bone className="mb-2 h-7 w-20" />
        <Bone className="h-3 w-24" />
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4 sm:col-span-2 lg:col-span-4">
        <Bone className="mb-3 h-3 w-28" />
        <div className="grid gap-2">
          {[100, 75, 70, 55, 50].map((w) => (
            <div key={w} className="grid grid-cols-[140px_1fr_80px] items-center gap-3">
              <Bone className="h-4 w-24" />
              <Bone className="h-5" style={{ width: `${w}%` }} />
              <Bone className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeadToHeadSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2 sm:grid-cols-3">
        <Bone className="h-10 rounded-[var(--radius-sm)]" />
        <Bone className="h-10 rounded-[var(--radius-sm)]" />
        <Bone className="h-10 rounded-[var(--radius-sm)]" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Bone key={i} className="h-9 w-24 rounded-[var(--radius-pill)]" />
        ))}
      </div>
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-3">
            <Bone className="h-5" />
            <Bone className="mx-auto h-5 w-20" />
            <Bone className="ml-auto h-5 w-24" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-3 items-center gap-3 border-t border-[var(--border)] pt-3">
              <Bone className="h-4 w-20" />
              <Bone className="mx-auto h-3 w-16" />
              <Bone className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      <Bone className="h-[280px] rounded-[var(--radius-lg)]" />
    </div>
  )
}

export function HeatmapSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <Bone className="h-3 w-32" />
        <Bone className="h-8 w-40 rounded-[var(--radius-sm)]" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <Bone key={i} className="h-8 rounded-[4px]" />
        ))}
      </div>
    </div>
  )
}

export function ChartSuiteSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
          <Bone className="mb-2 h-4 w-32" />
          <Bone className="mb-3 h-3 w-48" />
          <Bone className="h-[200px] rounded-[var(--radius-sm)]" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 py-8">
      <GrowthSkeleton />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] p-4">
            <Bone className="mb-2 h-3 w-20" />
            <Bone className="mb-2 h-8 w-28" />
            <Bone className="h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  )
}