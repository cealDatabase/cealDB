'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Cog,
  FileText,
  Globe,
  Languages,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Printer,
  Rocket,
  Search,
  ShieldCheck,
  SlashIcon,
} from 'lucide-react'

import type { Lang } from './parts/_shared'
import Part0Overview from './parts/Part0Overview'
import Part1GettingStarted from './parts/Part1GettingStarted'
import Part2AnnualCycle from './parts/Part2AnnualCycle'
import Part3AdminPages from './parts/Part3AdminPages'
import Part4Automation from './parts/Part4Automation'
import Part5Troubleshooting from './parts/Part5Troubleshooting'
import Part6SecurityServices from './parts/Part6SecurityServices'
import Part7Checklists from './parts/Part7Checklists'
import Part8Glossary from './parts/Part8Glossary'

interface UserInfo {
  userId: number
  userRoles: string[]
}

interface Props {
  userInfo: UserInfo | null
}

interface NavSection {
  id: string
  icon: React.ElementType
  title: { zh: string; en: string }
  subsections: { id: string; title: { zh: string; en: string } }[]
}

const NAV: NavSection[] = [
  {
    id: 'part-0',
    icon: BookOpen,
    title: { zh: '0. 系统总览', en: '0. System Overview' },
    subsections: [
      { id: 's-0-1', title: { zh: '0.1 CEAL 数据库是什么', en: '0.1 What is CEAL DB' } },
      { id: 's-0-2', title: { zh: '0.2 四种用户角色', en: '0.2 Four User Roles' } },
      { id: 's-0-3', title: { zh: '0.3 一年节奏速览', en: '0.3 Annual Cycle at a Glance' } },
      { id: 's-0-4', title: { zh: '0.4 外部服务关系图', en: '0.4 External Services' } },
    ],
  },
  {
    id: 'part-1',
    icon: Rocket,
    title: { zh: '1. 上手准备', en: '1. Getting Started' },
    subsections: [
      { id: 's-1-1', title: { zh: '1.1 接手时该问什么', en: '1.1 What to Ask the Predecessor' } },
      { id: 's-1-2', title: { zh: '1.2 首次登录', en: '1.2 First Login' } },
      { id: 's-1-3', title: { zh: '1.3 /admin 页面布局', en: '1.3 /admin Page Layout' } },
      { id: 's-1-4', title: { zh: '1.4 关键术语速查', en: '1.4 Key Terminology' } },
    ],
  },
  {
    id: 'part-2',
    icon: Calendar,
    title: { zh: '2. 年度循环（按月份）', en: '2. The Annual Cycle (Month by Month)' },
    subsections: [
      { id: 's-2-1', title: { zh: '2.1 8月-9月：决定日期', en: '2.1 Aug-Sep: Decide Dates' } },
      { id: 's-2-2', title: { zh: '2.2 9月中：设置 Survey Dates', en: '2.2 Mid-Sep: Set Survey Dates' } },
      { id: 's-2-3', title: { zh: '2.3 9月底：审阅邮件模板', en: '2.3 Late Sep: Review Email Templates' } },
      { id: 's-2-4', title: { zh: '2.4 10月1日：自动开表日', en: '2.4 Oct 1: Auto-Opening Day' } },
      { id: 's-2-5', title: { zh: '2.5 10-11月：监控参与', en: '2.5 Oct-Nov: Monitor Participation' } },
      { id: 's-2-6', title: { zh: '2.6 11月底：自动提醒', en: '2.6 Late Nov: Auto Reminder' } },
      { id: 's-2-7', title: { zh: '2.7 12月2日：自动关表日', en: '2.7 Dec 2: Auto-Closing Day' } },
      { id: 's-2-8', title: { zh: '2.8 12月：审核与补救', en: '2.8 December: Review & Patch' } },
      { id: 's-2-9', title: { zh: '2.9 1月：导出报告给 JEAL', en: '2.9 January: Export Reports for JEAL' } },
      { id: 's-2-10', title: { zh: '2.10 2月：上传 JEAL PDF', en: '2.10 February: Upload JEAL PDF' } },
      { id: 's-2-11', title: { zh: '2.11 2-3月：发布年份', en: '2.11 Feb-Mar: Publish the Year' } },
      { id: 's-2-12', title: { zh: '2.12 任意时刻：日常事务', en: '2.12 Year-Round Tasks' } },
    ],
  },
  {
    id: 'part-3',
    icon: LayoutGrid,
    title: { zh: '3. Admin 页面详细说明', en: '3. Admin Pages Detailed Guide' },
    subsections: [
      { id: 's-3-A', title: { zh: '3.A 统计表单 (Statistics Forms)', en: '3.A Statistics Forms' } },
      { id: 's-3-B', title: { zh: '3.B 统计报告 (Statistics Reports)', en: '3.B Statistics Reports' } },
      { id: 's-3-C', title: { zh: '3.C E-Resource 编辑区', en: '3.C E-Resource Editor Section' } },
      { id: 's-3-D', title: { zh: '3.D Super Admin 工具箱', en: '3.D Super Admin Toolkit' } },
    ],
  },
  {
    id: 'part-4',
    icon: Cog,
    title: { zh: '4. 自动化 vs 手动', en: '4. Automation vs Manual' },
    subsections: [
      { id: 's-4-1', title: { zh: '4.1 Vercel Cron 在做什么', en: '4.1 What Vercel Cron Does' } },
      { id: 's-4-2', title: { zh: '4.2 自动的事', en: '4.2 Automated Tasks' } },
      { id: 's-4-3', title: { zh: '4.3 必须手动的事', en: '4.3 Manual Tasks' } },
      { id: 's-4-4', title: { zh: '4.4 半自动的事', en: '4.4 Semi-Manual' } },
      { id: 's-4-5', title: { zh: '4.5 防重复机制', en: '4.5 Duplicate Prevention' } },
    ],
  },
  {
    id: 'part-5',
    icon: LifeBuoy,
    title: { zh: '5. 故障排查手册', en: '5. Troubleshooting Playbook' },
    subsections: [
      { id: 's-5-1', title: { zh: '5.1 用户收不到邮件', en: '5.1 User Did Not Get Email' } },
      { id: 's-5-2', title: { zh: '5.2 密码不对', en: '5.2 Wrong Password' } },
      { id: 's-5-3', title: { zh: '5.3 表单不可用', en: '5.3 Forms Not Available' } },
      { id: 's-5-4', title: { zh: '5.4 关表后还要改', en: '5.4 Edit After Closing' } },
      { id: 's-5-5', title: { zh: '5.5 显示去年数据', en: '5.5 Shows Last Year Data' } },
      { id: 's-5-6', title: { zh: '5.6 广播没发出去', en: '5.6 Broadcast Failed' } },
      { id: 's-5-7', title: { zh: '5.7 Cron 没运行', en: '5.7 Cron Did Not Run' } },
      { id: 's-5-8', title: { zh: '5.8 P2002 序列错误', en: '5.8 P2002 Sequence Error' } },
      { id: 's-5-9', title: { zh: '5.9 数据丢失/异常', en: '5.9 Data Missing / Wrong' } },
      { id: 's-5-10', title: { zh: '5.10 找不到页面', en: '5.10 Cannot Find a Page' } },
    ],
  },
  {
    id: 'part-6',
    icon: ShieldCheck,
    title: { zh: '6. 安全 & 外部服务', en: '6. Security & External Services' },
    subsections: [
      { id: 's-6-1', title: { zh: '6.1 环境变量清单', en: '6.1 Environment Variables' } },
      { id: 's-6-2', title: { zh: '6.2 Resend 邮件服务', en: '6.2 Resend Email Service' } },
      { id: 's-6-3', title: { zh: '6.3 Vercel 托管', en: '6.3 Vercel Hosting' } },
      { id: 's-6-4', title: { zh: '6.4 Neon 数据库', en: '6.4 Neon Database' } },
      { id: 's-6-5', title: { zh: '6.5 域名 cealstats.org', en: '6.5 Domain cealstats.org' } },
      { id: 's-6-6', title: { zh: '6.6 何时联系开发者', en: '6.6 When to Contact Developer' } },
    ],
  },
  {
    id: 'part-7',
    icon: ListChecks,
    title: { zh: '7. 快速检查清单', en: '7. Quick Checklists' },
    subsections: [
      { id: 's-7-1', title: { zh: '7.1 开始前 30 天', en: '7.1 30 Days Before' } },
      { id: 's-7-2', title: { zh: '7.2 开表当天', en: '7.2 Opening Day' } },
      { id: 's-7-3', title: { zh: '7.3 关表后', en: '7.3 After Closing' } },
      { id: 's-7-4', title: { zh: '7.4 JEAL 发布后', en: '7.4 After JEAL Publication' } },
      { id: 's-7-5', title: { zh: '7.5 紧急情况', en: '7.5 Emergencies' } },
    ],
  },
  {
    id: 'part-8',
    icon: FileText,
    title: { zh: '8. 术语表', en: '8. Glossary' },
    subsections: [
      { id: 's-8-1', title: { zh: '8.1 角色与权限', en: '8.1 Roles & Access' } },
      { id: 's-8-2', title: { zh: '8.2 年度循环', en: '8.2 Annual Cycle' } },
      { id: 's-8-3', title: { zh: '8.3 表单与数据', en: '8.3 Forms & Data' } },
      { id: 's-8-4', title: { zh: '8.4 自动化', en: '8.4 Automation' } },
      { id: 's-8-5', title: { zh: '8.5 外部服务', en: '8.5 External Services' } },
      { id: 's-8-6', title: { zh: '8.6 技术 / 基础设施', en: '8.6 Tech / Infrastructure' } },
      { id: 's-8-7', title: { zh: '8.7 人与组织', en: '8.7 People & Organizations' } },
      { id: 's-8-8', title: { zh: '8.8 关键 URL', en: '8.8 Key URLs' } },
    ],
  },
]

const LANG_STORAGE_KEY = 'cealdb-superguide-lang'

export default function SuperGuideClient({ userInfo }: Props) {
  const [lang, setLang] = useState<Lang>('zh')
  const [openSection, setOpenSection] = useState<string | null>('part-0')
  const [searchTerm, setSearchTerm] = useState('')

  // Load saved language preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'zh' || saved === 'en') {
      setLang(saved)
    } else if (typeof navigator !== 'undefined') {
      // Auto-detect: any zh locale → Chinese
      setLang(navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en')
    }
  }, [])

  // Persist language preference
  const switchLang = (next: Lang) => {
    setLang(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    }
  }

  // Filter sidebar based on search
  const filteredNav = useMemo(() => {
    if (!searchTerm.trim()) return NAV
    const q = searchTerm.toLowerCase()
    return NAV.map((sec) => ({
      ...sec,
      subsections: sec.subsections.filter(
        (sub) =>
          sub.title.zh.toLowerCase().includes(q) ||
          sub.title.en.toLowerCase().includes(q),
      ),
    })).filter(
      (sec) =>
        sec.subsections.length > 0 ||
        sec.title.zh.toLowerCase().includes(q) ||
        sec.title.en.toLowerCase().includes(q),
    )
  }, [searchTerm])

  // Highlight active section in sidebar based on scroll position
  const [activeId, setActiveId] = useState<string>('part-0')
  useEffect(() => {
    const allIds = NAV.flatMap((sec) => [sec.id, ...sec.subsections.map((s) => s.id)])
    const handleScroll = () => {
      // Find topmost heading within viewport
      let topId = allIds[0]
      let smallestTop = Number.POSITIVE_INFINITY
      for (const id of allIds) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top >= 0 && rect.top < smallestTop) {
          smallestTop = rect.top
          topId = id
        }
      }
      setActiveId(topId)
      // Auto-expand the matching part
      const part = NAV.find(
        (s) => s.id === topId || s.subsections.some((sub) => sub.id === topId),
      )
      if (part) setOpenSection(part.id)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div
      data-cealdb-guide
      className="min-h-screen bg-gray-50 print:bg-white print:min-h-0"
    >
      {/* Style fixes: override global `main` flex-center rule from globals.css, and print-only rules */}
      <style>{`
        /* Undo globals.css 'main { display:flex; align-items:center; justify-content:center; min-height:80vh }'
           which squashes guide content into a narrow centered column. Scope to the guide via data attribute. */
        [data-cealdb-guide] main {
          display: block !important;
          min-height: 0 !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          margin-bottom: 0 !important;
        }
        @media print {
          @page { margin: 0.5in; }
          html, body { background: #ffffff !important; }
          body > header, body > footer { display: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .border-l-4, details, table { break-inside: avoid; page-break-inside: avoid; }
          h1, h2, h3, h4 { break-after: avoid; page-break-after: avoid; }
        }
      `}</style>

      <Container className="py-6 print:p-0 print:space-y-0">
        {/* Breadcrumb */}
        <div className="mb-4 print:hidden">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon className="w-3 h-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin">Admin</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <SlashIcon className="w-3 h-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {lang === 'zh' ? '超级管理员指南' : 'Super Admin Guide'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {lang === 'zh' ? '超级管理员完整指南' : 'Super Admin Complete Guide'}
            </h1>
            <p className="text-gray-600 max-w-3xl">
              {lang === 'zh'
                ? '一份手把手的运营手册：覆盖一整年的工作节奏、每个 Admin 页面的具体用法、所有自动/手动任务、故障排查、安全设置和检查清单。'
                : 'A complete hand-holding operations manual: covering the full annual cycle, every Admin page in detail, all automated/manual tasks, troubleshooting, security, and printable checklists.'}
            </p>
          </div>

          {/* Language toggle + Print */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="inline-flex rounded-md border bg-white shadow-sm">
              <button
                onClick={() => switchLang('zh')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-l-md transition-colors',
                  lang === 'zh'
                    ? 'bg-red-800 text-white'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Languages className="w-4 h-4" />
                中文
              </button>
              <button
                onClick={() => switchLang('en')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-r-md border-l transition-colors',
                  lang === 'en'
                    ? 'bg-red-800 text-white'
                    : 'text-gray-700 hover:bg-gray-50',
                )}
              >
                <Globe className="w-4 h-4" />
                English
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              {lang === 'zh' ? '打印' : 'Print'}
            </Button>
          </div>
        </div>

        {/* Grid: sidebar + main */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 print:block print:gap-0">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border bg-white shadow-sm print:hidden">
            <div className="p-3 border-b sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  placeholder={lang === 'zh' ? '搜索章节...' : 'Search sections...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700"
                />
              </div>
            </div>
            <nav className="p-2 text-sm">
              {filteredNav.map((sec) => {
                const Icon = sec.icon
                const isOpen = openSection === sec.id
                return (
                  <div key={sec.id} className="mb-1">
                    <button
                      onClick={() => {
                        setOpenSection(isOpen ? null : sec.id)
                        document
                          .getElementById(sec.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left font-medium transition-colors',
                        activeId === sec.id ||
                          sec.subsections.some((s) => s.id === activeId)
                          ? 'bg-red-50 text-red-900'
                          : 'text-gray-700 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">
                        {lang === 'zh' ? sec.title.zh : sec.title.en}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && sec.subsections.length > 0 && (
                      <ul className="ml-6 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                        {sec.subsections.map((sub) => (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              onClick={(e) => {
                                e.preventDefault()
                                document
                                  .getElementById(sub.id)
                                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              }}
                              className={cn(
                                'block px-2 py-1 rounded text-xs transition-colors',
                                activeId === sub.id
                                  ? 'bg-red-100 text-red-900 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-100',
                              )}
                            >
                              {lang === 'zh' ? sub.title.zh : sub.title.en}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="bg-white rounded-lg border shadow-sm p-6 lg:p-10 max-w-none print:p-0 print:border-0 print:shadow-none">
            <section id="part-0" className="scroll-mt-24">
              <Part0Overview lang={lang} />
            </section>
            <section id="part-1" className="scroll-mt-24 mt-16">
              <Part1GettingStarted lang={lang} />
            </section>
            <section id="part-2" className="scroll-mt-24 mt-16">
              <Part2AnnualCycle lang={lang} />
            </section>
            <section id="part-3" className="scroll-mt-24 mt-16">
              <Part3AdminPages lang={lang} />
            </section>
            <section id="part-4" className="scroll-mt-24 mt-16">
              <Part4Automation lang={lang} />
            </section>
            <section id="part-5" className="scroll-mt-24 mt-16">
              <Part5Troubleshooting lang={lang} />
            </section>
            <section id="part-6" className="scroll-mt-24 mt-16">
              <Part6SecurityServices lang={lang} />
            </section>
            <section id="part-7" className="scroll-mt-24 mt-16">
              <Part7Checklists lang={lang} />
            </section>
            <section id="part-8" className="scroll-mt-24 mt-16">
              <Part8Glossary lang={lang} />
            </section>

            {/* Footer */}
            <div className="mt-20 pt-6 border-t text-center text-xs text-gray-500 print:hidden">
              {lang === 'zh' ? (
                <>
                  本指南随系统更新而同步修订。如发现内容与实际行为不一致，请联系开发者
                  Meng Qu (<a className="underline" href="mailto:qum@miamioh.edu">qum@miamioh.edu</a>，Miami University Web Service Librarian)。
                </>
              ) : (
                <>
                  This guide is updated together with the system. If anything diverges from
                  actual behavior, contact developer Meng Qu (
                  <a className="underline" href="mailto:qum@miamioh.edu">qum@miamioh.edu</a>, Miami University Web Service Librarian).
                </>
              )}
            </div>
          </main>
        </div>
      </Container>
    </div>
  )
}
