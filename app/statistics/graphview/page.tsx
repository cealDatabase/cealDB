'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Legend as RechartsLegend,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  PieChart as PieChartIcon,
  Loader2,
  TrendingUp,
  Check,
  ChevronsUpDown,
  X,
  Palette,
  Download,
} from "lucide-react";
import { cn } from '@/lib/utils';
import { toPng } from 'html-to-image';

interface Library {
  value: number;
  label: string;
}

interface DataTable {
  key: string;
  label: string;
  field: string;
  tableName: string;
}

interface ChartDataPoint {
  libraryId: number;
  libraryName: string;
  year: number;
  value: number;
  dataTable?: string;
  tableKey?: string;
}

interface MetadataResponse {
  libraries: Library[];
  years: number[];
  dataTables: DataTable[];
}

interface ChartDataResponse {
  data: ChartDataPoint[];
  tableLabel: string;
}

// Color theme definitions — each palette uses maximally distinct hues
const COLOR_THEMES = {
  vivid: {
    name: "Vivid",
    colors: ["#e63946", "#2a9d8f", "#e9c46a", "#457b9d", "#f4a261"],
  },
  bold: {
    name: "Bold",
    colors: ["#e41a1c", "#377eb8", "#4daf4a", "#ff7f00", "#984ea3"],
  },
  pastel: {
    name: "Pastel",
    colors: ["#fb8072", "#80b1d3", "#b3de69", "#fdb462", "#bc80bd"],
  },
  earth: {
    name: "Earth",
    colors: ["#c0392b", "#2980b9", "#27ae60", "#d35400", "#8e44ad"],
  },
  neon: {
    name: "Neon",
    colors: ["#ff4d6d", "#00b4d8", "#80ed99", "#ffd60a", "#c77dff"],
  },
  teal: {
    name: "Teal & Coral",
    colors: ["#ef476f", "#06d6a0", "#ffd166", "#118ab2", "#a8dadc"],
  },
  warm: {
    name: "Warm",
    colors: ["#d62828", "#f77f00", "#fcbf49", "#588157", "#3a86ff"],
  },
  cool: {
    name: "Cool",
    colors: ["#7400b8", "#5e60ce", "#48cae4", "#52b788", "#f4d35e"],
  },
};

type ColorTheme = keyof typeof COLOR_THEMES;

export default function GraphViewPage() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  
  const [selectedLibraries, setSelectedLibraries] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [tableLabel, setTableLabel] = useState<string>('');
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(
    "bar",
  );
  
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>("vivid");
  const [isExporting, setIsExporting] = useState(false);
  
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (libraries.length > 0 && years.length > 0 && dataTables.length > 0) {
      setSelectedLibraries([libraries[0].value]);
      setSelectedYears([years[0]]);
      setSelectedTables([dataTables[0].key]);
    }
  }, [libraries, years, dataTables]);

  const fetchMetadata = async () => {
    try {
      setMetadataLoading(true);
      const response = await fetch('/api/statistics/metadata');
      const data: MetadataResponse = await response.json();
      
      setLibraries(data.libraries);
      setYears(data.years);
      setDataTables(data.dataTables);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setMetadataLoading(false);
    }
  };

  const fetchChartData = async () => {
    if (selectedLibraries.length === 0 || selectedYears.length === 0 || selectedTables.length === 0) {
      return;
    }

    try {
      setLoading(true);
      
      const allDataPromises = selectedTables.map(async (tableKey) => {
        const params = new URLSearchParams({
          libraryIds: selectedLibraries.join(','),
          years: selectedYears.join(','),
          dataTable: tableKey,
        });
        const response = await fetch(`/api/statistics/chart-data?${params}`);
        const data: ChartDataResponse = await response.json();
        return { tableKey, data: data.data, label: data.tableLabel };
      });

      const results = await Promise.all(allDataPromises);
      
      const combinedData: ChartDataPoint[] = [];
      const labels: string[] = [];
      
      results.forEach(result => {
        labels.push(result.label);
        result.data.forEach(point => {
          combinedData.push({
            ...point,
            dataTable: result.label,
            tableKey: result.tableKey,
          });
        });
      });
      
      setChartData(combinedData);
      setTableLabel(labels.join(' vs '));
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = () => {
    fetchChartData();
  };

  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      setIsExporting(true);
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `ceal-chart-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare data for bar, line, and area charts
  const prepareChartData = () => {
    const uniqueLibraries = Array.from(new Set(chartData.map(d => d.libraryId)));
    const uniqueYears = Array.from(new Set(chartData.map(d => d.year))).sort();
    const isSingleLibrary = uniqueLibraries.length === 1;
    const isSingleYear = uniqueYears.length === 1;

    if (selectedTables.length === 1) {
      // Single table: group by year on X-axis, series for each library
      const dataMap = new Map<number, any>();
      
      chartData.forEach(d => {
        if (!dataMap.has(d.year)) {
          dataMap.set(d.year, { category: String(d.year) });
        }
        // Use library name as the series key
        dataMap.get(d.year)![d.libraryName] = d.value;
      });
      
      return Array.from(dataMap.values());
    } else {
      // Multiple tables: smarter grouping
      // If multiple years, group by year; if single year, group by library
      const dataMap = new Map<string, any>();
      
      chartData.forEach(d => {
        const key = isSingleYear ? d.libraryName : String(d.year);
        if (!dataMap.has(key)) {
          dataMap.set(key, { category: key });
        }
        const tableName = d.dataTable || 'Unknown';
        // For multiple libraries and years, create composite key
        if (!isSingleYear && !isSingleLibrary) {
          const seriesKey = `${tableName} (${d.libraryName})`;
          dataMap.get(key)![seriesKey] = d.value;
        } else {
          dataMap.get(key)![tableName] = d.value;
        }
      });
      
      return Array.from(dataMap.values());
    }
  };

  // Prepare data for pie chart
  const preparePieData = () => {
    const aggregated = new Map();
    chartData.forEach(d => {
      const key = d.dataTable || 'Unknown';
      const current = aggregated.get(key) || 0;
      aggregated.set(key, current + d.value);
    });
    
    return Array.from(aggregated.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Get current theme colors
  const getThemeColors = () => {
    return COLOR_THEMES[colorTheme].colors;
  };

  // Create chart config dynamically
  const createChartConfig = (): ChartConfig => {
    const config: ChartConfig = {};
    const themeColors = getThemeColors();
    const uniqueLibraries = Array.from(new Set(chartData.map(d => d.libraryName)));
    const uniqueYears = Array.from(new Set(chartData.map(d => d.year)));
    const isSingleYear = uniqueYears.length === 1;
    const isSingleLibrary = uniqueLibraries.length === 1;
    
    if (selectedTables.length === 1) {
      // Single table: each library gets its own color
      uniqueLibraries.forEach((libraryName, index) => {
        config[libraryName] = {
          label: libraryName,
          color: themeColors[index % themeColors.length],
        };
      });
    } else {
      // Multiple tables: create series for table-library combinations
      if (!isSingleYear && !isSingleLibrary) {
        // Multiple years and libraries: combine table + library names
        const uniqueTables = Array.from(new Set(chartData.map(d => d.dataTable)));
        let colorIndex = 0;
        uniqueTables.forEach(table => {
          uniqueLibraries.forEach(library => {
            const seriesKey = `${table} (${library})`;
            config[seriesKey] = {
              label: seriesKey,
              color: themeColors[colorIndex % themeColors.length],
            };
            colorIndex++;
          });
        });
      } else {
        // Single year or single library: just use table names
        const uniqueTables = Array.from(new Set(chartData.map(d => d.dataTable)));
        uniqueTables.forEach((table, index) => {
          if (table) {
            config[table] = {
              label: table,
              color: themeColors[index % themeColors.length],
            };
          }
        });
      }
    }
    
    return config;
  };

  const toggleLibrary = (libId: number) => {
    setSelectedLibraries(prev =>
      prev.includes(libId) ? prev.filter(id => id !== libId) : [...prev, libId]
    );
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleTable = (tableKey: string) => {
    setSelectedTables(prev =>
      prev.includes(tableKey) ? prev.filter(k => k !== tableKey) : [...prev, tableKey]
    );
  };

  if (metadataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const chartConfig = createChartConfig();

  return (
    <div className='container mx-auto p-6 max-w-7xl space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Data Visualization Dashboard
        </h1>
        <p className='text-muted-foreground'>
          Select libraries, years, and data tables to visualize CEAL statistics
          with beautiful charts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
          <CardDescription>Configure your data visualization</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Libraries Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Select Libraries</label>
            <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={libraryOpen}
                  className='w-full justify-between h-auto min-h-10'
                >
                  <div className='flex flex-wrap gap-1'>
                    {selectedLibraries.length === 0 ? (
                      <span className='text-muted-foreground'>
                        Select libraries...
                      </span>
                    ) : (
                      selectedLibraries.slice(0, 5).map((libId) => {
                        const lib = libraries.find((l) => l.value === libId);
                        return lib ? (
                          <Badge
                            key={libId}
                            variant='secondary'
                            className='mr-1'
                          >
                            {lib.label}
                          </Badge>
                        ) : null;
                      })
                    )}
                    {selectedLibraries.length > 5 && (
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant='secondary'
                              className='cursor-default'
                            >
                              +{selectedLibraries.length - 5} more
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side='bottom' className='max-w-xs'>
                            <p className='font-semibold mb-1 text-xs'>
                              All selected:
                            </p>
                            <ul className='text-xs space-y-0.5'>
                              {selectedLibraries.map((libId) => {
                                const lib = libraries.find(
                                  (l) => l.value === libId,
                                );
                                return lib ? (
                                  <li key={libId}>• {lib.label}</li>
                                ) : null;
                              })}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[600px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search libraries...' />
                  <CommandEmpty>No library found.</CommandEmpty>
                  <CommandList className='max-h-[300px]'>
                    <CommandGroup>
                      {libraries.map((lib) => (
                        <CommandItem
                          key={lib.value}
                          onSelect={() => toggleLibrary(lib.value)}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center gap-2 flex-1'>
                            <Checkbox
                              checked={selectedLibraries.includes(lib.value)}
                              className='pointer-events-none'
                            />
                            <span>{lib.label}</span>
                          </div>
                          {selectedLibraries.includes(lib.value) && (
                            <Check className='ml-auto h-4 w-4' />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className='text-xs text-muted-foreground'>
              {selectedLibraries.length}{" "}
              {selectedLibraries.length === 1 ? "library" : "libraries"}{" "}
              selected
            </p>
          </div>

          {/* Years Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Select Years</label>
            <Popover open={yearOpen} onOpenChange={setYearOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={yearOpen}
                  className='w-full justify-between h-auto min-h-10'
                >
                  <div className='flex flex-wrap gap-1'>
                    {selectedYears.length === 0 ? (
                      <span className='text-muted-foreground'>
                        Select years...
                      </span>
                    ) : (
                      selectedYears.slice(0, 5).map((year) => (
                        <Badge key={year} variant='secondary' className='mr-1'>
                          {year}
                        </Badge>
                      ))
                    )}
                    {selectedYears.length > 5 && (
                      <Badge variant='secondary'>
                        +{selectedYears.length - 5} more
                      </Badge>
                    )}
                  </div>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[500px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search years...' />
                  <CommandEmpty>No year found.</CommandEmpty>
                  <CommandList className='max-h-[300px]'>
                    <CommandGroup>
                      {years.map((year) => (
                        <CommandItem
                          key={year}
                          onSelect={() => toggleYear(year)}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center gap-2 flex-1'>
                            <Checkbox
                              checked={selectedYears.includes(year)}
                              className='pointer-events-none'
                            />
                            <span>{year}</span>
                          </div>
                          {selectedYears.includes(year) && (
                            <Check className='ml-auto h-4 w-4' />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className='text-xs text-muted-foreground'>
              {selectedYears.length}{" "}
              {selectedYears.length === 1 ? "year" : "years"} selected
            </p>
          </div>

          {/* Tables Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Select Data Tables</label>
            <div className='flex flex-wrap gap-2'>
              {dataTables.map((table) => (
                <Button
                  key={table.key}
                  variant={
                    selectedTables.includes(table.key) ? "default" : "outline"
                  }
                  size='sm'
                  onClick={() => toggleTable(table.key)}
                >
                  {table.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Chart Type Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Chart Type</label>
            <div className='flex flex-wrap gap-2'>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className='mr-2 h-4 w-4' />
                Bar Chart
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className='mr-2 h-4 w-4' />
                Line Chart
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "outline"}
                onClick={() => setChartType("area")}
              >
                <Activity className='mr-2 h-4 w-4' />
                Area Chart
              </Button>
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                onClick={() => setChartType("pie")}
              >
                <PieChartIcon className='mr-2 h-4 w-4' />
                Pie Chart
              </Button>
            </div>
          </div>

          {/* Color Theme Selection */}
          <div className='space-y-3'>
            <label className='text-sm font-medium'>Color Theme</label>
            <div className='flex items-center gap-2'>
              <Palette className='h-4 w-4 text-muted-foreground' />
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex gap-2 mt-2'>
              {getThemeColors().map((color, index) => (
                <div
                  key={index}
                  className='h-6 w-6 rounded-full border-2 border-muted'
                  style={{ backgroundColor: color }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <Button
            className='w-full'
            onClick={handleGenerateChart}
            disabled={
              selectedLibraries.length === 0 ||
              selectedYears.length === 0 ||
              selectedTables.length === 0 ||
              loading
            }
          >
            {loading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Loading...
              </>
            ) : (
              <>
                <TrendingUp className='mr-2 h-4 w-4' />
                Generate Chart
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {chartData.length > 0 && (
        <Card ref={chartRef}>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div className='space-y-1.5'>
                <CardTitle>{tableLabel}</CardTitle>
                <CardDescription>
                  Interactive visualization of your selected data
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleExportPNG}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className='mr-2 h-4 w-4' />
                      Export PNG
                    </>
                  )}
                </Button>
                <Badge variant='secondary'>
                  {chartData.length} data points
                </Badge>
                <Badge variant='secondary'>
                  {selectedTables.length} tables
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartType === "bar" && (
              <ChartContainer config={chartConfig} className='h-[600px]'>
                <BarChart
                  data={prepareChartData()}
                  margin={{ top: 5, right: 150, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='category'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsLegend
                    layout='vertical'
                    verticalAlign='middle'
                    align='right'
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                  {Object.keys(chartConfig).map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={getThemeColors()[index % getThemeColors().length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ChartContainer>
            )}

            {chartType === "line" && (
              <ChartContainer config={chartConfig} className='h-[600px]'>
                <LineChart
                  data={prepareChartData()}
                  margin={{ top: 5, right: 150, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='category'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsLegend
                    layout='vertical'
                    verticalAlign='middle'
                    align='right'
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                  {Object.keys(chartConfig).map((key, index) => (
                    <Line
                      key={key}
                      type='monotone'
                      dataKey={key}
                      stroke={getThemeColors()[index % getThemeColors().length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            )}

            {chartType === "area" && (
              <ChartContainer config={chartConfig} className='h-[600px]'>
                <AreaChart
                  data={prepareChartData()}
                  margin={{ top: 5, right: 150, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='category'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <RechartsLegend
                    layout='vertical'
                    verticalAlign='middle'
                    align='right'
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                  {Object.keys(chartConfig).map((key, index) => (
                    <Area
                      key={key}
                      type='monotone'
                      dataKey={key}
                      fill={getThemeColors()[index % getThemeColors().length]}
                      stroke={getThemeColors()[index % getThemeColors().length]}
                      fillOpacity={0.6}
                      stackId='1'
                    />
                  ))}
                </AreaChart>
              </ChartContainer>
            )}

            {chartType === "pie" && (
              <ChartContainer config={chartConfig} className='h-[600px]'>
                <PieChart
                  margin={{ top: 20, right: 150, left: 20, bottom: 20 }}
                >
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={preparePieData()}
                    dataKey='value'
                    nameKey='name'
                    cx='40%'
                    cy='50%'
                    outerRadius={180}
                    label
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getThemeColors()[index % getThemeColors().length]}
                      />
                    ))}
                  </Pie>
                  <RechartsLegend
                    layout='vertical'
                    verticalAlign='middle'
                    align='right'
                    wrapperStyle={{ paddingLeft: "20px" }}
                  />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visualization Tips */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Visualization Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 text-sm'>
              <div>
                <span className='font-semibold'>Bar Chart:</span> Best for
                comparing values across categories side-by-side
              </div>
              <div>
                <span className='font-semibold'>Line Chart:</span> Ideal for
                showing trends and changes over time
              </div>
              <div>
                <span className='font-semibold'>Area Chart:</span> Shows volume
                and cumulative trends with filled areas
              </div>
              <div>
                <span className='font-semibold'>Radar Chart:</span>{" "}
                Multi-dimensional comparison (requires 3+ tables)
              </div>
              <div>
                <span className='font-semibold'>Pie Chart:</span> Shows
                composition and proportions of categories
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && !loading && selectedTables.length > 0 && (
        <Card>
          <CardContent className='py-12'>
            <p className='text-center text-muted-foreground'>
              No data available for the selected criteria. Please try different
              selections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
