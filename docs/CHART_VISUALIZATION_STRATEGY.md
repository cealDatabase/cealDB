# Chart Visualization Strategy

## Overview
The chart visualization system uses **colors and shapes** to differentiate libraries and years, creating cleaner X-axis labels and more intuitive data exploration.

## Visualization Logic

### Single Table Selection
When only **one data table** is selected:
- **X-axis**: Years (e.g., 2019, 2024)
- **Series/Colors**: Different libraries (e.g., Minnesota, Wisconsin Medical)
- **Result**: Clean year labels on X-axis, colored bars/lines for each library

**Example:**
```
X-axis: 2019, 2024
Series: 
  - Minnesota (Purple bar/line)
  - Wisconsin Medical (Blue bar/line)
```

### Multiple Tables Selection

#### Case 1: Single Year, Multiple Libraries
- **X-axis**: Library names
- **Series/Colors**: Different data tables
- **Result**: Compare multiple metrics across libraries for one year

#### Case 2: Multiple Years, Single Library
- **X-axis**: Years
- **Series/Colors**: Different data tables
- **Result**: Track multiple metrics over time for one library

#### Case 3: Multiple Years AND Multiple Libraries
- **X-axis**: Years
- **Series/Colors**: Combination of table + library (e.g., "Volume Holdings (Minnesota)")
- **Result**: Most comprehensive view with all combinations visible

## Color Themes

The system includes 8 color themes:
- **Neutral**: Purple to cyan gradient
- **Blue**: Deep blue palette
- **Green**: Forest green palette
- **Orange**: Warm orange tones
- **Red**: Red gradient
- **Rose**: Pink-rose gradient
- **Violet**: Purple gradient
- **Yellow**: Gold-yellow palette

Each theme provides 5 distinct colors to differentiate up to 5 series before cycling.

## Benefits

### Cleaner X-axis
✅ **Before**: `Minnesota (2019)`, `Minnesota (2024)`, `Wisconsin Medical (2019)`, `Wisconsin Medical (2024)`  
✅ **After**: `2019`, `2024` (with colored series for each library)

### Better Data Comparison
- Side-by-side comparison of libraries across years
- Clear visual distinction using colors
- Interactive legend to show/hide specific series
- Consistent color assignment per library

### Scalability
- Works with 2-10+ libraries
- Handles 2-20+ years
- Supports 1-10 data tables
- Automatic color cycling for large datasets

## Chart Types

### Bar Chart
- Best for comparing discrete values
- Grouped bars for multiple series
- Colors clearly differentiate libraries

### Line Chart
- Ideal for showing trends over time
- Multiple colored lines for each library
- Excellent for year-over-year comparison

### Area Chart
- Shows volume and cumulative trends
- Stacked areas with transparency
- Color-coded by library/table

### Radar Chart
- Multi-dimensional comparison (requires 3+ tables)
- Colored polygons for each library-year combination

### Pie Chart
- Shows proportional distribution
- Color-coded segments by data table

## User Experience

Users can:
1. Select multiple libraries (e.g., 3 institutions)
2. Select multiple years (e.g., 2019, 2020, 2024)
3. Select multiple data tables (e.g., Volume Holdings, Monographic Acquisitions)
4. Choose a color theme that suits their preference
5. Toggle between chart types to find the best visualization
6. Use the legend to focus on specific series

The system automatically determines the smartest grouping strategy based on the selection.
