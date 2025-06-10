"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Package, Settings, DollarSign, Wrench, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  CustomCategory, 
  CustomProduct, 
  ProductComponent, 
  PricingInfo, 
  PricingModel 
} from "@/lib/types"
import { 
  loadCustomCategories, 
  saveCustomCategories, 
  loadCustomProducts, 
  saveCustomProducts,
  calculateCompositeProperties,
  getPricingModelDisplayName,
  validateProductComponents,
  DEFAULT_CUSTOM_CATEGORIES 
} from "@/lib/custom-products"
import { MATERIALS } from "@/lib/metal-data"

interface CustomProductsManagerProps {
  onSelectProduct?: (product: CustomProduct) => void
}

export function CustomProductsManager({ onSelectProduct }: CustomProductsManagerProps) {
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [products, setProducts] = useState<CustomProduct[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    setCategories(loadCustomCategories())
    setProducts(loadCustomProducts())
  }, [])

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "📦",
    color: "bg-blue-500"
  })

  // Product form state
  const [productForm, setProductForm] = useState<Partial<CustomProduct>>({
    name: "",
    description: "",
    categoryId: "",
    components: [],
    pricingOptions: [],
    tags: [],
    isActive: true
  })

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      icon: "📦",
      color: "bg-blue-500"
    })
    setEditingCategory(null)
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      categoryId: "",
      components: [],
      pricingOptions: [],
      tags: [],
      isActive: true
    })
    setEditingProduct(null)
  }

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a category name",
        variant: "destructive"
      })
      return
    }

    const newCategory: CustomCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description,
      icon: categoryForm.icon,
      color: categoryForm.color,
      createdAt: editingCategory?.createdAt || new Date(),
      updatedAt: new Date()
    }

    let updatedCategories
    if (editingCategory) {
      updatedCategories = categories.map(cat => cat.id === editingCategory.id ? newCategory : cat)
    } else {
      updatedCategories = [...categories, newCategory]
    }

    setCategories(updatedCategories)
    saveCustomCategories(updatedCategories)
    resetCategoryForm()
    setIsCreateCategoryOpen(false)

    toast({
      title: editingCategory ? "Category updated" : "Category created",
      description: `${newCategory.name} has been ${editingCategory ? 'updated' : 'created'} successfully`
    })
  }

  const handleDeleteCategory = (categoryId: string) => {
    const productsInCategory = products.filter(p => p.categoryId === categoryId)
    if (productsInCategory.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `This category contains ${productsInCategory.length} products. Delete the products first.`,
        variant: "destructive"
      })
      return
    }

    const updatedCategories = categories.filter(cat => cat.id !== categoryId)
    setCategories(updatedCategories)
    saveCustomCategories(updatedCategories)

    toast({
      title: "Category deleted",
      description: "Category has been deleted successfully"
    })
  }

  const handleSaveProduct = () => {
    if (!productForm.name?.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a product name",
        variant: "destructive"
      })
      return
    }

    if (!productForm.categoryId) {
      toast({
        title: "Category required",
        description: "Please select a category",
        variant: "destructive"
      })
      return
    }

    const validation = validateProductComponents(productForm.components || [])
    if (!validation.isValid) {
      toast({
        title: "Invalid components",
        description: validation.errors[0],
        variant: "destructive"
      })
      return
    }

    const properties = calculateCompositeProperties(productForm.components || [])

    const newProduct: CustomProduct = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name!,
      categoryId: productForm.categoryId!,
      description: productForm.description,
      components: productForm.components || [],
      pricingOptions: productForm.pricingOptions || [],
      properties,
      tags: productForm.tags || [],
      createdAt: editingProduct?.createdAt || new Date(),
      updatedAt: new Date(),
      isActive: productForm.isActive !== false
    }

    let updatedProducts
    if (editingProduct) {
      updatedProducts = products.map(prod => prod.id === editingProduct.id ? newProduct : prod)
    } else {
      updatedProducts = [...products, newProduct]
    }

    setProducts(updatedProducts)
    saveCustomProducts(updatedProducts)
    resetProductForm()
    setIsCreateProductOpen(false)

    toast({
      title: editingProduct ? "Product updated" : "Product created",
      description: `${newProduct.name} has been ${editingProduct ? 'updated' : 'created'} successfully`
    })
  }

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(prod => prod.id !== productId)
    setProducts(updatedProducts)
    saveCustomProducts(updatedProducts)

    toast({
      title: "Product deleted",
      description: "Product has been deleted successfully"
    })
  }

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory)
    : products

  const availableIcons = ["📦", "🔧", "🏗️", "⚙️", "🔩", "🔥", "🧰", "🔨", "⚡", "🛠️"]
  const availableColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", 
    "bg-red-500", "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Products</h2>
          <p className="text-muted-foreground">Manage custom categories and products with flexible pricing</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit' : 'Create'} Category</DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Update' : 'Create a new'} category for organizing your custom products
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-desc">Description</Label>
                  <Textarea
                    id="cat-desc"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <Select
                      value={categoryForm.icon}
                      onValueChange={(value) => setCategoryForm(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map(icon => (
                          <SelectItem key={icon} value={icon}>
                            <span className="mr-2">{icon}</span>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Select
                      value={categoryForm.color}
                      onValueChange={(value) => setCategoryForm(prev => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableColors.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded", color)} />
                              {color.replace('bg-', '').replace('-500', '')}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    resetCategoryForm()
                    setIsCreateCategoryOpen(false)
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveCategory}>
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit' : 'Create'} Product</DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Update' : 'Create a new'} custom product with multiple materials and flexible pricing
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                product={productForm}
                categories={categories}
                onUpdate={setProductForm}
                onSave={handleSaveProduct}
                onCancel={() => {
                  resetProductForm()
                  setIsCreateProductOpen(false)
                }}
                isEditing={!!editingProduct}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("")}
        >
          All Products ({products.length})
        </Button>
        {categories.map(category => {
          const count = products.filter(p => p.categoryId === category.id).length
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-1"
            >
              <span>{category.icon}</span>
              {category.name} ({count})
            </Button>
          )
        })}
      </div>

      {/* Categories management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Categories
          </CardTitle>
          <CardDescription>
            Manage product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", category.color)}>
                        {category.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {products.filter(p => p.categoryId === category.id).length} products
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCategoryForm({
                            name: category.name,
                            description: category.description || "",
                            icon: category.icon || "📦",
                            color: category.color || "bg-blue-500"
                          })
                          setEditingCategory(category)
                          setIsCreateCategoryOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-2">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products
            {selectedCategory && (
              <Badge variant="secondary">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {filteredProducts.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                category={categories.find(c => c.id === product.categoryId)}
                onEdit={() => {
                  setProductForm(product)
                  setEditingProduct(product)
                  setIsCreateProductOpen(true)
                }}
                onDelete={() => handleDeleteProduct(product.id)}
                onSelect={() => onSelectProduct?.(product)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Product form component
interface ProductFormProps {
  product: Partial<CustomProduct>
  categories: CustomCategory[]
  onUpdate: (product: Partial<CustomProduct>) => void
  onSave: () => void
  onCancel: () => void
  isEditing: boolean
}

function ProductForm({ product, categories, onUpdate, onSave, onCancel, isEditing }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState("basic")

  const addComponent = () => {
    const remainingPercentage = Math.max(0, 100 - (product.components?.reduce((sum, c) => sum + c.percentage, 0) || 0))
    const newComponent: ProductComponent = {
      id: Date.now().toString(),
      materialCategory: "steel",
      materialGrade: "a36",
      percentage: remainingPercentage,
      notes: ""
    }
    onUpdate({
      ...product,
      components: [...(product.components || []), newComponent]
    })
  }

  const updateComponent = (index: number, updates: Partial<ProductComponent>) => {
    const updated = [...(product.components || [])]
    updated[index] = { ...updated[index], ...updates }
    onUpdate({ ...product, components: updated })
  }

  const removeComponent = (index: number) => {
    const updated = [...(product.components || [])]
    updated.splice(index, 1)
    onUpdate({ ...product, components: updated })
  }

  const addPricingOption = () => {
    const newPricing: PricingInfo = {
      model: 'per_unit',
      value: 0,
      currency: 'USD',
      description: ''
    }
    onUpdate({
      ...product,
      pricingOptions: [...(product.pricingOptions || []), newPricing]
    })
  }

  const updatePricing = (index: number, updates: Partial<PricingInfo>) => {
    const updated = [...(product.pricingOptions || [])]
    updated[index] = { ...updated[index], ...updates }
    onUpdate({ ...product, pricingOptions: updated })
  }

  const removePricing = (index: number) => {
    const updated = [...(product.pricingOptions || [])]
    updated.splice(index, 1)
    onUpdate({ ...product, pricingOptions: updated })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="components">Materials</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prod-name">Name</Label>
            <Input
              id="prod-name"
              value={product.name || ""}
              onChange={(e) => onUpdate({ ...product, name: e.target.value })}
              placeholder="Product name"
            />
          </div>
          <div>
            <Label htmlFor="prod-category">Category</Label>
            <Select
              value={product.categoryId || ""}
              onValueChange={(value) => onUpdate({ ...product, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="prod-desc">Description</Label>
          <Textarea
            id="prod-desc"
            value={product.description || ""}
            onChange={(e) => onUpdate({ ...product, description: e.target.value })}
            placeholder="Product description"
          />
        </div>
        <div>
          <Label htmlFor="prod-tags">Tags (comma separated)</Label>
          <Input
            id="prod-tags"
            value={product.tags?.join(", ") || ""}
            onChange={(e) => onUpdate({ ...product, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
            placeholder="tag1, tag2, tag3"
          />
        </div>
      </TabsContent>

      <TabsContent value="components" className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Material Components</h4>
          <Button onClick={addComponent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
        
        {product.components?.map((component, index) => (
          <Card key={component.id} className="p-4">
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-3">
                <Label>Material Category</Label>
                <Select
                  value={component.materialCategory}
                  onValueChange={(value) => updateComponent(index, { materialCategory: value, materialGrade: Object.keys(MATERIALS[value as keyof typeof MATERIALS]?.grades || {})[0] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATERIALS).map(([key, material]) => (
                      <SelectItem key={key} value={key}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Grade</Label>
                <Select
                  value={component.materialGrade}
                  onValueChange={(value) => updateComponent(index, { materialGrade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {component.materialCategory && MATERIALS[component.materialCategory as keyof typeof MATERIALS]?.grades ? 
                      Object.entries(MATERIALS[component.materialCategory as keyof typeof MATERIALS].grades as Record<string, any>).map(([key, grade]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${grade.color}`} />
                            <span>{grade.name}</span>
                          </div>
                        </SelectItem>
                      )) : (
                        <SelectItem value="" disabled>Select a material category first</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Percentage (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={component.percentage}
                  onChange={(e) => updateComponent(index, { percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-3">
                <Label>Notes</Label>
                <Input
                  value={component.notes || ""}
                  onChange={(e) => updateComponent(index, { notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeComponent(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {product.components && product.components.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span>Total: {product.components.reduce((sum, c) => sum + c.percentage, 0).toFixed(1)}%</span>
              {Math.abs(product.components.reduce((sum, c) => sum + c.percentage, 0) - 100) > 0.01 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Must equal 100%
                </Badge>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Pricing Options</h4>
          <Button onClick={addPricingOption} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing
          </Button>
        </div>

        {product.pricingOptions?.map((pricing, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-3">
                <Label>Pricing Model</Label>
                <Select
                  value={pricing.model}
                  onValueChange={(value: PricingModel) => updatePricing(index, { model: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['per_unit', 'per_kg', 'per_lb', 'per_m2', 'per_ft2'] as PricingModel[]).map(model => (
                      <SelectItem key={model} value={model}>
                        {getPricingModelDisplayName(model)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.value}
                  onChange={(e) => updatePricing(index, { value: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label>Currency</Label>
                <Select
                  value={pricing.currency}
                  onValueChange={(value) => updatePricing(index, { currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Label>Description</Label>
                <Input
                  value={pricing.description || ""}
                  onChange={(e) => updatePricing(index, { description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePricing(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>
          {isEditing ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </Tabs>
  )
}

// Product card component
interface ProductCardProps {
  product: CustomProduct
  category?: CustomCategory
  onEdit: () => void
  onDelete: () => void
  onSelect: () => void
}

function ProductCard({ product, category, onEdit, onDelete, onSelect }: ProductCardProps) {
  const properties = product.properties || calculateCompositeProperties(product.components)

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {category && (
              <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-sm", category.color)}>
                {category.icon}
              </div>
            )}
            <div>
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-xs text-muted-foreground">{category?.name}</p>
            </div>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
        )}

        <div className="space-y-2">
          <div className="text-xs">
            <span className="font-medium">Components:</span>
            <div className="mt-1 space-y-1">
              {product.components.slice(0, 2).map((comp, index) => {
                const material = MATERIALS[comp.materialCategory as keyof typeof MATERIALS]
                  ?.grades[comp.materialGrade as keyof any]
                return (
                  <div key={comp.id} className="flex justify-between">
                    <span>{material?.name || comp.materialGrade}</span>
                    <span>{comp.percentage}%</span>
                  </div>
                )
              })}
              {product.components.length > 2 && (
                <div className="text-muted-foreground">
                  +{product.components.length - 2} more
                </div>
              )}
            </div>
          </div>

          {product.pricingOptions.length > 0 && (
            <div className="text-xs">
              <span className="font-medium">Pricing:</span>
              <div className="mt-1">
                {product.pricingOptions.slice(0, 2).map((pricing, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{getPricingModelDisplayName(pricing.model)}</span>
                    <span>{pricing.currency} {pricing.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium">{(properties.density || 0).toFixed(2)}</div>
            <div className="text-muted-foreground">g/cm³</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{(properties.elasticModulus || 0).toFixed(0)}</div>
            <div className="text-muted-foreground">GPa</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{(properties.yieldStrength || 0).toFixed(0)}</div>
            <div className="text-muted-foreground">MPa</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 