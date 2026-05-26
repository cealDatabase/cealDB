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
  ClipboardList,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Printer,
  Rocket,
  Search,
  SlashIcon,
} from 'lucide-react'

import type { Lang } from './parts/_shared'
import Part0Welcome from './parts/Part0Welcome'
import Part1GettingStarted from './parts/Part1GettingStarted'
import Part2AnnualTimeline from './parts/Part2AnnualTimeline'
import Part3Forms from './parts/Part3Forms'
import Part4CommonTasks from './parts/Part4CommonTasks'
import Part5Troubleshooting from './parts/Part5Troubleshooting'
import Part6Checklists from './parts/Part6Checklists'
import Part7FAQ from './parts/Part7FAQ'

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
    title: { zh: '0. 欢迎', en: '0. Welcome' },
    subsections: [
      { id: 's-0-1', title: { zh: '0.1 这是个什么系统', en: '0.1 What is this system' } },
      { id: 's-0-2', title: { zh: '0.2 你的角色', en: '0.2 Your role' } },
      { id: 's-0-3', title: { zh: '0.3 一年要做什么', en: '0.3 What you do each year' } },
      { id: 's-0-4', title: { zh: '0.4 怎么找人帮忙', en: '0.4 Where to get help' } },
    ],
  },
  {
    id: 'part-1',
    icon: Rocket,
    title: { zh: '1. 上手准备', en: '1. Getting Started' },
    subsections: [
      { id: 's-1-1', title: { zh: '1.1 第一次登录', en: '1.1 First-time login' } },
      { id: 's-1-2', title: { zh: '1.2 忘记密码', en: '1.2 Forgot password' } },
      { id: 's-1-3', title: { zh: '1.3 你的 Dashboard', en: '1.3 Your dashboard' } },
      { id: 's-1-4', title: { zh: '1.4 表单页面布局', en: '1.4 Form page layout' } },
    ],
  },
  {
    id: 'part-2',
    icon: Calendar,
    title: { zh: '2. 年度时间表', en: '2. Annual Timeline' },
    subsections: [
      { id: 's-2-1', title: { zh: '2.1 关键日期一览', en: '2.1 Key dates at a glance' } },
      { id: 's-2-2', title: { zh: '2.2 10 月 1 日：开表日', en: '2.2 Oct 1: Opening Day' } },
      { id: 's-2-3', title: { zh: '2.3 10–11 月：填表阶段', en: '2.3 Oct–Nov: Filling Period' } },
      { id: 's-2-4', title: { zh: '2.4 11 月底：提醒邮件', en: '2.4 Late Nov: Reminder' } },
      { id: 's-2-5', title: { zh: '2.5 12 月 2 日：截止日', en: '2.5 Dec 2: Deadline' } },
      { id: 's-2-6', title: { zh: '2.6 2–3 月：报告发表', en: '2.6 Feb–Mar: Report Published' } },
    ],
  },
  {
    id: 'part-3',
    icon: LayoutGrid,
    title: { zh: '3. 10 张表详细说明', en: '3. The 10 Forms Explained' },
    subsections: [
      { id: 's-3-A', title: { zh: '3.A 馆藏统计 (5 张)', en: '3.A Collection Statistics (5)' } },
      { id: 's-3-B', title: { zh: '3.B 财政与人员 (2 张)', en: '3.B Fiscal & Personnel (2)' } },
      { id: 's-3-C', title: { zh: '3.C 公共服务 (1 张)', en: '3.C Public Services (1)' } },
      { id: 's-3-D', title: { zh: '3.D 电子资源 (2 张)', en: '3.D Electronic Resources (2)' } },
    ],
  },
  {
    id: 'part-4',
    icon: ClipboardList,
    title: { zh: '4. 常见操作', en: '4. Common Tasks' },
    subsections: [
      { id: 's-4-1', title: { zh: '4.1 保存草稿 vs 提交', en: '4.1 Save Draft vs Submit' } },
      { id: 's-4-2', title: { zh: '4.2 导入上一年数据', en: '4.2 Import last year data' } },
      { id: 's-4-3', title: { zh: '4.3 查看自己机构的数据', en: '4.3 View your data' } },
      { id: 's-4-4', title: { zh: '4.4 修改已提交的表', en: '4.4 Edit a submitted form' } },
      { id: 's-4-5', title: { zh: '4.5 导出 PDF 报告', en: '4.5 Export PDF report' } },
    ],
  },
  {
    id: 'part-5',
    icon: LifeBuoy,
    title: { zh: '5. 故障排查', en: '5. Troubleshooting' },
    subsections: [
      { id: 's-5-1', title: { zh: '5.1 收不到登录邮件', en: '5.1 Login email not received' } },
      { id: 's-5-2', title: { zh: '5.2 密码不对', en: '5.2 Wrong password' } },
      { id: 's-5-3', title: { zh: '5.3 按钮灰色不能点', en: '5.3 Buttons greyed out' } },
      { id: 's-5-4', title: { zh: '5.4 显示去年的数据', en: '5.4 Shows last year data' } },
      { id: 's-5-5', title: { zh: '5.5 数字保存不上去', en: '5.5 Numbers won\'t save' } },
      { id: 's-5-6', title: { zh: '5.6 找不到机构成员', en: '5.6 Cannot find a colleague' } },
    ],
  },
  {
    id: 'part-6',
    icon: ListChecks,
    title: { zh: '6. 检查清单', en: '6. Checklists' },
    subsections: [
      { id: 's-6-1', title: { zh: '6.1 开表前准备清单', en: '6.1 Before opening day' } },
      { id: 's-6-2', title: { zh: '6.2 提交前自查清单', en: '6.2 Pre-submit checklist' } },
      { id: 's-6-3', title: { zh: '6.3 关表后核对清单', en: '6.3 After closing' } },
    ],
  },
  {
    id: 'part-7',
    icon: HelpCircle,
    title: { zh: '7. 常见问题 + 术语表', en: '7. FAQ + Glossary' },
    subsections: [
      { id: 's-7-1', title: { zh: '7.1 常见问题 FAQ', en: '7.1 Frequently Asked Questions' } },
      { id: 's-7-2', title: { zh: '7.2 术语表', en: '7.2 Glossary' } },
    ],
  },
]

const LANG_STORAGE_KEY = 'cealdb-memberguide-lang'

export default function MemberGuideClient() {
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
      setLang(navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en')
    }
  }, [])

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

  // Expand all <details> (FAQ accordions) when the user prints, restore after.
  useEffect(() => {
    const onBeforePrint = () => {
      document
        .querySelectorAll<HTMLDetailsElement>('details')
        .forEach((d) => {
          d.dataset.printPrevOpen = d.open ? '1' : '0'
          d.open = true
        })
    }
    const onAfterPrint = () => {
      document
        .querySelectorAll<HTMLDetailsElement>('details')
        .forEach((d) => {
          if (d.dataset.printPrevOpen === '0') d.open = false
          delete d.dataset.printPrevOpen
        })
    }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('afterprint', onAfterPrint)
    }
  }, [])

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
          /* Keep cards from breaking awkwardly */
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
                <BreadcrumbPage>
                  {lang === 'zh' ? '帮助 / 用户指南' : 'Help / User Guide'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {lang === 'zh' ? '成员机构使用指南' : 'Member Institution Guide'}
            </h1>
            <p className="text-gray-600 max-w-3xl">
              {lang === 'zh'
                ? '一份给成员机构联系人的完整使用手册：登录、填表、提交、查看报告，以及遇到问题怎么办。'
                : 'A complete manual for member-institution contacts: how to log in, fill the forms, submit, view reports, and what to do when something goes wrong.'}
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
                    ? 'bg-emerald-700 text-white'
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
                    ? 'bg-emerald-700 text-white'
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

        {/* Quick PDF download (preserved from old /help page) */}
        <div className="mb-8 print:hidden">
          <Link
            href="/docs/user-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors group max-w-md no-underline"
          >
            <FileText className="w-5 h-5 text-emerald-700" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900">
                {lang === 'zh' ? '基础版 User Guide PDF' : 'Basic User Guide (PDF)'}
              </p>
              <p className="text-sm text-emerald-700">
                {lang === 'zh'
                  ? '想要快速查阅？下载一页式 PDF 速查'
                  : 'Need a quick reference? Download the one-page PDF'}
              </p>
            </div>
            <Download className="w-5 h-5 text-emerald-700 group-hover:translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid: sidebar + main */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 print:block print:gap-0">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border bg-white shadow-sm print:hidden">
            <div className="p-3 border-b sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === 'zh' ? '搜索章节...' : 'Search sections...'}
                  className="w-full pl-8 pr-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
            <nav className="p-2">
              {filteredNav.map((section) => {
                const Icon = section.icon
                const isOpen = openSection === section.id
                const isActiveSection =
                  activeId === section.id ||
                  section.subsections.some((s) => s.id === activeId)
                return (
                  <div key={section.id} className="mb-1">
                    <button
                      onClick={() =>
                        setOpenSection(isOpen ? null : section.id)
                      }
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded hover:bg-gray-100 transition-colors text-left',
                        isActiveSection && 'bg-emerald-50 text-emerald-800',
                      )}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 truncate">
                        {lang === 'zh' ? section.title.zh : section.title.en}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && section.subsections.length > 0 && (
                      <ul className="ml-6 mt-1 mb-2 space-y-0.5">
                        {section.subsections.map((sub) => (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              className={cn(
                                'block px-2 py-1 text-xs rounded hover:bg-gray-100 text-gray-600',
                                activeId === sub.id &&
                                  'bg-emerald-100 text-emerald-800 font-medium',
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
          <main className="bg-white rounded-lg border shadow-sm p-6 md:p-8 print:shadow-none print:border-0 print:p-0">
            <section id="part-0" className="scroll-mt-24">
              <Part0Welcome lang={lang} />
            </section>
            <section id="part-1" className="scroll-mt-24 mt-16">
              <Part1GettingStarted lang={lang} />
            </section>
            <section id="part-2" className="scroll-mt-24 mt-16">
              <Part2AnnualTimeline lang={lang} />
            </section>
            <section id="part-3" className="scroll-mt-24 mt-16">
              <Part3Forms lang={lang} />
            </section>
            <section id="part-4" className="scroll-mt-24 mt-16">
              <Part4CommonTasks lang={lang} />
            </section>
            <section id="part-5" className="scroll-mt-24 mt-16">
              <Part5Troubleshooting lang={lang} />
            </section>
            <section id="part-6" className="scroll-mt-24 mt-16">
              <Part6Checklists lang={lang} />
            </section>
            <section id="part-7" className="scroll-mt-24 mt-16">
              <Part7FAQ lang={lang} />
            </section>

            {/* Footer */}
            <div className="mt-20 pt-6 border-t text-center text-xs text-gray-500 print:hidden">
              {lang === 'zh' ? (
                <>
                  本指南随系统更新而同步修订。如有任何疑问，请联系{' '}
                  <a
                    className="underline text-emerald-700"
                    href="https://www.eastasianlib.org/newsite/statistics/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CEAL Statistics Committee
                  </a>
                  。
                </>
              ) : (
                <>
                  This guide is updated together with the system. For any
                  questions, please contact the{' '}
                  <a
                    className="underline text-emerald-700"
                    href="https://www.eastasianlib.org/newsite/statistics/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CEAL Statistics Committee
                  </a>
                  .
                </>
              )}
            </div>
          </main>
        </div>
      </Container>
    </div>
  )
}
