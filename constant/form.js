const currentYear = new Date().getFullYear();
const previousYear = currentYear - 1;
const nextYear = currentYear + 1;

import {
  Database,
  Users,
  BookOpen,
  Settings,
  Plus,
  CheckCircle,
  BarChart3,
} from "lucide-react";

export const forms = [
  {
    title: "Monographic Acquisitions",
    href: "monographic",
  },
  {
    title: "Physical Volume Holdings",
    href: "volumeHoldings",
  },
  {
    title: "Serial Titles: Purchased and Non-Purchased",
    href: "serials",
  },
  {
    title: "Holdings of Other Materials",
    href: "otherHoldings",
  },
  {
    title: "Unprocessed BackLog Materials (volumes or pieces)",
    href: "unprocessed",
  },
  {
    title: "Fiscal Support",
    href: "fiscal",
  },
  {
    title: "Personnel Support",
    href: "personnel",
  },
  {
    title: "Public Services",
    href: "public-services",
  },
  {
    title: "Electronic",
    href: "electronic",
  },
  {
    title: "Electronic Books",
    href: "electronicBooks",
  },
];

export const instructionGroup = {
  "Survey Time Frame and Publication": [
    {
      question: "Input/Edit Time Frame",
      answer: `The ${currentYear} Online Survey input/edit time frame is from October 1 through December 1, ${currentYear} (11:59 pm Central Time)`,
    },
    {
      question: "Publication Date",
      answer: `The ${currentYear} CEAL annual statistics will be published in the February ${currentYear} online issue of the <i>Journal of East Asian Libraries</i>.`,
    },
  ],
  "Core Guidelines for Completing the Forms": [
    {
      question:
        "What are the definitions of the statistical categories based on?",
      answer:
        "The definitions of the statistical categories used in this questionnaire are based on <i><a href='https://groups.niso.org/higherlogic/ws/public/download/11283/Z39-7-2013_metrics.pdf?utm_source=chatgpt.com' target='_blank'>Information Services and Use: Metrics & Statistics for Libraries and Information Providers — Data Dictionary NISO Z39.7 (2013)</a></i>",
    },
    {
      question: "Reporting period",
      answer: `This questionnaire assumes a fiscal year from July 1, ${previousYear} to June 30, ${currentYear}.`,
    },
    {
      question: "How should numerical figures be entered?",
      answer:
        "Use whole numbers only unless otherwise instructed. Round to the nearest whole number. For entries requiring decimals, follow instructions for that field.",
    },
    {
      question: 'What does the term "Non-CJK items" refer to in this survey?',
      answer: `“Non-CJK” = non-CJK language materials on East Asia.`,
    },
    {
      question: "How should currency be reported?",
      answer: "All currencies should be converted to US dollars.",
    },
    {
      question:
        "Should a combined report be submitted for all branches of a library?",
      answer:
        "Please cooperate with all branch libraries in preparing the combined report. Submit one combined report per institution (except law libraries).",
    },
    {
      question:
        "What should I do if an entry in the questionnaire is zero or none?",
      answer: "Enter 0 if a category has no data.",
    },
    {
      question: "Can explanatory footnotes be included?",
      answer:
        "Yes, libraries are encouraged to include explanatory footnotes to clarify the figures submitted.",
    },
    {
      question:
        "What should be done if there are large difference in reported data compared to the previous year?",
      answer:
        "Explain large year-to-year data changes in the footnote section. Footnotes will be published alongside your data.",
    },
  ],
  "Accessing the CEAL Statistics Database": [
    {
      question: "How do institutions access the CEAL Statistics Database?",
      answer: "Complete the survey online at <a href='https://www.cealstats.org' target='_blank'>www.cealstats.org</a> (login required)."
    },
    {
      question: "I am an institutional contact person. How do I log in?",
      answer:
        "User ID: your registered email address. Password: use your existing password or request one via “Forgot Password”.",
    },
    {
      question: "What happens if I use the 'Forgot Password' process?",
      answer:
        "A system-assigned password will be emailed to you with the subject line 'CEAL Statistics Database.' Statistics Committee members cannot provide passwords, so you must follow the process to get the system-generated password.",
    },
    {
      question: "Can the Statistics Committee members supply a password?",
      answer:
        "No, passwords must be obtained through the system-generated process, and the committee cannot supply passwords.",
    },
    {
      question: "Can I change password after logging into the database?",
      answer:
        "Yes, after logging in, you may change your password under “Change Password”.",
    },
  ],
  "New Library Participation": [
    {
      question:
        "How can new library member establish accounts to participate in CEAL statistics?",
      answer:
        "New member libraries should email <a href='https://www.eastasianlib.org/newsite/statistics/'>the Chair of CEAL Statistics Committee</a> to request an account.",
    },
  ],
};

export const actions = [
    {
      title: 'Super Admin Guide',
      href: '/admin/superguide',
      icon: BookOpen,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      description: 'Comprehensive documentation and best practices for system administration.',
    },
    {
      title: 'Audio/Visual Databases',
      href: `/admin/survey/avdb/${currentYear}`,
      icon: Database,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
      description: 'Manage multimedia resources and database configurations.',
    },
    {
      title: 'Custom Fields for Other Holdings',
      href: '/admin/custom-other',
      icon: Settings,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      description: 'Configure custom metadata fields for specialized collections.',
    },
    {
      title: 'Ebook Databases',
      href: `/admin/survey/ebook/${currentYear}`,
      icon: BookOpen,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      description: 'Manage electronic book collections and access settings.',
    },
    {
      title: 'All New Users/Check All Users',
      href: '/admin/all-users',
      icon: Users,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      description: 'Review new user registrations and manage user accounts.',
    },
    {
      title: 'E-Journal Databases',
      href: `/admin/survey/ejournal/${currentYear}`,
      icon: BarChart3,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      description: 'Monitor and manage electronic journal subscriptions.',
    },
    {
      title: 'Add New Library/Check All Libraries',
      href: '/admin/all-libraries',
      icon: Plus,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      description: 'Add new institutions and manage library network.',
    },
    {
      title: 'Additional Tools',
      href: '/admin/help',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      description: 'Additional administrative tools and system utilities.',
    },
  ]