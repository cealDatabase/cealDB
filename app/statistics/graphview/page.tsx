'use client';

import '@ant-design/v5-patch-for-react-19';
import { useState, useEffect } from 'react';
import { Select, Button, Card, Spin, Typography, Space, Tag } from 'antd';
import { Column, Line, DualAxes } from '@ant-design/plots';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

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

export default function GraphViewPage() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [dataTables, setDataTables] = useState<DataTable[]>([]);
  
  const [selectedLibraries, setSelectedLibraries] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [tableLabel, setTableLabel] = useState<string>('');
  const [chartType, setChartType] = useState<'grouped' | 'line' | 'dual'>('grouped');
  
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(true);

  // Fetch metadata on component mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Set default selections when metadata is loaded
  useEffect(() => {
    if (libraries.length > 0 && years.length > 0 && dataTables.length > 0) {
      // Default to first library, current year, and first two data tables
      setSelectedLibraries([libraries[0].value]);
      setSelectedYears([years[0]]);
      setSelectedTables([dataTables[0].key, dataTables[1].key]);
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
      
      // Fetch data for each selected table
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
      
      // Combine all data with table information
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

  // Prepare data for visualization
  const prepareChartData = () => {
    // Check if only one library is selected
    const uniqueLibraries = new Set(chartData.map(d => d.libraryId));
    const isSingleLibrary = uniqueLibraries.size === 1;

    if (selectedTables.length === 1) {
      // Single table: simple format
      return chartData.map(d => ({
        category: isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`,
        value: d.value,
        libraryName: d.libraryName,
        year: d.year,
      }));
    } else {
      // Multiple tables: include data table for grouping
      return chartData.map(d => ({
        category: isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`,
        value: d.value,
        libraryName: d.libraryName,
        year: d.year,
        type: d.dataTable || 'Unknown',
      }));
    }
  };

  const groupedColumnConfig = {
    data: prepareChartData(),
    xField: 'category',
    yField: 'value',
    colorField: selectedTables.length > 1 ? 'type' : undefined,
    group: selectedTables.length > 1,
    label: {
      position: 'top' as const,
      style: {
        fill: '#000',
        opacity: 0.6,
        fontSize: 10,
      },
    },
    legend: selectedTables.length > 1 ? {
      position: 'top' as const,
    } : false,
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
      },
    },
    meta: {
      category: {
        alias: 'Library (Year)',
      },
      value: {
        alias: 'Total',
      },
      type: {
        alias: 'Data Table',
      },
    },
  };

  const lineConfig = (() => {
    const uniqueLibraries = new Set(chartData.map(d => d.libraryId));
    const isSingleLibrary = uniqueLibraries.size === 1;

    return {
      data: prepareChartData(),
      xField: 'category',
      yField: 'value',
      colorField: selectedTables.length > 1 ? 'type' : undefined,
      seriesField: selectedTables.length > 1 ? 'type' : undefined,
      point: {
        size: 5,
        shape: 'diamond',
      },
      legend: selectedTables.length > 1 ? {
        position: 'top' as const,
      } : false,
      xAxis: {
        label: {
          autoRotate: !isSingleLibrary,
          autoHide: false,
        },
      },
      meta: {
        category: {
          alias: isSingleLibrary ? 'Year' : 'Library (Year)',
        },
        value: {
          alias: 'Total',
        },
        type: {
          alias: 'Data Table',
        },
      },
    };
  })();

  // Prepare dual axes data (only when exactly 2 tables selected)
  const prepareDualAxesData = () => {
    if (selectedTables.length !== 2) return { left: [], right: [] };
    
    const table1Data = chartData.filter(d => d.tableKey === selectedTables[0]);
    const table2Data = chartData.filter(d => d.tableKey === selectedTables[1]);
    
    // Check if single library
    const uniqueLibraries = new Set(chartData.map(d => d.libraryId));
    const isSingleLibrary = uniqueLibraries.size === 1;
    
    // Get all unique categories from both datasets
    const allCategories = new Set<string>();
    [...table1Data, ...table2Data].forEach(d => {
      const cat = isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`;
      allCategories.add(cat);
    });
    
    // Create maps for quick lookup
    const table1Map = new Map(
      table1Data.map(d => {
        const cat = isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`;
        return [cat, d.value];
      })
    );
    const table2Map = new Map(
      table2Data.map(d => {
        const cat = isSingleLibrary ? String(d.year) : `${d.libraryName} (${d.year})`;
        return [cat, d.value];
      })
    );
    
    // Build datasets with matching categories, using 0 for missing values
    const categories = Array.from(allCategories).sort();
    
    return {
      left: categories.map(category => ({
        category,
        value: table1Map.get(category) || 0,
      })),
      right: categories.map(category => ({
        category,
        value: table2Map.get(category) || 0,
      })),
    };
  };

  const dualAxesConfig = () => {
    const { left, right } = prepareDualAxesData();
    const table1Label = dataTables.find(t => t.key === selectedTables[0])?.label || 'Table 1';
    const table2Label = dataTables.find(t => t.key === selectedTables[1])?.label || 'Table 2';
    const uniqueLibraries = new Set(chartData.map(d => d.libraryId));
    const isSingleLibrary = uniqueLibraries.size === 1;
    
    return {
      data: [left, right],
      xField: 'category',
      yField: ['value', 'value'],
      geometryOptions: [
        {
          geometry: 'column',
          isGroup: false,
          seriesField: '',
          columnWidthRatio: 0.4,
        },
        {
          geometry: 'line',
          lineStyle: {
            lineWidth: 2,
          },
        },
      ],
      xAxis: {
        label: {
          autoRotate: !isSingleLibrary,
          autoHide: false,
        },
        title: {
          text: isSingleLibrary ? 'Year' : 'Library (Year)',
          style: { fontSize: 12 },
        },
      },
      yAxis: {},
      legend: {
        position: 'top' as const,
        items: [
          {
            name: table1Label,
            value: table1Label,
            marker: {
              symbol: 'square',
              style: { fill: '#5B8FF9', r: 5 },
            },
          },
          {
            name: table2Label,
            value: table2Label,
            marker: {
              symbol: 'line',
              style: { stroke: '#5AD8A6', r: 5, lineWidth: 2 },
            },
          },
        ],
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
      },
    };
  };

  if (metadataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" tip="Loading...">
          <div style={{ padding: '50px' }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>Data Visualization Dashboard</Title>
      <Text type="secondary">
        Select libraries, years, and data tables to visualize CEAL statistics
      </Text>

      <Card style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Selection Controls */}
          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>Select Libraries:</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select one or more libraries"
                  value={selectedLibraries}
                  onChange={setSelectedLibraries}
                  showSearch
                  optionFilterProp="children"
                  maxTagCount="responsive"
                >
                  {libraries.map(lib => (
                    <Option key={lib.value} value={lib.value}>
                      {lib.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Select Years:</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select one or more years"
                  value={selectedYears}
                  onChange={setSelectedYears}
                  maxTagCount="responsive"
                >
                  {years.map(year => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>Select Data Tables:</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: '8px' }}
                  placeholder="Select one or more data tables"
                  value={selectedTables}
                  onChange={setSelectedTables}
                  maxTagCount="responsive"
                >
                  {dataTables.map(table => (
                    <Option key={table.key} value={table.key}>
                      {table.label}
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Select 2 tables for Dual Axes comparison, or multiple for grouped visualization
                </Text>
              </div>

              <div>
                <Text strong>Chart Type:</Text>
                <div style={{ marginTop: '8px' }}>
                  <Space>
                    <Button
                      type={chartType === 'grouped' ? 'primary' : 'default'}
                      icon={<BarChartOutlined />}
                      onClick={() => setChartType('grouped')}
                    >
                      Grouped Column
                    </Button>
                    <Button
                      type={chartType === 'line' ? 'primary' : 'default'}
                      icon={<LineChartOutlined />}
                      onClick={() => setChartType('line')}
                    >
                      Multi-Line
                    </Button>
                    <Button
                      type={chartType === 'dual' ? 'primary' : 'default'}
                      disabled={selectedTables.length !== 2}
                      onClick={() => setChartType('dual')}
                      title={selectedTables.length !== 2 ? 'Select exactly 2 data tables for Dual Axes' : ''}
                    >
                      Dual Axes
                    </Button>
                  </Space>
                </div>
                {selectedTables.length !== 2 && (
                  <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Dual Axes requires exactly 2 data tables selected
                  </Text>
                )}
              </div>

              <Button
                type="primary"
                size="large"
                onClick={handleGenerateChart}
                disabled={selectedLibraries.length === 0 || selectedYears.length === 0 || selectedTables.length === 0}
                loading={loading}
                style={{ width: '200px' }}
              >
                Generate Chart
              </Button>
            </Space>
          </div>

          {/* Chart Display */}
          {chartData.length > 0 && (
            <Card
              title={
                <Space>
                  <Text strong>{tableLabel}</Text>
                  <Tag color="blue">{chartData.length} data points</Tag>
                  <Tag color="green">{selectedTables.length} {selectedTables.length === 1 ? 'table' : 'tables'}</Tag>
                </Space>
              }
              style={{ marginTop: '24px' }}
            >
              {chartType === 'grouped' ? (
                <Column {...groupedColumnConfig} />
              ) : chartType === 'line' ? (
                <Line {...lineConfig} />
              ) : chartType === 'dual' && selectedTables.length === 2 ? (
                <DualAxes {...dualAxesConfig()} />
              ) : (
                <Column {...groupedColumnConfig} />
              )}
            </Card>
          )}

          {chartData.length > 0 && selectedTables.length > 1 && (
            <Card style={{ marginTop: '16px' }} size="small">
              <Space direction="vertical" size="small">
                <Text strong>Visualization Tips:</Text>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li><Text type="secondary">Grouped Column: Best for comparing multiple metrics side-by-side</Text></li>
                  <li><Text type="secondary">Multi-Line: Ideal for tracking trends across different metrics</Text></li>
                  <li><Text type="secondary">Dual Axes: Compare 2 metrics with different scales (requires exactly 2 tables)</Text></li>
                </ul>
              </Space>
            </Card>
          )}

          {chartData.length === 0 && !loading && selectedTables.length > 0 && (
            <Card style={{ marginTop: '24px' }}>
              <Text type="secondary">
                No data available for the selected criteria. Please try different selections.
              </Text>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
}
