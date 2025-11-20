'use client';

import { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Legend as RechartsLegend,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, LineChart as LineChartIcon, Activity, PieChart as PieChartIcon, Radar as RadarIcon, Loader2, TrendingUp, Check, ChevronsUpDown, X, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Color theme definitions
const COLOR_THEMES = {
  neutral: {
    name: 'Neutral',
    colors: ['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4']
  },
  blue: {
    name: 'Blue',
    colors: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e']
  },
  green: {
    name: 'Green',
    colors: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
  },
  orange: {
    name: 'Orange',
    colors: ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12']
  },
  red: {
    name: 'Red',
    colors: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
  },
  rose: {
    name: 'Rose',
    colors: ['#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337']
  },
  violet: {
    name: 'Violet',
    colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
  },
  yellow: {
    name: 'Yellow',
    colors: ['#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12']
  }
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
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'radar' | 'pie'>('bar');
  
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);
  
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('neutral');

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (libraries.length > 0 && years.length > 0 && dataTables.length > 0) {
      setSelectedLibraries([libraries[0].value]);
      setSelectedYears([years[0]]);
      setSelectedTables([dataTables[0].key, dataTables[1]?.key].filter(Boolean));
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
      let labels: string[] = [];
      
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

  // Prepare data for bar, line, and area charts
  const prepareChartData = () => {
    const uniqueLibraries = new Set(chartData.map(d => d.libraryId));
    const isSingleLibrary = uniqueLibraries.size === 1;

    if (selectedTables.length === 1) {
      return chartData.map(d => ({
        category: isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`,
        value: d.value,
        name: d.libraryName,
      }));
    } else {
      const dataMap = new Map<string, any>();
      
      chartData.forEach(d => {
        const key = isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`;
        if (!dataMap.has(key)) {
          dataMap.set(key, { category: key });
        }
        const tableName = d.dataTable || 'Unknown';
        dataMap.get(key)[tableName] = d.value;
      });
      
      return Array.from(dataMap.values());
    }
  };

  // Prepare data for radar chart
  const prepareRadarData = () => {
    if (selectedTables.length < 3) return [];
    
    const uniqueLibYears = Array.from(new Set(chartData.map(d => `${d.libraryName} (${d.year})`)));
    
    const metricsMap = new Map<string, any>();
    
    chartData.forEach(d => {
      const metric = d.dataTable || 'Unknown';
      if (!metricsMap.has(metric)) {
        metricsMap.set(metric, { metric });
      }
      const libYear = `${d.libraryName} (${d.year})`;
      metricsMap.get(metric)[libYear] = d.value;
    });
    
    return Array.from(metricsMap.values());
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
    
    if (selectedTables.length === 1) {
      config.value = {
        label: tableLabel,
        color: themeColors[0],
      };
    } else {
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
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Data Visualization Dashboard</h1>
        <p className="text-muted-foreground">
          Select libraries, years, and data tables to visualize CEAL statistics with beautiful charts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
          <CardDescription>Configure your data visualization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Libraries Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Libraries</label>
            <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={libraryOpen}
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedLibraries.length === 0 ? (
                      <span className="text-muted-foreground">Select libraries...</span>
                    ) : (
                      selectedLibraries.slice(0, 3).map(libId => {
                        const lib = libraries.find(l => l.value === libId);
                        return lib ? (
                          <Badge key={libId} variant="secondary" className="mr-1">
                            {lib.label}
                          </Badge>
                        ) : null;
                      })
                    )}
                    {selectedLibraries.length > 3 && (
                      <Badge variant="secondary">+{selectedLibraries.length - 3} more</Badge>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[600px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search libraries..." />
                  <CommandEmpty>No library found.</CommandEmpty>
                  <CommandList className="max-h-[300px]">
                    <CommandGroup>
                      {libraries.map(lib => (
                        <CommandItem
                          key={lib.value}
                          onSelect={() => toggleLibrary(lib.value)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={selectedLibraries.includes(lib.value)}
                              onCheckedChange={() => toggleLibrary(lib.value)}
                            />
                            <span>{lib.label}</span>
                          </div>
                          {selectedLibraries.includes(lib.value) && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {selectedLibraries.length} {selectedLibraries.length === 1 ? 'library' : 'libraries'} selected
            </p>
          </div>

          {/* Years Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Years</label>
            <Popover open={yearOpen} onOpenChange={setYearOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={yearOpen}
                  className="w-full justify-between h-auto min-h-10"
                >
                  <div className="flex flex-wrap gap-1">
                    {selectedYears.length === 0 ? (
                      <span className="text-muted-foreground">Select years...</span>
                    ) : (
                      selectedYears.slice(0, 5).map(year => (
                        <Badge key={year} variant="secondary" className="mr-1">
                          {year}
                        </Badge>
                      ))
                    )}
                    {selectedYears.length > 5 && (
                      <Badge variant="secondary">+{selectedYears.length - 5} more</Badge>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search years..." />
                  <CommandEmpty>No year found.</CommandEmpty>
                  <CommandList className="max-h-[300px]">
                    <CommandGroup>
                      {years.map(year => (
                        <CommandItem
                          key={year}
                          onSelect={() => toggleYear(year)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Checkbox
                              checked={selectedYears.includes(year)}
                              onCheckedChange={() => toggleYear(year)}
                            />
                            <span>{year}</span>
                          </div>
                          {selectedYears.includes(year) && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {selectedYears.length} {selectedYears.length === 1 ? 'year' : 'years'} selected
            </p>
          </div>

          {/* Tables Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Data Tables</label>
            <div className="flex flex-wrap gap-2">
              {dataTables.map(table => (
                <Button
                  key={table.key}
                  variant={selectedTables.includes(table.key) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTable(table.key)}
                >
                  {table.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedTables.length < 3 && chartType === 'radar' && 
                'Radar chart requires at least 3 data tables for meaningful comparison'
              }
            </p>
          </div>

          {/* Chart Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Chart Type</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Bar Chart
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="mr-2 h-4 w-4" />
                Line Chart
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                onClick={() => setChartType('area')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Area Chart
              </Button>
              <Button
                variant={chartType === 'radar' ? 'default' : 'outline'}
                onClick={() => setChartType('radar')}
                disabled={selectedTables.length < 3}
              >
                <RadarIcon className="mr-2 h-4 w-4" />
                Radar Chart
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="mr-2 h-4 w-4" />
                Pie Chart
              </Button>
            </div>
          </div>

          {/* Color Theme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Color Theme</label>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                  <option key={key} value={key}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              {getThemeColors().map((color, index) => (
                <div
                  key={index}
                  className="h-6 w-6 rounded-full border-2 border-muted"
                  style={{ backgroundColor: color }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerateChart}
            disabled={selectedLibraries.length === 0 || selectedYears.length === 0 || selectedTables.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Chart
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Chart Display */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{tableLabel}</span>
              <div className="flex gap-2">
                <Badge variant="secondary">{chartData.length} data points</Badge>
                <Badge variant="secondary">{selectedTables.length} tables</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Interactive visualization of your selected data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartType === 'bar' && (
              <ChartContainer config={chartConfig} className="h-[500px]">
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {selectedTables.length === 1 ? (
                    <Bar dataKey="value" fill={getThemeColors()[0]} radius={[4, 4, 0, 0]} />
                  ) : (
                    Object.keys(chartConfig).map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={getThemeColors()[index % getThemeColors().length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))
                  )}
                </BarChart>
              </ChartContainer>
            )}

            {chartType === 'line' && (
              <ChartContainer config={chartConfig} className="h-[500px]">
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {selectedTables.length === 1 ? (
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getThemeColors()[0]}
                      strokeWidth={2}
                      dot={{ fill: getThemeColors()[0], r: 4 }}
                    />
                  ) : (
                    Object.keys(chartConfig).map((key, index) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={getThemeColors()[index % getThemeColors().length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))
                  )}
                </LineChart>
              </ChartContainer>
            )}

            {chartType === 'area' && (
              <ChartContainer config={chartConfig} className="h-[500px]">
                <AreaChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {selectedTables.length === 1 ? (
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill={getThemeColors()[0]}
                      stroke={getThemeColors()[0]}
                      fillOpacity={0.6}
                    />
                  ) : (
                    Object.keys(chartConfig).map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        fill={getThemeColors()[index % getThemeColors().length]}
                        stroke={getThemeColors()[index % getThemeColors().length]}
                        fillOpacity={0.6}
                        stackId="1"
                      />
                    ))
                  )}
                </AreaChart>
              </ChartContainer>
            )}

            {chartType === 'radar' && selectedTables.length >= 3 && (
              <ChartContainer config={chartConfig} className="h-[500px]">
                <RadarChart data={prepareRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {Array.from(new Set(chartData.map(d => `${d.libraryName} (${d.year})`))).map((libYear, index) => (
                    <Radar
                      key={libYear}
                      name={libYear}
                      dataKey={libYear}
                      stroke={getThemeColors()[index % getThemeColors().length]}
                      fill={getThemeColors()[index % getThemeColors().length]}
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ChartContainer>
            )}

            {chartType === 'pie' && (
              <ChartContainer config={chartConfig} className="h-[500px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={preparePieData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getThemeColors()[index % getThemeColors().length]} />
                    ))}
                  </Pie>
                  <RechartsLegend />
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
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-semibold">Bar Chart:</span> Best for comparing values across categories side-by-side
              </div>
              <div>
                <span className="font-semibold">Line Chart:</span> Ideal for showing trends and changes over time
              </div>
              <div>
                <span className="font-semibold">Area Chart:</span> Shows volume and cumulative trends with filled areas
              </div>
              <div>
                <span className="font-semibold">Radar Chart:</span> Multi-dimensional comparison (requires 3+ tables)
              </div>
              <div>
                <span className="font-semibold">Pie Chart:</span> Shows composition and proportions of categories
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && !loading && selectedTables.length > 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No data available for the selected criteria. Please try different selections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
