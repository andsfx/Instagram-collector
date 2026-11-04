import type React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <Skeleton className={`rounded-md ${className ?? ''}`} style={style} />
}

/** Shared shell: one section head + a card grid of bone lines. */
function SkeletonBand({ lines = 3, tall }: { lines?: number; tall?: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="grid gap-2.5">
            {Array.from({ length: lines }).map((_, i) => (
              <Bone key={i} style={{ width: `${88 - i * 16}%`, height: tall ? 22 : 14 }} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bone key={i} style={{ width: `${70 - i * 8}%`, height: 12 }} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function GrowthSkeleton() {
  return <SkeletonBand lines={2} tall />
}

export function HeadToHeadSkeleton() {
  return <SkeletonBand lines={5} />
}

export function HeatmapSkeleton() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardContent>
          <div className="grid grid-cols-[64px_repeat(4,minmax(0,1fr))] gap-0.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <Bone key={i} className="h-[34px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ChartSuiteSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent>
              <Bone className="mb-3.5 h-3 w-[120px]" />
              <Bone className="h-[220px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardContent>
              <Bone className="mb-3.5 h-3 w-[120px]" />
              <Bone className="h-[220px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent>
            <Bone className="mb-3.5 h-3 w-[140px]" />
            <Bone className="h-20 w-[min(70%,360px)]" />
            <Bone className="mt-4 h-3 w-[220px]" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-3.5">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} style={{ width: `${92 - i * 12}%`, height: 14 }} />
            ))}
          </CardContent>
        </Card>
      </div>
      <SkeletonBand lines={4} />
    </div>
  )
}
