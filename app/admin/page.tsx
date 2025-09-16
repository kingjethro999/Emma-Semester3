"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Package, ShoppingCart, Users, Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react"
import { productsAPI, ordersAPI, usersAPI } from "@/lib/api"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gateOpen, setGateOpen] = useState<boolean>(false)
  const [password, setPassword] = useState<string>("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    category: "beverages",
    image: "",
    description: "",
    stock: "0",
  })
  const [kpi, setKpi] = useState({ 
    revenueTotal: 0, 
    customersTotal: 0,
    productsTotal: 0,
    ordersTotal: 0,
    newProductsThisWeek: 0,
    newOrdersThisWeek: 0,
    averageOrderValue: 0
  })
  
  // Modal states
  const [deleteProductModalOpen, setDeleteProductModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orderStatusModalOpen, setOrderStatusModalOpen] = useState(false)
  const [userRoleModalOpen, setUserRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    const ok = typeof window !== 'undefined' ? localStorage.getItem('admin_gate_ok') : null
    setGateOpen(ok === 'true')
  }, [])

  function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === "nwigweshop123") {
      localStorage.setItem('admin_gate_ok', 'true')
      setGateOpen(true)
      setAuthError(null)
    } else {
      setAuthError("Incorrect password")
    }
  }

  const loadAdminData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [prods, ords] = await Promise.all([
        productsAPI.getAll("all"),
        ordersAPI.getAll(),
      ])
      setProducts(prods || [])
      setOrders(ords || [])
      const token = localStorage.getItem("auth_token") || ""
      let users = []
      if (token) {
        try {
          users = await usersAPI.list(token)
          setUsers(users || [])
        } catch (e) {
          // ignore if not admin
        }
      }
      // Compute KPIs from real data
      const revenue = (ords || []).reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)
      const customers = (users && users.length) ? users.length : 0
      const productsCount = (prods || []).length
      const ordersCount = (ords || []).length
      
      // Calculate new products this week (products created in last 7 days)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const newProductsThisWeek = (prods || []).filter((p: any) => {
        const createdDate = new Date(p.created_at || p.createdAt || '2023-01-01')
        return createdDate >= oneWeekAgo
      }).length
      
      // Calculate new orders this week
      const newOrdersThisWeek = (ords || []).filter((o: any) => {
        const orderDate = new Date(o.date || o.created_at || '2023-01-01')
        return orderDate >= oneWeekAgo
      }).length
      
      // Calculate average order value
      const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0
      
      setKpi({ 
        revenueTotal: revenue, 
        customersTotal: customers,
        productsTotal: productsCount,
        ordersTotal: ordersCount,
        newProductsThisWeek,
        newOrdersThisWeek,
        averageOrderValue
      })
      
      // Debug logging for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Admin data loaded:', {
          products: prods?.length || 0,
          orders: ords?.length || 0,
          users: users?.length || 0,
          revenue,
          customers,
          newProductsThisWeek,
          newOrdersThisWeek,
          averageOrderValue
        })
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || "Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!gateOpen) return
    loadAdminData()
  }, [gateOpen])

  function openDeleteProductModal(product: any) {
    setProductToDelete(product)
    setDeleteProductModalOpen(true)
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return
    try {
      await productsAPI.delete(productToDelete.id)
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setDeleteProductModalOpen(false)
      setProductToDelete(null)
    } catch (e) {
      console.error("Delete failed", e)
      setError("Failed to delete product")
    }
  }

  function openCreateProductDialog() {
    setEditingProductId(null)
    setFormValues({ name: "", price: "", category: "beverages", image: "", description: "", stock: "0" })
    setProductDialogOpen(true)
  }

  function openEditProductDialog(product: any) {
    setEditingProductId(product.id)
    setFormValues({
      name: product.name || "",
      price: String(product.price ?? ""),
      category: product.category || "beverages",
      image: product.image || "",
      description: product.description || "",
      stock: String(product.stock ?? "0"),
    })
    setProductDialogOpen(true)
  }

  async function handleSubmitProduct(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: formValues.name.trim(),
      price: Number(formValues.price),
      category: formValues.category,
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      stock: Number.parseInt(formValues.stock || "0"),
    }
    if (!payload.name || !isFinite(payload.price)) {
      setError("Please provide a valid name and price")
      return
    }
    try {
      if (editingProductId == null) {
        const created = await productsAPI.create(payload)
        setProducts((prev) => [{ ...created }, ...prev])
      } else {
        await productsAPI.update(editingProductId, payload)
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? { ...p, ...payload } : p)))
      }
      setProductDialogOpen(false)
    } catch (e) {
      console.error("Save failed", e)
      setError("Failed to save product")
    }
  }

  function openOrderDetailsModal(order: any) {
    setSelectedOrder(order)
    setOrderDetailsModalOpen(true)
  }

  function openOrderStatusModal(order: any) {
    setSelectedOrder(order)
    setOrderStatusModalOpen(true)
  }

  async function handleUpdateOrderStatus(newStatus: string) {
    if (!selectedOrder) return
    try {
      await ordersAPI.updateStatus(selectedOrder.id, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o)))
      setOrderStatusModalOpen(false)
      setSelectedOrder(null)
    } catch (e) {
      console.error("Update failed", e)
      setError("Failed to update order status")
    }
  }

  function openUserRoleModal(user: any) {
    setSelectedUser(user)
    setUserRoleModalOpen(true)
  }

  async function handleUpdateUserRole(newRole: "customer" | "admin") {
    if (!selectedUser) return
    try {
      const token = localStorage.getItem("auth_token") || ""
      await usersAPI.updateRole(selectedUser.id, newRole, token)
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u)))
      setUserRoleModalOpen(false)
      setSelectedUser(null)
    } catch (e) {
      console.error("Update failed", e)
      setError("Failed to update user role")
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {!gateOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full border rounded-md px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              {authError && <div className="text-sm text-red-600">{authError}</div>}
              <div className="flex justify-end">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">Enter</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          {!loading && !error && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Connected to Database
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadAdminData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 text-sm text-gray-500">Loading admin data from database…</div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-600 font-medium">Error loading data</div>
          <div className="text-sm text-red-500 mt-1">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Make sure XAMPP is running and the database is accessible at http://localhost/emmaapi/v1/api.php
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.revenueTotal.toFixed(2)}</div>
            <p className="text-xs text-gray-500">
              {kpi.ordersTotal > 0 ? `From ${kpi.ordersTotal} orders` : 'No orders yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.productsTotal}</div>
            <p className="text-xs text-gray-500">
              {kpi.newProductsThisWeek > 0 ? `+${kpi.newProductsThisWeek} new this week` : 'No new products this week'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.ordersTotal}</div>
            <p className="text-xs text-gray-500">
              {kpi.newOrdersThisWeek > 0 ? `+${kpi.newOrdersThisWeek} this week` : 'No new orders this week'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.customersTotal}</div>
            <p className="text-xs text-gray-500">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Per order average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold">Manage Products</h2>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700" onClick={openCreateProductDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md"
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={product.stock > 10 ? "text-green-600" : "text-orange-500"}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditProductDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => openDeleteProductModal(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <span
                            className={
                              order.status === "Delivered"
                                ? "text-green-600"
                                : order.status === "Shipped"
                                  ? "text-blue-600"
                                  : "text-orange-500"
                            }
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openOrderDetailsModal(order)}>
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openOrderStatusModal(order)}>
                              Update Status
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>{u.created_at}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => openUserRoleModal(u)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!users.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-sm text-gray-500">No access or no users.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProductId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formValues.price}
                  onChange={(e) => setFormValues({ ...formValues, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formValues.category} onValueChange={(value) => setFormValues({ ...formValues, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="packaged-foods">Packaged Foods</SelectItem>
                    <SelectItem value="seasonings">Seasonings</SelectItem>
                    <SelectItem value="household-items">Household Items</SelectItem>
                    <SelectItem value="canned-foods">Canned Foods</SelectItem>
                    <SelectItem value="cooking-oils">Cooking Oils</SelectItem>
                    <SelectItem value="personal-care">Personal Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formValues.stock}
                  onChange={(e) => setFormValues({ ...formValues, stock: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formValues.image}
                onChange={(e) => setFormValues({ ...formValues, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProductDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingProductId ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Modal */}
      <Dialog open={deleteProductModalOpen} onOpenChange={setDeleteProductModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProductModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsModalOpen} onOpenChange={setOrderDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Customer</Label>
                  <p className="text-gray-600">{selectedOrder.customer}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p className="text-gray-600">{selectedOrder.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date</Label>
                  <p className="text-gray-600">{selectedOrder.date}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p className="text-gray-600">{selectedOrder.status}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Total</Label>
                <p className="text-lg font-bold text-green-600">${Number(selectedOrder.total).toFixed(2)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOrderDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Status Update Modal */}
      <Dialog open={orderStatusModalOpen} onOpenChange={setOrderStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Order ID</Label>
                <p className="text-gray-600">{selectedOrder.id}</p>
              </div>
              <div>
                <Label className="font-semibold">Current Status</Label>
                <p className="text-gray-600">{selectedOrder.status}</p>
              </div>
              <div>
                <Label htmlFor="newStatus">New Status</Label>
                <Select onValueChange={handleUpdateOrderStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderStatusModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Role Update Modal */}
      <Dialog open={userRoleModalOpen} onOpenChange={setUserRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">User</Label>
                <p className="text-gray-600">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <div>
                <Label className="font-semibold">Current Role</Label>
                <p className="text-gray-600">{selectedUser.role}</p>
              </div>
              <div>
                <Label htmlFor="newRole">New Role</Label>
                <Select onValueChange={handleUpdateUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserRoleModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
