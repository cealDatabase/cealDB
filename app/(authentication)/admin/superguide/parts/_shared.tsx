'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldAlert,
  XCircle,
} from 'lucide-react'

export type Lang = 'zh' | 'en'

export interface PartProps {
  lang: Lang
}

interface BilingualText {
  zh: React.ReactNode
  en: React.ReactNode
}

/* ---------------- Bilingual primitive ---------------- */

export function B({ zh, en, lang }: BilingualText & { lang: Lang }) {
  return <>{lang === 'zh' ? zh : en}</>
}

/* ---------------- Section heading anchors ---------------- */

export function SectionH2({
  id,
  zh,
  en,
  lang,
}: { id: string } & BilingualText & { lang: Lang }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-3xl font-bold text-gray-900 mb-3 border-b-2 border-red-800 pb-2"
    >
      {lang === 'zh' ? zh : en}
    </h2>
  )
}

export function SectionH3({
  id,
  zh,
  en,
  lang,
}: { id: string } & BilingualText & { lang: Lang }) {
  return (
    <h3
      id={id}
      className="scroll-mt-24 text-2xl font-semibold text-gray-900 mt-10 mb-3"
    >
      {lang === 'zh' ? zh : en}
    </h3>
  )
}

export function SectionH4({
  id,
  zh,
  en,
  lang,
}: { id: string } & BilingualText & { lang: Lang }) {
  return (
    <h4
      id={id}
      className="scroll-mt-24 text-xl font-semibold text-gray-800 mt-8 mb-2"
    >
      {lang === 'zh' ? zh : en}
    </h4>
  )
}

/* ---------------- Paragraph helper ---------------- */

export function P({
  zh,
  en,
  lang,
  className,
}: BilingualText & { lang: Lang; className?: string }) {
  return (
    <div className={cn('text-gray-700 leading-7 my-3', className)}>
      {lang === 'zh' ? zh : en}
    </div>
  )
}

/* ---------------- Call-out boxes ---------------- */

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'success' | 'critical'

const calloutStyles: Record<
  CalloutType,
  { wrap: string; icon: React.ReactNode; titleColor: string }
> = {
  info: {
    wrap: 'border-blue-200 bg-blue-50',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    titleColor: 'text-blue-900',
  },
  tip: {
    wrap: 'border-emerald-200 bg-emerald-50',
    icon: <Lightbulb className="w-5 h-5 text-emerald-600" />,
    titleColor: 'text-emerald-900',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    titleColor: 'text-amber-900',
  },
  danger: {
    wrap: 'border-red-300 bg-red-50',
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    titleColor: 'text-red-900',
  },
  critical: {
    wrap: 'border-red-400 bg-red-100 ring-2 ring-red-200',
    icon: <ShieldAlert className="w-5 h-5 text-red-700" />,
    titleColor: 'text-red-900',
  },
  success: {
    wrap: 'border-emerald-300 bg-emerald-50',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    titleColor: 'text-emerald-900',
  },
}

export function Callout({
  type = 'info',
  title,
  children,
  lang,
}: {
  type?: CalloutType
  title?: BilingualText
  children: React.ReactNode
  lang: Lang
}) {
  const s = calloutStyles[type]
  return (
    <div className={cn('my-5 rounded-lg border p-4', s.wrap)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{s.icon}</div>
        <div className="flex-1">
          {title && (
            <div className={cn('font-semibold mb-1', s.titleColor)}>
              {lang === 'zh' ? title.zh : title.en}
            </div>
          )}
          <div className="text-gray-800 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Code-style monospace inline ---------------- */

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-gray-100 text-pink-700 text-[0.92em] font-mono">
      {children}
    </code>
  )
}

/* ---------------- Key-value box (for env vars, URLs, etc) ---------------- */

export function KeyValueList({
  items,
}: {
  items: { key: string; value: React.ReactNode; note?: React.ReactNode }[]
}) {
  return (
    <div className="my-4 rounded-lg border bg-gray-50 divide-y">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4 py-3">
          <Code>{item.key}</Code>
          <div className="md:col-span-2 text-sm text-gray-800">
            {item.value}
            {item.note && (
              <div className="text-xs text-gray-500 mt-1">{item.note}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Checklist (with checkbox visual) ---------------- */

export function Checklist({
  items,
  lang,
}: {
  items: { zh: React.ReactNode; en: React.ReactNode; urgent?: boolean }[]
  lang: Lang
}) {
  return (
    <ul className="my-4 space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className={cn(
            'flex items-start gap-3 px-3 py-2 rounded border',
            it.urgent
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-white'
          )}
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-400"
          />
          <span className="text-sm text-gray-800 leading-6">
            {lang === 'zh' ? it.zh : it.en}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- Step card (numbered) ---------------- */

export function StepCard({
  step,
  title,
  children,
  lang,
}: {
  step: number
  title: BilingualText
  children: React.ReactNode
  lang: Lang
}) {
  return (
    <Card className="my-4 border-l-4 border-l-red-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-sm">
            {step}
          </div>
          <CardTitle className="text-lg">
            {lang === 'zh' ? title.zh : title.en}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2 text-sm text-gray-700 leading-6">
        {children}
      </CardContent>
    </Card>
  )
}

/* ---------------- Month timeline card ---------------- */

export function MonthCard({
  month,
  title,
  children,
  lang,
  color = 'red',
}: {
  month: BilingualText
  title: BilingualText
  children: React.ReactNode
  lang: Lang
  color?: 'red' | 'blue' | 'green' | 'amber' | 'gray'
}) {
  const colorMap = {
    red: 'border-l-red-700 bg-red-50/50',
    blue: 'border-l-blue-700 bg-blue-50/50',
    green: 'border-l-emerald-700 bg-emerald-50/50',
    amber: 'border-l-amber-700 bg-amber-50/50',
    gray: 'border-l-gray-500 bg-gray-50/50',
  }
  return (
    <Card className={cn('my-5 border-l-4', colorMap[color])}>
      <CardHeader className="pb-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <Badge variant="outline" className="text-base px-3 py-1 bg-white">
            🗓️ {lang === 'zh' ? month.zh : month.en}
          </Badge>
          <CardTitle className="text-lg">
            {lang === 'zh' ? title.zh : title.en}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 leading-6">
        {children}
      </CardContent>
    </Card>
  )
}

/* ---------------- Comparison / data table ---------------- */

export function GuideTable({
  headers,
  rows,
  lang,
}: {
  headers: BilingualText[]
  rows: BilingualText[][]
  lang: Lang
}) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-gray-300 px-3 py-2 text-left font-semibold text-gray-800"
              >
                {lang === 'zh' ? h.zh : h.en}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border-b border-gray-200 px-3 py-2 align-top text-gray-700"
                >
                  {lang === 'zh' ? cell.zh : cell.en}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------- Page link button ---------------- */

export function PageLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-red-800 underline hover:text-red-900 font-medium"
    >
      {children}
      <span className="text-xs">↗</span>
    </a>
  )
}

/* ---------------- Role badge ---------------- */

export function RoleBadge({ id, lang }: { id: 1 | 2 | 3 | 4; lang: Lang }) {
  const map = {
    1: {
      zh: '超级管理员',
      en: 'Super Admin',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
    2: {
      zh: '成员机构',
      en: 'Member Institution',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    3: {
      zh: '电子资源编辑者',
      en: 'E-Resource Editor',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    4: {
      zh: '助理管理员',
      en: 'Assistant Admin',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  } as const
  const r = map[id]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold',
        r.color
      )}
    >
      Role {id} · {lang === 'zh' ? r.zh : r.en}
    </span>
  )
}
