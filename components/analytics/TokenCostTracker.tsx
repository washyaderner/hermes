"use client";

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Bar, BarChart, ComposedChart } from 'recharts';
import { useState } from 'react';

interface CostDataPoint {
  date: string;
  cost: number;
  tokens: number;
  platform: string;
}

interface TokenCostTrackerProps {
  data: CostDataPoint[];
  monthlyBudget?: number;
}

export function TokenCostTracker({ data, monthlyBudget = 100 }: TokenCostTrackerProps) {
  const [budget, setBudget] = useState(monthlyBudget);
  const [showByPlatform, setShowByPlatform] = useState(false);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Cost Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No cost data available yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate data by date
  const aggregatedData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date);
    if (existing) {
      existing.cost += item.cost;
      existing.tokens += item.tokens;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as CostDataPoint[]);

  // Calculate metrics
  const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
  const totalTokens = data.reduce((sum, d) => sum + d.tokens, 0);
  const avgCostPerDay = totalCost / (aggregatedData.length || 1);
  const daysInMonth = 30;
  const projectedMonthlyCost = avgCostPerDay * daysInMonth;
  const budgetUsage = (totalCost / budget) * 100;

  // Cost by platform
  const costByPlatform = data.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + item.cost;
    return acc;
  }, {} as Record<string, number>);

  const platformBreakdown = Object.entries(costByPlatform)
    .map(([platform, cost]) => ({ platform, cost }))
    .sort((a, b) => b.cost - a.cost);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index}>
              <p style={{ color: entry.color }} className="text-sm">
                Cost: ${entry.value.toFixed(4)}
              </p>
              {entry.payload.tokens && (
                <p className="text-xs text-gray-400">
                  Tokens: {entry.payload.tokens.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Token Cost Tracker</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Real-time cost accumulation and budget monitoring
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-24"
              placeholder="Budget"
            />
            <span className="text-xs text-gray-400">$/month</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Budget Usage</span>
            <span className={budgetUsage > 90 ? 'text-red-400' : budgetUsage > 70 ? 'text-orange-400' : 'text-green-400'}>
              ${totalCost.toFixed(2)} / ${budget.toFixed(2)}
            </span>
          </div>
          <div className="h-4 bg-surface rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all ${
                budgetUsage > 90 ? 'bg-red-500' : budgetUsage > 70 ? 'bg-orange-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {budgetUsage.toFixed(1)}% of monthly budget used
          </p>
        </div>

        {/* Cost Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={aggregatedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d1f4a" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Budget line */}
            <ReferenceLine 
              y={budget / daysInMonth} 
              stroke="#f97316" 
              strokeDasharray="3 3" 
              label={{ value: 'Daily Budget', position: 'right', fill: '#f97316' }}
            />

            <Bar 
              dataKey="cost" 
              fill="#6b46c1" 
              name="Daily Cost"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Trend"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Total Cost</div>
            <div className="text-2xl font-bold text-primary">
              ${totalCost.toFixed(2)}
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Total Tokens</div>
            <div className="text-2xl font-bold text-accent">
              {(totalTokens / 1000).toFixed(1)}K
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Avg/Day</div>
            <div className="text-2xl font-bold text-blue-400">
              ${avgCostPerDay.toFixed(2)}
            </div>
          </div>
          <div className="bg-surface/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-gray-400">Projected</div>
            <div className={`text-2xl font-bold ${
              projectedMonthlyCost > budget ? 'text-red-400' : 'text-green-400'
            }`}>
              ${projectedMonthlyCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        <div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowByPlatform(!showByPlatform)}
            className="mb-3"
          >
            {showByPlatform ? '📊 Hide' : '📊 Show'} Platform Breakdown
          </Button>

          {showByPlatform && (
            <div className="space-y-2">
              {platformBreakdown.map(({ platform, cost }) => (
                <div key={platform} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{platform}</span>
                      <span className="text-primary">${cost.toFixed(4)}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(cost / totalCost) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 w-12 text-right">
                    {((cost / totalCost) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
