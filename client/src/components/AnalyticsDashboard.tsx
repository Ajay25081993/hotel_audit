import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Download, Filter } from 'lucide-react';

interface AnalyticsDashboardProps {
  audits: any[];
  properties: any[];
}

export function AnalyticsDashboard({ audits, properties }: AnalyticsDashboardProps) {
  // Calculate analytics based on BRD requirements
  const complianceStats = {
    green: audits?.filter((audit: any) => audit.complianceZone === 'green').length || 0,
    amber: audits?.filter((audit: any) => audit.complianceZone === 'amber').length || 0,
    red: audits?.filter((audit: any) => audit.complianceZone === 'red').length || 0,
  };

  const totalAudits = audits?.length || 0;
  const avgScore = audits?.reduce((acc: number, audit: any) => acc + (audit.overallScore || 0), 0) / totalAudits || 0;

  const recentAudits = audits?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Central hub for accessing audit insights, reports, and analytics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">North India</SelectItem>
                <SelectItem value="west">West India</SelectItem>
                <SelectItem value="south">South India</SelectItem>
                <SelectItem value="east">East India</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {properties?.map((property: any) => (
                  <SelectItem key={property.id} value={property.location}>
                    {property.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Auditors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Auditors</SelectItem>
                <SelectItem value="sarah">Sarah Johnson</SelectItem>
                <SelectItem value="michael">Michael Chen</SelectItem>
                <SelectItem value="emily">Emily Davis</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}/5</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+0.3 from last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAudits > 0 ? Math.round(((complianceStats.green + complianceStats.amber) / totalAudits) * 100) : 0}%
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Compliance Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{complianceStats.red}</p>
                <div className="flex items-center mt-1">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">-2 from last month</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audits This Month</p>
                <p className="text-2xl font-bold text-gray-900">{totalAudits}</p>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">Target: 50</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Zone Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Zone Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm font-medium">Green Zone (Compliant)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={totalAudits > 0 ? (complianceStats.green / totalAudits) * 100 : 0} 
                  className="w-32" 
                />
                <span className="text-sm font-bold min-w-12">{complianceStats.green}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm font-medium">Amber Zone (Minor Issues)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={totalAudits > 0 ? (complianceStats.amber / totalAudits) * 100 : 0} 
                  className="w-32" 
                />
                <span className="text-sm font-bold min-w-12">{complianceStats.amber}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm font-medium">Red Zone (Non-Compliant)</span>
              </div>
              <div className="flex items-center space-x-3">
                <Progress 
                  value={totalAudits > 0 ? (complianceStats.red / totalAudits) * 100 : 0} 
                  className="w-32" 
                />
                <span className="text-sm font-bold min-w-12">{complianceStats.red}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audit Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Audit Results</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAudits.map((audit: any) => (
              <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">Property ID {audit.propertyId}</p>
                    <p className="text-sm text-gray-600">
                      {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={audit.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {audit.status}
                  </Badge>
                  {audit.overallScore && (
                    <span className="font-bold text-lg">{audit.overallScore}/5</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}