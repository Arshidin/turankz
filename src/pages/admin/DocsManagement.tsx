import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useDocsPages, useDocsNavigation, useUpsertDocsPage, useDeleteDocsPage, useUpsertDocsNavigation, useDeleteDocsNavigation, type DocsPage, type DocsNavigation } from '@/hooks/useDocs';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DocsManagement() {
  const { t } = useTranslation();
  const { data: pages, isLoading: pagesLoading } = useDocsPages();
  const { data: navigation, isLoading: navLoading } = useDocsNavigation('ru');
  const upsertPage = useUpsertDocsPage();
  const deletePage = useDeleteDocsPage();
  const upsertNav = useUpsertDocsNavigation();
  const deleteNav = useDeleteDocsNavigation();

  const [editingPage, setEditingPage] = useState<Partial<DocsPage> | null>(null);
  const [editingNav, setEditingNav] = useState<Partial<DocsNavigation> | null>(null);

  const handleSavePage = async () => {
    if (!editingPage?.slug || !editingPage.title_ru || !editingPage.title_en) {
      toast.error('Slug and titles are required');
      return;
    }

    try {
      await upsertPage.mutateAsync({
        slug: editingPage.slug,
        title_ru: editingPage.title_ru,
        title_en: editingPage.title_en,
        content_ru: editingPage.content_ru || '',
        content_en: editingPage.content_en || '',
        section: editingPage.section || 'Introduction',
        order_index: editingPage.order_index || 0,
        is_published: editingPage.is_published ?? false,
      });
      toast.success('Page saved successfully');
      setEditingPage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save page');
    }
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      await deletePage.mutateAsync(slug);
      toast.success('Page deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete page');
    }
  };

  const handleSaveNav = async () => {
    if (!editingNav?.slug || !editingNav.section || !editingNav.label_ru || !editingNav.label_en) {
      toast.error('All fields are required');
      return;
    }

    try {
      await upsertNav.mutateAsync({
        slug: editingNav.slug,
        section: editingNav.section,
        label_ru: editingNav.label_ru,
        label_en: editingNav.label_en,
        parent_id: editingNav.parent_id || null,
        order_index: editingNav.order_index || 0,
      });
      toast.success('Navigation item saved successfully');
      setEditingNav(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save navigation item');
    }
  };

  const handleDeleteNav = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return;

    try {
      await deleteNav.mutateAsync(id);
      toast.success('Navigation item deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete navigation item');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Documentation Management"
          description="Manage documentation pages and navigation structure"
        />

        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documentation Pages</h3>
              <Button onClick={() => setEditingPage({})}>
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </div>

            {editingPage !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slug *</Label>
                      <Input
                        value={editingPage.slug || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                        placeholder="farmer/batch-lifecycle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Input
                        value={editingPage.section || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, section: e.target.value })}
                        placeholder="Farmer Guide"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title (RU) *</Label>
                      <Input
                        value={editingPage.title_ru || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, title_ru: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Title (EN) *</Label>
                      <Input
                        value={editingPage.title_en || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, title_en: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content (RU) - Markdown</Label>
                      <Textarea
                        value={editingPage.content_ru || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, content_ru: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content (EN) - Markdown</Label>
                      <Textarea
                        value={editingPage.content_en || ''}
                        onChange={(e) => setEditingPage({ ...editingPage, content_en: e.target.value })}
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingPage.is_published ?? false}
                        onCheckedChange={(checked) => setEditingPage({ ...editingPage, is_published: checked })}
                      />
                      <Label>Published</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingPage(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSavePage} disabled={upsertPage.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {pagesLoading ? (
              <div>Loading...</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>All Pages</CardTitle>
                  <CardDescription>{pages?.length || 0} pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slug</TableHead>
                        <TableHead>Title (RU)</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages?.map((page) => (
                        <TableRow key={page.id}>
                          <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                          <TableCell>{page.title_ru}</TableCell>
                          <TableCell>{page.section}</TableCell>
                          <TableCell>
                            <Badge variant={page.is_published ? 'default' : 'secondary'}>
                              {page.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingPage(page)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePage(page.slug)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="navigation" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Navigation Structure</h3>
              <Button onClick={() => setEditingNav({})}>
                <Plus className="w-4 h-4 mr-2" />
                New Item
              </Button>
            </div>

            {editingNav !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Navigation Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slug (Page) *</Label>
                      <Select
                        value={editingNav.slug || ''}
                        onValueChange={(value) => setEditingNav({ ...editingNav, slug: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select page" />
                        </SelectTrigger>
                        <SelectContent>
                          {pages?.map((page) => (
                            <SelectItem key={page.id} value={page.slug}>
                              {page.slug}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Section *</Label>
                      <Input
                        value={editingNav.section || ''}
                        onChange={(e) => setEditingNav({ ...editingNav, section: e.target.value })}
                        placeholder="Farmer Guide"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Label (RU) *</Label>
                      <Input
                        value={editingNav.label_ru || ''}
                        onChange={(e) => setEditingNav({ ...editingNav, label_ru: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label (EN) *</Label>
                      <Input
                        value={editingNav.label_en || ''}
                        onChange={(e) => setEditingNav({ ...editingNav, label_en: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingNav(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNav} disabled={upsertNav.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {navLoading ? (
              <div>Loading...</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Items</CardTitle>
                  <CardDescription>{navigation?.length || 0} items</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Label (RU)</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {navigation?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.section}</TableCell>
                          <TableCell>{item.label_ru}</TableCell>
                          <TableCell className="font-mono text-sm">{item.slug}</TableCell>
                          <TableCell>{item.order_index}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingNav(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNav(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

