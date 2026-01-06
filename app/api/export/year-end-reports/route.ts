import { NextRequest, NextResponse } from 'next/server';
import { ExcelExporter, formFieldMappings, getNestedValue } from '@/lib/excelExporter';
import { cookies } from 'next/headers';
import db from '@/lib/db';

const prisma = db;

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('uinf')?.value;
    const roleData = cookieStore.get('role')?.value;

    if (!userEmail || !roleData) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Role-based access control: Super Admin (1) OR E-Resource Editor (3)
    let userRoles: string[] = [];
    try {
      userRoles = JSON.parse(roleData);
    } catch {
      userRoles = [roleData]; // Handle single role string
    }

    const hasAccess = userRoles.includes('1') || userRoles.includes('3');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin or E-Resource Editor role required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const formType = searchParams.get('formType');

    if (!year) {
      return NextResponse.json(
        { error: 'Year parameter is required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year);

    // If formType is 'all', export all forms in a single workbook
    if (formType === 'all') {
      return await exportAllForms(yearNum);
    }

    // Export single form
    if (!formType) {
      return NextResponse.json(
        { error: 'Form type parameter is required' },
        { status: 400 }
      );
    }

    return await exportSingleForm(formType, yearNum);
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function exportSingleForm(formType: string, year: number) {
  const exporter = new ExcelExporter();
  
  let data: any[] = [];
  let title = '';
  let fullTitle = '';
  let fieldMapping: any = {};
  let groupedHeaders: { label: string; colspan: number }[] = [];

  switch (formType) {
    case 'monographic':
      title = '1_Monographs';
      fullTitle = 'Acquisitions of East Asian Materials';
      fieldMapping = formFieldMappings.monographic;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Titles', colspan: 5 },
        { label: 'Purchased Volumes', colspan: 5 },
        { label: 'Non-Purchased Titles', colspan: 5 },
        { label: 'Non-Purchased Volumes', colspan: 5 },
        { label: 'Total Titles', colspan: 1 },
        { label: 'Total Volumes', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.monographic_Acquisitions.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'volumeHoldings':
      title = '2_VolumeHoldings';
      fullTitle = 'Physical Volume Holdings';
      fieldMapping = formFieldMappings.volumeHoldings;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Previous Year Total', colspan: 5 },
        { label: 'Added (Gross)', colspan: 5 },
        { label: 'Withdrawn', colspan: 5 },
        { label: 'Grand Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.volume_Holdings.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'serials':
      title = '3_Serials';
      fullTitle = 'Current Serials (Print and Electronic)';
      fieldMapping = formFieldMappings.serials;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased', colspan: 5 },
        { label: 'Non-Purchased', colspan: 5 },
        { label: 'Total', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.serials.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'otherHoldings':
      title = '4_OtherHoldings';
      fullTitle = 'Holdings of Other Materials';
      fieldMapping = formFieldMappings.otherHoldings;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Audio', colspan: 5 },
        { label: 'Film', colspan: 5 },
        { label: 'Microform', colspan: 5 },
        { label: 'CD-ROM', colspan: 5 },
        { label: 'DVD', colspan: 5 },
        { label: 'Grand Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.other_Holdings.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'unprocessed':
      title = '5_GrandTotalHolding';
      fullTitle = 'Unprocessed Backlog Materials';
      fieldMapping = formFieldMappings.unprocessed;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Backlog', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.unprocessed_Backlog_Materials.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'fiscal':
      title = '6_FiscalAppropriations';
      fullTitle = 'Fiscal Support for East Asian Collections';
      fieldMapping = formFieldMappings.fiscal;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'CHN Appropriations', colspan: 5 },
        { label: 'JPN Appropriations', colspan: 5 },
        { label: 'KOR Appropriations', colspan: 5 },
        { label: 'N-CJK Appropriations', colspan: 5 },
        { label: 'Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.fiscal_Support.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'personnel':
      title = '7_PersonnelSupport';
      fullTitle = 'Personnel Support for East Asian Collections';
      fieldMapping = formFieldMappings.personnel;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Professional', colspan: 5 },
        { label: 'Support Staff', colspan: 5 },
        { label: 'Student Assistants', colspan: 5 },
        { label: 'Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.personnel_Support.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'publicServices':
      title = '8_PublicServices';
      fullTitle = 'Public Services';
      fieldMapping = formFieldMappings.publicServices;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Presentations', colspan: 5 },
        { label: 'Reference Transactions', colspan: 5 },
        { label: 'Participants', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.public_Services.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'electronic':
      title = '9_Electronic';
      fullTitle = 'Electronic Resources';
      fieldMapping = formFieldMappings.electronic;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Full-text Titles', colspan: 5 },
        { label: 'Aggregated DBs', colspan: 1 },
        { label: 'E-Journals', colspan: 1 },
        { label: 'E-Books', colspan: 1 },
        { label: 'Total Expenditure', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.electronic.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    case 'electronicBooks':
      title = '10_ElectronicBooks';
      fullTitle = 'Electronic Books Statistics';
      fieldMapping = formFieldMappings.electronicBooks;
      groupedHeaders = [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Volumes', colspan: 5 },
        { label: 'Purchased Titles', colspan: 5 },
        { label: 'Subscription Volumes', colspan: 5 },
        { label: 'Subscription Titles', colspan: 5 },
        { label: 'Total Volumes', colspan: 1 },
        { label: 'Total Titles', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ];
      data = await prisma.electronic_Books.findMany({
        where: {
          Library_Year: {
            year: year
          }
        },
        include: {
          Library_Year: {
            include: {
              Library: true
            }
          }
        },
        orderBy: {
          Library_Year: {
            Library: {
              library_name: 'asc'
            }
          }
        }
      });
      break;

    default:
      return NextResponse.json(
        { error: 'Invalid form type' },
        { status: 400 }
      );
  }

  if (data.length === 0) {
    return NextResponse.json(
      { error: 'No data found for the specified year' },
      { status: 404 }
    );
  }

  // Transform data to include nested values
  const transformedData = data.map(record => {
    const transformed: any = {};
    Object.keys(fieldMapping).forEach(field => {
      transformed[field] = getNestedValue(record, field);
    });
    return transformed;
  });

  const headers = Object.values(fieldMapping) as string[];

  await exporter.createWorksheet({
    title: title,
    fullTitle: fullTitle,
    year: year,
    headers: headers,
    groupedHeaders: groupedHeaders,
    data: transformedData,
    fieldMapping: fieldMapping
  });

  const buffer = await exporter.generateBuffer();
  const uint8Array = new Uint8Array(buffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${title}-${year}.xlsx"`
    }
  });
}

async function exportAllForms(year: number) {
  const exporter = new ExcelExporter();

  // Export all 10 forms - using same configuration as single exports
  const formConfigs: Array<{
    type: string;
    title: string;
    fullTitle: string;
    groupedHeaders: { label: string; colspan: number }[];
  }> = [
    {
      type: 'monographic',
      title: '1_Monographs',
      fullTitle: 'Acquisitions of East Asian Materials',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Titles', colspan: 5 },
        { label: 'Purchased Volumes', colspan: 5 },
        { label: 'Non-Purchased Titles', colspan: 5 },
        { label: 'Non-Purchased Volumes', colspan: 5 },
        { label: 'Total Titles', colspan: 1 },
        { label: 'Total Volumes', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'volumeHoldings',
      title: '2_VolumeHoldings',
      fullTitle: 'Physical Volume Holdings',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Previous Year Total', colspan: 5 },
        { label: 'Added (Gross)', colspan: 5 },
        { label: 'Withdrawn', colspan: 5 },
        { label: 'Grand Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'serials',
      title: '3_Serials',
      fullTitle: 'Current Serials (Print and Electronic)',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased', colspan: 5 },
        { label: 'Non-Purchased', colspan: 5 },
        { label: 'Total', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'otherHoldings',
      title: '4_OtherHoldings',
      fullTitle: 'Holdings of Other Materials',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Audio', colspan: 5 },
        { label: 'Film', colspan: 5 },
        { label: 'Microform', colspan: 5 },
        { label: 'CD-ROM', colspan: 5 },
        { label: 'DVD', colspan: 5 },
        { label: 'Grand Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'unprocessed',
      title: '5_GrandTotalHolding',
      fullTitle: 'Unprocessed Backlog Materials',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Backlog', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'fiscal',
      title: '6_FiscalAppropriations',
      fullTitle: 'Fiscal Support for East Asian Collections',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'CHN Appropriations', colspan: 5 },
        { label: 'JPN Appropriations', colspan: 5 },
        { label: 'KOR Appropriations', colspan: 5 },
        { label: 'N-CJK Appropriations', colspan: 5 },
        { label: 'Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'personnel',
      title: '7_PersonnelSupport',
      fullTitle: 'Personnel Support for East Asian Collections',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Professional', colspan: 5 },
        { label: 'Support Staff', colspan: 5 },
        { label: 'Student Assistants', colspan: 5 },
        { label: 'Total', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'publicServices',
      title: '8_PublicServices',
      fullTitle: 'Public Services',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Presentations', colspan: 5 },
        { label: 'Reference Transactions', colspan: 5 },
        { label: 'Participants', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'electronic',
      title: '9_Electronic',
      fullTitle: 'Electronic Resources',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Full-text Titles', colspan: 5 },
        { label: 'Aggregated DBs', colspan: 1 },
        { label: 'E-Journals', colspan: 1 },
        { label: 'E-Books', colspan: 1 },
        { label: 'Total Expenditure', colspan: 5 },
        { label: 'Notes', colspan: 1 }
      ]
    },
    {
      type: 'electronicBooks',
      title: '10_ElectronicBooks',
      fullTitle: 'Electronic Books Statistics',
      groupedHeaders: [
        { label: 'Institutions', colspan: 1 },
        { label: 'Purchased Volumes', colspan: 5 },
        { label: 'Purchased Titles', colspan: 5 },
        { label: 'Subscription Volumes', colspan: 5 },
        { label: 'Subscription Titles', colspan: 5 },
        { label: 'Total Volumes', colspan: 1 },
        { label: 'Total Titles', colspan: 1 },
        { label: 'Notes', colspan: 1 }
      ]
    }
  ];

  for (const form of formConfigs) {
    let data: any[] = [];
    const fieldMapping = (formFieldMappings as any)[form.type];

    switch (form.type) {
      case 'monographic':
        data = await prisma.monographic_Acquisitions.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'volumeHoldings':
        data = await prisma.volume_Holdings.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'serials':
        data = await prisma.serials.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'otherHoldings':
        data = await prisma.other_Holdings.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'unprocessed':
        data = await prisma.unprocessed_Backlog_Materials.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'fiscal':
        data = await prisma.fiscal_Support.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'personnel':
        data = await prisma.personnel_Support.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'publicServices':
        data = await prisma.public_Services.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'electronic':
        data = await prisma.electronic.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
      case 'electronicBooks':
        data = await prisma.electronic_Books.findMany({
          where: { Library_Year: { year: year } },
          include: { Library_Year: { include: { Library: true } } },
          orderBy: { Library_Year: { Library: { library_name: 'asc' } } }
        });
        break;
    }

    if (data.length > 0) {
      const transformedData = data.map(record => {
        const transformed: any = {};
        Object.keys(fieldMapping).forEach(field => {
          transformed[field] = getNestedValue(record, field);
        });
        return transformed;
      });

      const headers = Object.values(fieldMapping) as string[];

      await exporter.createWorksheet({
        title: form.title,
        fullTitle: form.fullTitle,
        year: year,
        headers: headers,
        groupedHeaders: form.groupedHeaders,
        data: transformedData,
        fieldMapping: fieldMapping
      });
    }
  }

  const buffer = await exporter.generateBuffer();
  const uint8Array = new Uint8Array(buffer);

  return new NextResponse(uint8Array, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="CEAL_Statistics_All_Forms_${year}.xlsx"`
    }
  });
}
