'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, TrendingUp, BarChart3, Download, 
  RefreshCw, ExternalLink, Search, PlusCircle
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Demo-Typ für Amazon Cookware Commissions
type CookwareCommission = {
  id: string;
  productName: string;
  brand: string;
  price: number;
  commission: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  date: string;
  status: 'active' | 'pending' | 'expired';
  [key: string]: string | number; // Index-Signatur hinzufügen für dynamischen Zugriff
};

// Demo-Daten für Amazon Cookware Commissions
const demoCommissions: CookwareCommission[] = [
  {
    id: '1',
    productName: 'Professional Chef Knife Set',
    brand: 'CookMaster',
    price: 129.99,
    commission: 10.40,
    clicks: 342,
    conversions: 18,
    conversionRate: 5.26,
    date: '2025-10-01',
    status: 'active'
  },
  {
    id: '2',
    productName: 'Non-Stick Ceramic Cookware Set',
    brand: 'KitchenPro',
    price: 199.99,
    commission: 16.00,
    clicks: 521,
    conversions: 29,
    conversionRate: 5.57,
    date: '2025-10-02',
    status: 'active'
  },
  {
    id: '3',
    productName: 'Smart Pressure Cooker',
    brand: 'SmartCook',
    price: 149.99,
    commission: 12.00,
    clicks: 412,
    conversions: 22,
    conversionRate: 5.34,
    date: '2025-10-03',
    status: 'active'
  },
  {
    id: '4',
    productName: 'Cast Iron Skillet Set',
    brand: 'IronChef',
    price: 89.99,
    commission: 7.20,
    clicks: 278,
    conversions: 15,
    conversionRate: 5.40,
    date: '2025-09-28',
    status: 'active'
  },
  {
    id: '5',
    productName: 'Digital Kitchen Scale',
    brand: 'PreciseMeasure',
    price: 34.99,
    commission: 2.80,
    clicks: 198,
    conversions: 23,
    conversionRate: 11.62,
    date: '2025-09-25',
    status: 'active'
  },
  {
    id: '6',
    productName: 'Stainless Steel Mixing Bowls',
    brand: 'ChefQuality',
    price: 49.99,
    commission: 4.00,
    clicks: 145,
    conversions: 12,
    conversionRate: 8.28,
    date: '2025-09-22',
    status: 'active'
  },
  {
    id: '7',
    productName: 'Premium Wooden Cutting Board',
    brand: 'NatureKitchen',
    price: 59.99,
    commission: 4.80,
    clicks: 187,
    conversions: 9,
    conversionRate: 4.81,
    date: '2025-09-20',
    status: 'pending'
  }
];

export default function ManageCookwareCommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Total stats
  const totalCommission = demoCommissions.reduce((acc, item) => acc + item.commission, 0);
  const totalClicks = demoCommissions.reduce((acc, item) => acc + item.clicks, 0);
  const totalConversions = demoCommissions.reduce((acc, item) => acc + item.conversions, 0);
  const averageConversionRate = (totalConversions / totalClicks * 100).toFixed(2);
  
  // Filtered commissions based on search and filter
  const filteredCommissions = demoCommissions
    .filter(item => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item => filter === 'all' ? true : item.status === filter);
    
  // Sort commissions - standardmäßig nach Conversions absteigend sortieren
  const sortedCommissions = [...filteredCommissions].sort((a, b) => {
    let comparison = 0;
    if (a.conversions > b.conversions) {
      comparison = 1;
    } else if (a.conversions < b.conversions) {
      comparison = -1;
    }
    return comparison * -1; // Absteigend sortieren
  });
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Manage Cookware Commissions</h1>
      <p className="text-muted-foreground">
        Track and manage Amazon affiliate commissions for cookware products.
      </p>
      
      <Suspense fallback={<div>Loading statistics...</div>}>
        {/* Übersichtsstatistiken */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${totalCommission.toFixed(2)}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>12% more than last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>8% more than last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                  <RefreshCw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>5% more than last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{averageConversionRate}%</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span>2% higher than industry average</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
      
      {/* Suche und Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products or brands..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={filter === 'expired' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Expired
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-2" onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Cookware Product</DialogTitle>
                <DialogDescription>
                  Add a new cookware product to your Amazon affiliate program.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="e.g. Professional Chef Knife Set" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" placeholder="e.g. CookMaster" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" step="0.01" min="0" placeholder="99.99" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission (%)</Label>
                    <Input id="commission" type="number" step="0.1" min="0" placeholder="8.0" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amazon-url">Amazon Product URL</Label>
                  <Input id="amazon-url" placeholder="https://amazon.com/product/..." />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>Add Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Kommissionstabelle */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Cookware Products</CardTitle>
          <CardDescription>
            List of cookware products with affiliate commission tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b">
                    <th className="py-3 px-4 text-left font-medium">Product</th>
                    <th className="py-3 px-4 text-left font-medium">Price</th>
                    <th className="py-3 px-4 text-left font-medium">Commission</th>
                    <th className="py-3 px-4 text-left font-medium">Clicks</th>
                    <th className="py-3 px-4 text-left font-medium">Conv.</th>
                    <th className="py-3 px-4 text-left font-medium">Rate</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCommissions.length > 0 ? (
                    sortedCommissions.map((commission, index) => (
                      <tr key={commission.id} className={`border-b ${index % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''}`}>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{commission.productName}</p>
                            <p className="text-xs text-muted-foreground">{commission.brand}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">${commission.price.toFixed(2)}</td>
                        <td className="py-3 px-4 text-green-600 dark:text-green-400 font-medium">
                          ${commission.commission.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">{commission.clicks.toLocaleString()}</td>
                        <td className="py-3 px-4">{commission.conversions}</td>
                        <td className="py-3 px-4">{commission.conversionRate.toFixed(2)}%</td>
                        <td className="py-3 px-4">
                          <Badge variant={commission.status === 'active' ? 'default' : commission.status === 'pending' ? 'outline' : 'destructive'}>
                            {commission.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <PlusCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-muted-foreground">
                        No commission data found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedCommissions.length} of {demoCommissions.length} products
            </p>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Amazon Affiliate Integration Info */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Amazon Affiliate Integration</CardTitle>
          <CardDescription>
            Information about connecting your Amazon Associates account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 mb-4">
            <div className="flex gap-3 items-start">
              <div className="p-1 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Maximize Your Amazon Affiliate Commissions
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Link high-quality cookware products from recipes to increase conversion rates.
                  Products with detailed descriptions and high-quality images tend to perform better.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Amazon Associates Status</h3>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                Connected as: smartplates-kitchen-eu
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h3 className="font-medium mb-2">Commission Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly Target</p>
                  <p className="text-lg font-bold">$500.00</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ${totalCommission.toFixed(2)} earned this month
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Top Performing Product</p>
                  <p className="text-lg font-bold">Non-Stick Ceramic Cookware Set</p>
                  <p className="text-xs text-muted-foreground">29 conversions this month</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Status</p>
                  <p className="text-lg font-bold">Pending</p>
                  <p className="text-xs text-muted-foreground">
                    Next payment: 15th October 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}