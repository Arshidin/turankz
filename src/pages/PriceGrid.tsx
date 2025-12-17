import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Info, CircleDot } from 'lucide-react';

export default function PriceGrid() {
  return (
    <MainLayout>
      <PageHeader 
        title="Turan Live Cattle Price Grid" 
        description="Unified market reference for live cattle pricing across the platform"
      />

      {/* Intro Note */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">
              This page presents a unified and transparent live cattle pricing framework used as a market reference. 
              It is informational only and does not represent final transaction prices.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Section 1: Product Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product A */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                    Product A
                  </Badge>
                </div>
                <CardTitle className="text-base">Young Bull (Calf / Weaner)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium">Male</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">Up to 12 months</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight Range</span>
                    <span className="font-medium">180–260 kg</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pricing Basis</span>
                    <span className="font-medium">Base A (₸/kg live weight)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product B */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                    Product B
                  </Badge>
                </div>
                <CardTitle className="text-base">Feeder Bull</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium">Male</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">12–18 months</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight Range</span>
                    <span className="font-medium">260–380 kg</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pricing Basis</span>
                    <span className="font-medium">Base B (₸/kg live weight)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Base prices are published separately and may vary by region and period.
          </p>
        </section>

        {/* Section 2: Pricing Formula */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Pricing Formula</h2>
          <Card>
            <CardContent className="py-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-secondary rounded-lg px-6 py-4 mb-3">
                  <p className="text-lg font-mono font-semibold">
                    Final Price = Base Price + Adjustments
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Price is calculated per kilogram of live weight
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Adjustment Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Adjustment Grid</h2>
          
          <div className="space-y-6">
            {/* Breed Adjustments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Breed Adjustment</CardTitle>
                <CardDescription>Applies to both Product A and Product B</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Adjustment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Tier 1</TableCell>
                      <TableCell>Meat breeds</TableCell>
                      <TableCell className="text-right font-mono">0 ₸/kg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tier 2</TableCell>
                      <TableCell>Crossbred</TableCell>
                      <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tier 3</TableCell>
                      <TableCell>Dairy breeds</TableCell>
                      <TableCell className="text-right font-mono text-destructive">−100 ₸/kg</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Age Adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                      Product A
                    </Badge>
                  </div>
                  <CardTitle className="text-base">Age Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Range</TableHead>
                        <TableHead className="text-right">Adjustment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>8–12 months</TableCell>
                        <TableCell className="text-right font-mono">0 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>6–8 months</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&lt; 6 months</TableCell>
                        <TableCell className="text-right font-mono text-destructive">−100 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50">
                        <TableCell>&gt; 12 months</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">→ Product B</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30 text-xs">
                      Product B
                    </Badge>
                  </div>
                  <CardTitle className="text-base">Age Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Range</TableHead>
                        <TableHead className="text-right">Adjustment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>12–18 months</TableCell>
                        <TableCell className="text-right font-mono">0 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&gt; 18 months</TableCell>
                        <TableCell className="text-right font-mono text-destructive">−100 ₸/kg</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Weight Adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs">
                      Product A
                    </Badge>
                  </div>
                  <CardTitle className="text-base">Weight Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Weight Range</TableHead>
                        <TableHead className="text-right">Adjustment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>180–260 kg</TableCell>
                        <TableCell className="text-right font-mono">0 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>160–180 kg</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&lt; 160 kg</TableCell>
                        <TableCell className="text-right font-mono text-destructive">−100 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&gt; 260 kg</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30 text-xs">
                      Product B
                    </Badge>
                  </div>
                  <CardTitle className="text-base">Weight Adjustment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Weight Range</TableHead>
                        <TableHead className="text-right">Adjustment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>260–380 kg</TableCell>
                        <TableCell className="text-right font-mono">0 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>240–260 kg</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&lt; 240 kg</TableCell>
                        <TableCell className="text-right font-mono text-destructive">−100 ₸/kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>&gt; 380 kg</TableCell>
                        <TableCell className="text-right font-mono text-amber-600">−50 ₸/kg</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Section 4: Usage Notes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Usage Notes</h2>
          <Card>
            <CardContent className="py-5">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    The grid is a <span className="text-foreground font-medium">market reference</span>, not a contract price.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Final prices may include additional premiums or discounts based on specific transaction terms.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Only <span className="text-foreground font-medium">male cattle</span> are covered by this grid.
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CircleDot className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">
                    Reliability and pool participation premiums are applied separately and are not reflected in this grid.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
