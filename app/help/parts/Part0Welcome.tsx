'use client'

import React from 'react'
import {
  PartProps,
  SectionH2,
  SectionH3,
  P,
  Callout,
  Code,
  PageLink,
} from './_shared'

export default function Part0Welcome({ lang }: PartProps) {
  return (
    <div>
      <SectionH2
        id="part-0"
        lang={lang}
        zh="第 0 部分 · 欢迎使用 CEAL 统计数据库"
        en="Part 0 · Welcome to the CEAL Statistics Database"
      />
      <P
        lang={lang}
        zh="如果你是第一次接触这个系统，先把这一部分读完——它能让你大致明白：这个网站是干什么的、你的角色是什么、一年里要做哪些事、遇到问题怎么找人帮忙。后面几部分会更细。"
        en="If this is your first time here, read this part first — it gives you the big picture: what the site does, what your role is, what you'll do each year, and how to get help when something goes wrong. The later parts go into detail."
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '我们图书馆还不是 CEAL 成员，怎么加入？',
          en: 'My library is not yet a CEAL member — how to join?',
        }}
      >
        {lang === 'zh' ? (
          <>
            新机构需要先建立账号才能加入数据库。请联系{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>{' '}
            填一份 <strong>Library Information Form</strong>——这份表是申请
            加入 CEAL 年度统计调查的入口。Committee 收到后会建账号，并把
            登录信息发到你的工作邮箱。
          </>
        ) : (
          <>
            New institutions need an account before they can join the database.
            Contact the{' '}
            <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
              CEAL Statistics Committee
            </PageLink>{' '}
            to complete a <strong>Library Information Form</strong> — this is
            the entry point to join the CEAL annual statistics survey. Once
            received, the Committee will create your account and send login
            info to your work email.
          </>
        )}
      </Callout>

      {/* ---------- 0.1 ---------- */}
      <SectionH3
        id="s-0-1"
        lang={lang}
        zh="0.1 这是个什么系统"
        en="0.1 What is this system"
      />
      <P
        lang={lang}
        zh={
          <>
            <strong>CEAL Statistics Database</strong>（{' '}
            <Code>cealstats.org</Code> ）是北美东亚图书馆理事会（CEAL，Council on East
            Asian Libraries）每年收集成员图书馆统计数据的官方平台。每年 10 月开放，
            12 月初截止；提交的数据汇总后会在 2 月的{' '}
            <strong>JEAL（Journal of East Asian Libraries）</strong>
            发表，并对公众开放查询。
          </>
        }
        en={
          <>
            The <strong>CEAL Statistics Database</strong> (
            <Code>cealstats.org</Code>) is the official platform that the
            Council on East Asian Libraries (CEAL) uses every year to collect
            statistics from its member libraries. Forms open in October and
            close in early December; the submitted data is published in the{' '}
            <strong>Journal of East Asian Libraries (JEAL)</strong> in February
            and made publicly searchable.
          </>
        }
      />

      <Callout
        type="info"
        lang={lang}
        title={{
          zh: '一句话总结',
          en: 'In one sentence',
        }}
      >
        {lang === 'zh'
          ? '你每年用这个网站填 10 张表，把你机构的馆藏、经费、人员、服务数字告诉 CEAL，CEAL 汇总后发表给全行业看。'
          : 'Each year you fill in 10 forms here, telling CEAL your library\'s collection, budget, staff, and service numbers — CEAL then aggregates and publishes them for the whole field.'}
      </Callout>

      {/* ---------- 0.2 ---------- */}
      <SectionH3
        id="s-0-2"
        lang={lang}
        zh="0.2 你的角色：Member Institution（成员机构联系人）"
        en="0.2 Your role: Member Institution Contact"
      />
      <P
        lang={lang}
        zh={
          <>
            登录后系统认你为 <strong>Member Institution（成员机构）</strong> 用户。
            你<strong>只能</strong>看见和编辑<strong>自己机构</strong>的表单和数据，
            看不到其他机构的明细。每家机构一般有 1–3 个这样的账号（馆长 +
            统计专员等）。
          </>
        }
        en={
          <>
            Once you log in, the system recognizes you as a{' '}
            <strong>Member Institution</strong> user. You can <strong>only</strong>{' '}
            view and edit <strong>your own library's</strong> forms and data; you cannot see other institutions' details. Each library typically has 1–3 of these accounts (e.g. director + statistics coordinator).
          </>
        }
      />

      <Callout
        type="tip"
        lang={lang}
        title={{
          zh: '你能做什么 / 不能做什么',
          en: 'What you can / cannot do',
        }}
      >
        <ul className="list-disc list-inside space-y-1 mt-1">
          {lang === 'zh' ? (
            <>
              <li>✅ 填写、保存草稿、提交 10 张本机构表单</li>
              <li>✅ 导入上一年本机构的数据作为起点</li>
              <li>✅ 查看本机构本年/历年数据，下载本机构的 PDF 报告</li>
              <li>✅ 浏览主页上已发表（is_published）的所有机构汇总数据</li>
              <li>❌ 修改其他机构的数据</li>
              <li>❌ 在表单关闭后再修改（需联系 CEAL Statistics Committee）</li>
              <li>❌ 调整开关表日期、广播邮件、用户账号</li>
            </>
          ) : (
            <>
              <li>✅ Fill, save draft, and submit the 10 forms for your library</li>
              <li>✅ Import last year's data for your library as a starting point</li>
              <li>✅ View this year + historical data for your library; download your PDF report</li>
              <li>✅ Browse already-published aggregated data on the public homepage</li>
              <li>❌ Edit other libraries' data</li>
              <li>❌ Edit after forms close (must contact CEAL Statistics Committee)</li>
              <li>❌ Adjust open/close dates, broadcast emails, or user accounts</li>
            </>
          )}
        </ul>
      </Callout>

      {/* ---------- 0.3 ---------- */}
      <SectionH3
        id="s-0-3"
        lang={lang}
        zh="0.3 一年里你要做什么"
        en="0.3 What you'll do each year"
      />
      <P
        lang={lang}
        zh="对一个普通成员机构联系人来说，一整年的工作非常简单：基本上集中在 10–12 月的 2 个月里。"
        en="For a typical member-institution contact, the whole year is simple: most of the work happens in the 2 months between October and early December."
      />

      <ol className="list-decimal list-inside space-y-2 my-4 text-sm text-gray-800">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>10 月 1 日左右</strong>：收到 CEAL 发的 “Forms are open”
              邮件 → 登录网站。
            </li>
            <li>
              <strong>10 月–11 月</strong>：花几天时间收集本机构数据，分次填完 10
              张表，可<strong>随时存草稿</strong>。
            </li>
            <li>
              <strong>11 月底</strong>：收到提醒邮件 → 复查、提交。
            </li>
            <li>
              <strong>12 月 2 日</strong>：表单自动关闭，过了这天就不能改了。
            </li>
            <li>
              <strong>2 月</strong>：JEAL 发表年度报告 → 主页就能看到本年度
              所有机构的汇总数据。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Around October 1</strong>: receive the “Forms are open”
              email from CEAL → log in.
            </li>
            <li>
              <strong>October–November</strong>: spend a few days gathering
              data, fill the 10 forms over multiple sittings. You can{' '}
              <strong>save drafts anytime</strong>.
            </li>
            <li>
              <strong>Late November</strong>: receive a reminder email → review
              and submit.
            </li>
            <li>
              <strong>December 2</strong>: forms close automatically; after that
              you can no longer edit.
            </li>
            <li>
              <strong>February</strong>: JEAL publishes the annual report → the
              homepage will show aggregated data from all institutions for the
              year.
            </li>
          </>
        )}
      </ol>

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '估计要花多少时间',
          en: 'How much time it takes',
        }}
      >
        {lang === 'zh'
          ? '如果数据都齐了，10 张表大概 2–3 小时能填完。难点不在填表，而在前面收集数据（财政年度数字、人员表、ILL 统计等需要跨部门去找）。建议 10 月 1 日就开始动手，不要拖到 11 月底。'
          : 'If your data is ready, the 10 forms take roughly 2–3 hours total. The hard part is not the typing — it\'s collecting numbers across departments (fiscal year totals, personnel headcounts, ILL stats, etc.). Start on October 1; don\'t wait until late November.'}
      </Callout>

      {/* ---------- 0.4 ---------- */}
      <SectionH3
        id="s-0-4"
        lang={lang}
        zh="0.4 遇到问题找谁帮忙"
        en="0.4 Where to get help when stuck"
      />

      <P
        lang={lang}
        zh="任何时候卡住、有疑问、数据不对、邮件没收到，按这个顺序找帮助："
        en="Whenever you get stuck, are unsure, see wrong data, or didn't receive an email — try help in this order:"
      />

      <ol className="list-decimal list-inside space-y-2 my-4 text-sm text-gray-800">
        {lang === 'zh' ? (
          <>
            <li>
              <strong>先翻这本指南</strong>：用浏览器 Ctrl/Cmd + F 搜关键词，
              第 5 部分（故障排查）和第 7 部分（FAQ）专门解决你遇到的问题。
            </li>
            <li>
              <strong>问机构内的前任 / 同事</strong>：去年是谁填的？他/她最
              清楚哪个数字从哪儿来。
            </li>
            <li>
              <strong>联系 CEAL Statistics Committee</strong>：通过{' '}
              <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
                eastasianlib.org/newsite/statistics
              </PageLink>{' '}
              找到当年统计委员会的联系方式。他们会处理：账号问题、补救
              超期提交、数据修正等。
            </li>
          </>
        ) : (
          <>
            <li>
              <strong>Search this guide first</strong>: use Ctrl/Cmd + F to find
              keywords. Part 5 (Troubleshooting) and Part 7 (FAQ) cover the
              issues you're most likely to hit.
            </li>
            <li>
              <strong>Ask your predecessor / colleague</strong>: who filled it
              last year? They know best where each number comes from.
            </li>
            <li>
              <strong>Contact the CEAL Statistics Committee</strong>: find this
              year's committee at{' '}
              <PageLink href="https://www.eastasianlib.org/newsite/statistics/">
                eastasianlib.org/newsite/statistics
              </PageLink>
              . They handle account issues, late-submission rescue, data
              corrections, etc.
            </li>
          </>
        )}
      </ol>

      <Callout
        type="success"
        lang={lang}
        title={{
          zh: '小结',
          en: 'Summary',
        }}
      >
        {lang === 'zh' ? (
          <>
            读完第 0 部分你已经知道：① 这是 CEAL 的年度统计平台；② 你只管自己
            机构的数据；③ 一年的工作集中在 10–12 月；④ 卡住了先翻指南，找
            不到答案就联系 Committee。
            <br />
            <br />
            接下来 <PageLink href="#part-1">第 1 部分（上手准备）</PageLink>{' '}
            告诉你怎么登录账号。
          </>
        ) : (
          <>
            After Part 0 you know: (1) this is CEAL's annual statistics
            platform; (2) you only handle your own library's data; (3) the work
            sits in Oct–Dec; (4) when stuck, search this guide first, then
            contact the Committee.
            <br />
            <br />
            Next:{' '}
            <PageLink href="#part-1">Part 1 (Getting Started)</PageLink> shows
            you how to log in.
          </>
        )}
      </Callout>
    </div>
  )
}
