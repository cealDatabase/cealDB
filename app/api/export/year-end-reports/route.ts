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
  let fieldMapping: any = {};

  switch (formType) {
    case 'monographic':
      title = '1_Monographs';
      fieldMapping = formFieldMappings.monographic;
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
      fieldMapping = formFieldMappings.volumeHoldings;
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
      fieldMapping = formFieldMappings.serials;
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
      fieldMapping = formFieldMappings.otherHoldings;
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
      fieldMapping = formFieldMappings.unprocessed;
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
      fieldMapping = formFieldMappings.fiscal;
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
      fieldMapping = formFieldMappings.personnel;
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
      fieldMapping = formFieldMappings.publicServices;
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
      fieldMapping = formFieldMappings.electronic;
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
      fieldMapping = formFieldMappings.electronicBooks;
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
    year: year,
    headers: headers,
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

  // Export all 10 forms
  const formTypes = [
    { type: 'monographic', title: '1_Monographs', model: 'monographic_Acquisitions' },
    { type: 'volumeHoldings', title: '2_VolumeHoldings', model: 'volume_Holdings' },
    { type: 'serials', title: '3_Serials', model: 'serials' },
    { type: 'otherHoldings', title: '4_OtherHoldings', model: 'other_Holdings' },
    { type: 'unprocessed', title: '5_GrandTotalHolding', model: 'unprocessed_Backlog_Materials' },
    { type: 'fiscal', title: '6_FiscalAppropriations', model: 'fiscal_Support' },
    { type: 'personnel', title: '7_PersonnelSupport', model: 'personnel_Support' },
    { type: 'publicServices', title: '8_PublicServices', model: 'public_Services' },
    { type: 'electronic', title: '9_Electronic', model: 'electronic' },
    { type: 'electronicBooks', title: '10_ElectronicBooks', model: 'electronic_Books' }
  ];

  for (const form of formTypes) {
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
        year: year,
        headers: headers,
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
