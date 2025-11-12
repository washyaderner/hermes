"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { useState } from 'react';

interface QualityDataPoint {
  date: string;
  quality: number;
  rollingAverage?: number;
}

interface PromptQualityGraphProps {
  data: QualityDataPoint[];
  onExport?: () => void;
}

export function PromptQualityGraph({ data, onExport }: PromptQualityGraphProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showRollingAverage, setShowRollingAverage] = useState(true);
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prompt Quality Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No quality data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExportPNG = () => {
    // This would use html2canvas or similar library
    if (onExport) {
      onExport();
    } else {
      alert('Export functionality - would save chart as PNG');
    }
  };

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Prompt Quality Over Time</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Track quality improvements across {data.length} prompts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              📈 Line
            </Button>
            <Button
              size="sm"
              variant={chartType === 'area' ? 'default' : 'outline'}
              onClick={() => setChartType('area')}
            >
              📊 Area
            </Button>
            <Button
              size="sm"
              variant={showRollingAverage ? 'default' : 'outline'}
              onClick={() => setShowRollingAverage(!showRollingAverage)}
            >
              📉 Avg
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPNG}
            >
              💾 Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ChartComponent
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b46c1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6b46c1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1f4a" />
            
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              domain={[0, 100]}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            <ReferenceLine y={75} stroke="#f97316" strokeDasharray="3 3" label="Target" />

            {chartType === 'area' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="quality"
                  stroke="#6b46c1"
                  fillOpacity={1}
                  fill="url(#colorQuality)"
                  name="Quality Score"
                  strokeWidth={2}
                />
                {showRollingAverage && data[0]?.rollingAverage && (
                  <Area
                    type="monotone"
                    dataKey="rollingAverage"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#colorAverage)"
                    name="7-Day Average"
                    strokeWidth={2}
                  />
                )}
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#6b46c1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6b46c1' }}
                  activeDot={{ r: 6 }}
                  name="Quality Score"
                />
                {showRollingAverage && data[0]?.rollingAverage && (
                  <Line
                    type="monotone"
                    dataKey="rollingAverage"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="7-Day Average"
                  />
                )}
              </>
            )}

            <Brush 
              dataKey="date" 
              height={30} 
              stroke="#6b46c1"
              fill="#1a0f2e"
            />
          </ChartComponent>
        </ResponsiveContainer>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Current</div>
            <div className="text-2xl font-bold text-primary">
              {data[data.length - 1]?.quality.toFixed(1)}%
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Average</div>
            <div className="text-2xl font-bold text-accent">
              {(data.reduce((sum, d) => sum + d.quality, 0) / data.length).toFixed(1)}%
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Peak</div>
            <div className="text-2xl font-bold text-green-400">
              {Math.max(...data.map(d => d.quality)).toFixed(1)}%
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Trend</div>
            <div className="text-2xl font-bold text-blue-400">
              {data.length > 1 
                ? (((data[data.length - 1].quality - data[0].quality) / data[0].quality) * 100).toFixed(1)
                : '0'
              }%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
