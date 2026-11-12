// frontend/src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function AdminPanel() {
    // USERS
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'CUSTOMER' });
    const [editingUser, setEditingUser] = useState(null);

    // MEDICINES
    const [medicines, setMedicines] = useState([]);
    const [newMedicine, setNewMedicine] = useState({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
    const [editingMedicine, setEditingMedicine] = useState(null);

    // ENHANCED SALES STATE
    const [sales, setSales] = useState([]);
    const [selectedSale, setSelectedSale] = useState(null);
    const [salesFilters, setSalesFilters] = useState({
        status: 'ALL',
        customer: '',
        dateFrom: '',
        dateTo: '',
        minAmount: '',
        maxAmount: ''
    });
    const [filteredSales, setFilteredSales] = useState([]);
    const [salesStats, setSalesStats] = useState({
        totalSales: 0,
        totalRevenue: 0,
        pendingSales: 0,
        completedSales: 0
    });

    // DELIVERIES
    const [deliveries, setDeliveries] = useState([]);

    // REPORTS
    const [reports, setReports] = useState([]);
    const [range, setRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [selectedReport, setSelectedReport] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [exportingData, setExportingData] = useState(false);

    // Errors
    const [errors, setErrors] = useState({});

    // UI State
    const [activeTab, setActiveTab] = useState('sales');
    const [selectedSales, setSelectedSales] = useState([]);

    const ensureArray = (data) => Array.isArray(data) ? data : [];

    // Load data functions (keeping existing ones)
    const loadUsers = async () => {
        try {
            const { data } = await api.get('/api/users');
            setUsers(ensureArray(data));
            setErrors(prev => ({ ...prev, users: null }));
        } catch (error) {
            console.error('Error loading users:', error);
            setErrors(prev => ({ ...prev, users: error.response?.data?.message || 'Failed to load users' }));
        }
    };

    const loadMedicines = async () => {
        try {
            const { data } = await api.get('/api/medicines');
            setMedicines(ensureArray(data));
            setErrors(prev => ({ ...prev, medicines: null }));
        } catch (error) {
            console.error('Error loading medicines:', error);
            setErrors(prev => ({ ...prev, medicines: error.response?.data?.message || 'Failed to load medicines' }));
        }
    };

    // ENHANCED SALES FUNCTIONS
    const loadSales = async () => {
        try {
            const { data } = await api.get('/api/sales');
            const salesData = ensureArray(data);
            setSales(salesData);
            setFilteredSales(salesData);
            
            // Calculate stats
            const stats = {
                totalSales: salesData.length,
                totalRevenue: salesData.reduce((sum, sale) => sum + Number(sale.totalAmount), 0),
                pendingSales: salesData.filter(s => s.status === 'PENDING').length,
                completedSales: salesData.filter(s => s.status === 'COMPLETED').length
            };
            setSalesStats(stats);
            
            setErrors(prev => ({ ...prev, sales: null }));
        } catch (error) {
            console.error('Error loading sales:', error);
            setErrors(prev => ({ ...prev, sales: error.response?.data?.message || 'Failed to load sales' }));
        }
    };

    const loadDeliveries = async () => {
        try {
            const { data } = await api.get('/api/deliveries');
            setDeliveries(ensureArray(data));
            setErrors(prev => ({ ...prev, deliveries: null }));
        } catch (error) {
            console.error('Error loading deliveries:', error);
            setErrors(prev => ({ ...prev, deliveries: error.response?.data?.message || 'Failed to load deliveries' }));
        }
    };

    const loadReports = async () => {
        try {
            const { data } = await api.get('/api/reports');
            setReports(ensureArray(data));
            setErrors(prev => ({ ...prev, reports: null }));
        } catch (error) {
            console.error('Error loading reports:', error);
            setErrors(prev => ({ ...prev, reports: error.response?.data?.message || 'Failed to load reports' }));
        }
    };

    const load = async () => {
        setLoading(true);
        await Promise.all([
            loadUsers(),
            loadMedicines(),
            loadSales(),
            loadDeliveries(),
            loadReports()
        ]);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    // ENHANCED SALES FUNCTIONS
    const viewSaleDetails = async (saleId) => {
        try {
            const { data } = await api.get(`/api/sales/${saleId}`);
            setSelectedSale(data);
        } catch (error) {
            console.error('Error fetching sale details:', error);
            toast.error('Failed to load sale details');
        }
    };

    const updateSaleStatus = async (saleId, newStatus) => {
        try {
            await api.put(`/api/sales/${saleId}?status=${newStatus}`);
            toast.success(`Sale status updated to ${newStatus}`);
            loadSales();
        } catch (error) {
            console.error('Error updating sale status:', error);
            toast.error('Failed to update sale status');
        }
    };

    const cancelSale = async (saleId) => {
        if (!window.confirm('Are you sure you want to cancel this sale? Stock quantities will be restored.')) {
            return;
        }

        try {
            await api.delete(`/api/sales/${saleId}`);
            toast.success('Sale cancelled successfully. Stock quantities restored.');
            loadSales();
        } catch (error) {
            console.error('Error cancelling sale:', error);
            toast.error('Failed to cancel sale');
        }
    };

    // ADVANCED FILTERING
    const applyFilters = () => {
        let filtered = [...sales];

        if (salesFilters.status !== 'ALL') {
            filtered = filtered.filter(sale => sale.status === salesFilters.status);
        }

        if (salesFilters.customer) {
            filtered = filtered.filter(sale => 
                sale.user?.username?.toLowerCase().includes(salesFilters.customer.toLowerCase()) ||
                sale.user?.email?.toLowerCase().includes(salesFilters.customer.toLowerCase())
            );
        }

        if (salesFilters.dateFrom) {
            filtered = filtered.filter(sale => 
                new Date(sale.saleDate) >= new Date(salesFilters.dateFrom)
            );
        }

        if (salesFilters.dateTo) {
            filtered = filtered.filter(sale => 
                new Date(sale.saleDate) <= new Date(salesFilters.dateTo + 'T23:59:59')
            );
        }

        if (salesFilters.minAmount) {
            filtered = filtered.filter(sale => 
                Number(sale.totalAmount) >= Number(salesFilters.minAmount)
            );
        }

        if (salesFilters.maxAmount) {
            filtered = filtered.filter(sale => 
                Number(sale.totalAmount) <= Number(salesFilters.maxAmount)
            );
        }

        setFilteredSales(filtered);
    };

    const clearFilters = () => {
        setSalesFilters({
            status: 'ALL',
            customer: '',
            dateFrom: '',
            dateTo: '',
            minAmount: '',
            maxAmount: ''
        });
        setFilteredSales(sales);
    };

    // BULK OPERATIONS
    const handleSelectSale = (saleId) => {
        setSelectedSales(prev => 
            prev.includes(saleId) 
                ? prev.filter(id => id !== saleId)
                : [...prev, saleId]
        );
    };

    const handleSelectAllSales = () => {
        if (selectedSales.length === filteredSales.length) {
            setSelectedSales([]);
        } else {
            setSelectedSales(filteredSales.map(sale => sale.id));
        }
    };

    const bulkUpdateStatus = async (newStatus) => {
        if (selectedSales.length === 0) {
            toast.warning('Please select sales to update');
            return;
        }

        if (!window.confirm(`Update ${selectedSales.length} sales to ${newStatus}?`)) {
            return;
        }

        try {
            await Promise.all(
                selectedSales.map(saleId => 
                    api.put(`/api/sales/${saleId}?status=${newStatus}`)
                )
            );
            toast.success(`${selectedSales.length} sales updated to ${newStatus}`);
            setSelectedSales([]);
            loadSales();
        } catch (error) {
            console.error('Error in bulk update:', error);
            toast.error('Failed to update some sales');
        }
    };

    const bulkDelete = async () => {
        if (selectedSales.length === 0) {
            toast.warning('Please select sales to delete');
            return;
        }

        if (!window.confirm(`Delete ${selectedSales.length} sales? This will restore stock quantities.`)) {
            return;
        }

        try {
            await Promise.all(
                selectedSales.map(saleId => api.delete(`/api/sales/${saleId}`))
            );
            toast.success(`${selectedSales.length} sales deleted successfully`);
            setSelectedSales([]);
            loadSales();
        } catch (error) {
            console.error('Error in bulk delete:', error);
            toast.error('Failed to delete some sales');
        }
    };

    // EXPORT FUNCTIONALITY
    const exportSales = async (format = 'csv') => {
        setExportingData(true);
        try {
            const dataToExport = filteredSales.map(sale => ({
                ID: sale.id,
                Customer: sale.user?.username || 'N/A',
                Email: sale.user?.email || 'N/A',
                'Total Amount': Number(sale.totalAmount).toFixed(2),
                Status: sale.status,
                Date: new Date(sale.saleDate).toLocaleDateString(),
                Items: sale.items?.length || 0
            }));

            if (format === 'csv') {
                downloadCSV(dataToExport, `sales-export-${new Date().toISOString().split('T')[0]}.csv`);
            } else {
                downloadJSON(dataToExport, `sales-export-${new Date().toISOString().split('T')[0]}.json`);
            }

            toast.success(`Sales data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting sales:', error);
            toast.error('Failed to export sales data');
        } finally {
            setExportingData(false);
        }
    };

    const downloadCSV = (data, filename) => {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    const downloadJSON = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    // Apply filters whenever they change
    useEffect(() => {
        applyFilters();
    }, [salesFilters, sales]);

    // Keep all existing user and medicine functions...
    const addUser = async () => {
        try {
            await api.post('/api/users', newUser);
            setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
            loadUsers();
            toast.success('✅ User added successfully!');
        } catch (error) {
            toast.error('❌ Failed to add user. Please try again.');
        }
    };

    const delUser = async (id) => {
        try {
            await api.delete('/api/users/' + id);
            loadUsers();
            toast.success('🗑️ User deleted successfully!');
        } catch (error) {
            toast.error('❌ Failed to delete user. Please try again.');
        }
    };

    const startEditUser = (user) => {
        setEditingUser(user);
        setNewUser({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role
        });
    };

    const saveEditUser = async () => {
        try {
            const userData = {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            };
            if (newUser.password.trim()) {
                userData.password = newUser.password;
            }
            await api.put('/api/users/' + editingUser.id, userData);
            setEditingUser(null);
            setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
            loadUsers();
            toast.success('✅ User updated successfully!');
        } catch (error) {
            toast.error('❌ Failed to update user. Please try again.');
        }
    };

    const cancelEditUser = () => {
        setEditingUser(null);
        setNewUser({ username: '', email: '', password: '', role: 'CUSTOMER' });
    };

    // Medicine functions...
    const addMedicine = async () => {
        try {
            const medicineData = {
                name: newMedicine.name,
                category: newMedicine.category,
                price: parseFloat(newMedicine.price),
                quantity: parseInt(newMedicine.quantity),
                expiryDate: newMedicine.expiryDate ? new Date(newMedicine.expiryDate).toISOString().split('T')[0] : null
            };
            await api.post('/api/medicines', medicineData);
            setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
            loadMedicines();
            toast.success('✅ Medicine added successfully!');
        } catch (error) {
            toast.error('❌ Failed to add medicine. Please try again.');
        }
    };

    const startEditMedicine = (medicine) => {
        setEditingMedicine(medicine);
        setNewMedicine({
            name: medicine.name,
            category: medicine.category,
            price: medicine.price.toString(),
            quantity: medicine.quantity.toString(),
            expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : ''
        });
    };

    const saveEditMedicine = async () => {
        try {
            const medicineData = {
                name: newMedicine.name,
                category: newMedicine.category,
                price: parseFloat(newMedicine.price),
                quantity: parseInt(newMedicine.quantity),
                expiryDate: newMedicine.expiryDate ? new Date(newMedicine.expiryDate).toISOString().split('T')[0] : null
            };
            await api.put('/api/medicines/' + editingMedicine.id, medicineData);
            setEditingMedicine(null);
            setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
            loadMedicines();
            toast.success('✅ Medicine updated successfully!');
        } catch (error) {
            toast.error('❌ Failed to update medicine. Please try again.');
        }
    };

    const cancelEditMedicine = () => {
        setEditingMedicine(null);
        setNewMedicine({ name: '', category: '', price: '', quantity: '', expiryDate: '' });
    };

    const delMedicine = async (id) => {
        try {
            await api.delete('/api/medicines/' + id);
            loadMedicines();
            toast.success('🗑️ Medicine deleted successfully!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete medicine. Please try again.';
            toast.error('❌ ' + errorMessage);
        }
    };

    // Delivery functions...
    const updateDeliveryStatus = async (id, status) => {
        try {
            await api.put('/api/deliveries/' + id, null, { params: { status } });
            loadDeliveries();
            toast.success(`🚚 Delivery ${status.toLowerCase()} successfully!`);
        } catch (error) {
            toast.error('❌ Failed to update delivery status. Please try again.');
        }
    };

    const delDelivery = async (id) => {
        try {
            await api.delete('/api/deliveries/' + id);
            loadDeliveries();
            toast.success('🗑️ Delivery deleted successfully!');
        } catch (error) {
            toast.error('❌ Failed to delete delivery. Please try again.');
        }
    };

    // Report functions...
    const genSalesReport = async () => {
        if (!range.start || !range.end) {
            toast.warning('⚠️ Please select both start and end dates');
            return;
        }
        setGeneratingReport(true);
        try {
            const { data } = await api.post('/api/reports', {
                type: 'SALES_SUMMARY',
                start: new Date(range.start).toISOString(),
                end: new Date(range.end).toISOString(),
            });
            setReports((prev) => [...prev, data]);
            toast.success('📊 Sales summary report generated successfully!');
        } catch (error) {
            toast.error('❌ Failed to generate sales report. Please try again.');
        } finally {
            setGeneratingReport(false);
        }
    };

    const genLowStock = async () => {
        setGeneratingReport(true);
        try {
            const { data } = await api.post('/api/reports', {
                type: 'LOW_STOCK',
                threshold: 10
            });
            setReports((prev) => [...prev, data]);
            toast.success('📦 Low stock report generated successfully!');
        } catch (error) {
            toast.error('❌ Failed to generate low stock report. Please try again.');
        } finally {
            setGeneratingReport(false);
        }
    };

    const delReport = async (id) => {
        try {
            await api.delete('/api/reports/' + id);
            loadReports();
            toast.success('🗑️ Report deleted successfully!');
        } catch (error) {
            toast.error('❌ Failed to delete report. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                        🏥 Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Manage users, inventory, sales, and deliveries
                    </p>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Total Users</h3>
                        <p className="text-3xl font-bold">{users.length}</p>
                    </div>
                    <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Medicines</h3>
                        <p className="text-3xl font-bold">{medicines.length}</p>
                    </div>
                    <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                        <p className="text-3xl font-bold">{salesStats.totalSales}</p>
                        <p className="text-sm opacity-80">${salesStats.totalRevenue.toFixed(2)} Revenue</p>
                    </div>
                    <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Pending Sales</h3>
                        <p className="text-3xl font-bold">{salesStats.pendingSales}</p>
                        <p className="text-sm opacity-80">{salesStats.completedSales} Completed</p>
                    </div>
                    <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-2">Deliveries</h3>
                        <p className="text-3xl font-bold">{deliveries.length}</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm">
                    {[
                        { id: 'sales', label: '📊 Sales', count: sales.length },
                        { id: 'users', label: '👥 Users', count: users.length },
                        { id: 'medicines', label: '💊 Medicines', count: medicines.length },
                        { id: 'deliveries', label: '🚚 Deliveries', count: deliveries.length },
                        { id: 'reports', label: '📋 Reports', count: reports.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* ENHANCED SALES SECTION */}
                {activeTab === 'sales' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">📊 Enhanced Sales Management</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={loadSales}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    🔄 Refresh
                                </button>
                                <button
                                    onClick={() => exportSales('csv')}
                                    disabled={exportingData}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    📤 Export CSV
                                </button>
                                <button
                                    onClick={() => exportSales('json')}
                                    disabled={exportingData}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    📤 Export JSON
                                </button>
                            </div>
                        </div>

                        {errors.sales && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.sales}
                            </div>
                        )}

                        {/* Advanced Filters */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold mb-4">🔍 Advanced Filters</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <select
                                    value={salesFilters.status}
                                    onChange={(e) => setSalesFilters({...salesFilters, status: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Customer name/email"
                                    value={salesFilters.customer}
                                    onChange={(e) => setSalesFilters({...salesFilters, customer: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    placeholder="From Date"
                                    value={salesFilters.dateFrom}
                                    onChange={(e) => setSalesFilters({...salesFilters, dateFrom: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    placeholder="To Date"
                                    value={salesFilters.dateTo}
                                    onChange={(e) => setSalesFilters({...salesFilters, dateTo: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Min Amount ($)"
                                    value={salesFilters.minAmount}
                                    onChange={(e) => setSalesFilters({...salesFilters, minAmount: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Amount ($)"
                                    value={salesFilters.maxAmount}
                                    onChange={(e) => setSalesFilters({...salesFilters, maxAmount: e.target.value})}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    🗑️ Clear Filters
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-300 py-2">
                                    Showing {filteredSales.length} of {sales.length} sales
                                </span>
                            </div>
                        </div>

                        {/* Bulk Operations */}
                        {selectedSales.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                                        {selectedSales.length} sales selected
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => bulkUpdateStatus('COMPLETED')}
                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                        >
                                            ✅ Mark Completed
                                        </button>
                                        <button
                                            onClick={() => bulkUpdateStatus('PENDING')}
                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm transition-colors"
                                        >
                                            ⏳ Mark Pending
                                        </button>
                                        <button
                                            onClick={bulkDelete}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                        >
                                            🗑️ Delete Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sales Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                                                onChange={handleSelectAllSales}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Total Amount</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Items</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map(sale => (
                                        <tr key={sale.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSales.includes(sale.id)}
                                                    onChange={() => handleSelectSale(sale.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="px-4 py-2 font-mono">#{sale.id}</td>
                                            <td className="px-4 py-2">
                                                <div>
                                                    <div className="font-medium">{sale.user?.username || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{sale.user?.email || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 font-mono text-green-600 font-bold">
                                                ${Number(sale.totalAmount).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="text-sm">
                                                    {new Date(sale.saleDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(sale.saleDate).toLocaleTimeString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    sale.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : sale.status === 'PENDING'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    {sale.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
                                                    {sale.items?.length || 0} items
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => viewSaleDetails(sale.id)}
                                                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => updateSaleStatus(sale.id, sale.status === 'PENDING' ? 'COMPLETED' : 'PENDING')}
                                                        className={`px-2 py-1 text-white rounded text-xs transition-colors ${
                                                            sale.status === 'PENDING'
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-yellow-500 hover:bg-yellow-600'
                                                        }`}
                                                        title={`Mark as ${sale.status === 'PENDING' ? 'Completed' : 'Pending'}`}
                                                    >
                                                        {sale.status === 'PENDING' ? '✅' : '⏳'}
                                                    </button>
                                                    <button
                                                        onClick={() => cancelSale(sale.id)}
                                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                                        title="Cancel Sale"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredSales.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    {sales.length === 0 ? (
                                        <div>
                                            <div className="text-6xl mb-4">📊</div>
                                            <div className="text-lg">No sales found</div>
                                            <div className="text-sm">Sales will appear here once customers make purchases</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-6xl mb-4">🔍</div>
                                            <div className="text-lg">No sales match your filters</div>
                                            <div className="text-sm">Try adjusting your search criteria</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Keep all existing sections but only show when activeTab matches */}
                {/* Users Section */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">👥 Users Management</h2>

                        {errors.users && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.users}
                            </div>
                        )}

                        {/* Add/Edit User Form */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Username"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="flex space-x-3 mb-6">
                            {editingUser ? (
                                <>
                                    <button
                                        onClick={saveEditUser}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        💾 Update User
                                    </button>
                                    <button
                                        onClick={cancelEditUser}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        ❌ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={addUser}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    ➕ Add User
                                </button>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Username</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Role</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{u.id}</td>
                                            <td className="px-4 py-2">{u.username}</td>
                                            <td className="px-4 py-2">{u.email}</td>
                                            <td className="px-4 py-2">
                                                {u.role === 'ADMIN' ? '⚡ Admin' : '👤 Customer'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => startEditUser(u)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => delUser(u.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    👥 No users found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Medicines Section */}
                {activeTab === 'medicines' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">💊 Medicines Management</h2>

                        {errors.medicines && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.medicines}
                            </div>
                        )}

                        {/* Add/Edit Medicine Form */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Medicine Name"
                                value={newMedicine.name}
                                onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="text"
                                placeholder="Category"
                                value={newMedicine.category}
                                onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                value={newMedicine.price}
                                onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={newMedicine.quantity}
                                onChange={(e) => setNewMedicine({ ...newMedicine, quantity: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <input
                                type="date"
                                placeholder="Expiry Date"
                                value={newMedicine.expiryDate}
                                onChange={(e) => setNewMedicine({ ...newMedicine, expiryDate: e.target.value })}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex space-x-3 mb-6">
                            {editingMedicine ? (
                                <>
                                    <button
                                        onClick={saveEditMedicine}
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    >
                                        💾 Update Medicine
                                    </button>
                                    <button
                                        onClick={cancelEditMedicine}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                    >
                                        ❌ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={addMedicine}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                >
                                    ➕ Add Medicine
                                </button>
                            )}
                        </div>

                        {/* Medicines Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Category</th>
                                        <th className="px-4 py-2 text-left">Price</th>
                                        <th className="px-4 py-2 text-left">Stock</th>
                                        <th className="px-4 py-2 text-left">Expiry</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.map(m => (
                                        <tr key={m.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{m.id}</td>
                                            <td className="px-4 py-2">{m.name}</td>
                                            <td className="px-4 py-2">{m.category}</td>
                                            <td className="px-4 py-2">${Number(m.price).toFixed(2)}</td>
                                            <td className="px-4 py-2">
                                                <span className={m.quantity === 0 ? 'text-red-500 font-bold' : m.quantity <= 10 ? 'text-yellow-500 font-bold' : ''}>
                                                    {m.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                                                {m.expiryDate && new Date(m.expiryDate) < new Date() && (
                                                    <span className="ml-2 text-red-500 font-bold">⚠️ EXPIRED</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => startEditMedicine(m)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => delMedicine(m.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {medicines.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    💊 No medicines found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Deliveries Section */}
                {activeTab === 'deliveries' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">🚚 Deliveries Management</h2>

                        {errors.deliveries && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.deliveries}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Sale</th>
                                        <th className="px-4 py-2 text-left">Address</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveries.map(d => (
                                        <tr key={d.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{d.id}</td>
                                            <td className="px-4 py-2">
                                                Sale #{d.sale?.id} ${Number(d.sale?.totalAmount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2">{d.address}</td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    d.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    d.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                }`}>
                                                    {d.status === 'DELIVERED' ? '✅ Delivered' : d.status === 'SHIPPED' ? '🚚 Shipped' : '⏳ Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    {d.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => updateDeliveryStatus(d.id, 'SHIPPED')}
                                                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                        >
                                                            🚚 Ship
                                                        </button>
                                                    )}
                                                    {d.status === 'SHIPPED' && (
                                                        <button
                                                            onClick={() => updateDeliveryStatus(d.id, 'DELIVERED')}
                                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                                        >
                                                            ✅ Deliver
                                                        </button>
                                                    )}
                                                    {d.status === 'DELIVERED' && (
                                                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-sm">
                                                            🎉 Completed
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => delDelivery(d.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {deliveries.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    🚚 No deliveries found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reports Section */}
                {activeTab === 'reports' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-6">📋 Reports Management</h2>

                        {errors.reports && (
                            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                                {errors.reports}
                            </div>
                        )}

                        {/* Report Generation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Sales Report */}
                            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <h3 className="font-semibold mb-4">📈 Generate Sales Summary</h3>
                                <div className="space-y-3">
                                    <input
                                        type="date"
                                        value={range.start}
                                        onChange={(e) => setRange({ ...range, start: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <input
                                        type="date"
                                        value={range.end}
                                        onChange={(e) => setRange({ ...range, end: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        onClick={genSalesReport}
                                        disabled={generatingReport}
                                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                                    >
                                        {generatingReport ? 'Generating...' : '📊 Generate Sales Report'}
                                    </button>
                                </div>
                            </div>

                            {/* Low Stock Report */}
                            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <h3 className="font-semibold mb-4">⚠️ Generate Low Stock Report</h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Generate a report of medicines with stock below 10 units
                                    </p>
                                    <button
                                        onClick={genLowStock}
                                        disabled={generatingReport}
                                        className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors"
                                    >
                                        {generatingReport ? 'Generating...' : '📦 Generate Low Stock Report'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Reports List */}
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Generated</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id} className="border-b dark:border-gray-700">
                                            <td className="px-4 py-2">#{r.id}</td>
                                            <td className="px-4 py-2">
                                                {r.reportType === 'SALES_SUMMARY' ? '📈 Sales Summary' : '⚠️ Low Stock'}
                                            </td>
                                            <td className="px-4 py-2">
                                                {r.generatedDate ? new Date(r.generatedDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setSelectedReport(r)}
                                                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        👁️ View
                                                    </button>
                                                    <button
                                                        onClick={() => delReport(r.id)}
                                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {reports.length === 0 && (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    📋 No reports generated yet. Create your first report using the form above.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Sale Details Modal */}
            {selectedSale && (
                <SaleDetailsModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onStatusUpdate={updateSaleStatus}
                />
            )}

            {/* Report Details Modal */}
            {selectedReport && (
                <ReportDetailsModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </div>
    );
}

// Enhanced Sale Details Modal Component
function SaleDetailsModal({ sale, onClose, onStatusUpdate }) {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">🧾 Sale Details - #{sale.id}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Sale Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Customer:</span> 
                                <span>{sale.user?.username || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Email:</span> 
                                <span>{sale.user?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Sale Date:</span> 
                                <span>{new Date(sale.saleDate).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Status:</span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    sale.status === 'COMPLETED'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : sale.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                    {sale.status}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Total:</span>
                                <span className="ml-2 text-xl font-bold text-green-600">
                                    ${Number(sale.totalAmount).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Items:</span>
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                                    {sale.items?.length || 0} items
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <button
                            onClick={() => {
                                onStatusUpdate(sale.id, sale.status === 'PENDING' ? 'COMPLETED' : 'PENDING');
                                onClose();
                            }}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                sale.status === 'PENDING'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-yellow-500 hover:bg-yellow-600'
                            }`}
                        >
                            {sale.status === 'PENDING' ? '✅ Mark Completed' : '⏳ Mark Pending'}
                        </button>
                    </div>

                    {/* Sale Items */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">🛒 Items Purchased</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th className="px-4 py-3 text-left border-b font-semibold">Medicine</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Category</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Unit Price</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Quantity</th>
                                        <th className="px-4 py-3 text-left border-b font-semibold">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sale.items?.map((item, index) => (
                                        <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="font-medium">{item.medicine?.name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">ID: #{item.medicine?.id}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-sm">
                                                    {item.medicine?.category || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono">${Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded font-bold">
                                                    ×{item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-mono font-bold text-green-600">
                                                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <td colSpan="4" className="px-4 py-3 text-right font-bold">Total:</td>
                                        <td className="px-4 py-3 font-mono font-bold text-green-600 text-lg">
                                            ${Number(sale.totalAmount).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Delivery Information */}
                    {sale.delivery && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">🚚 Delivery Information</h3>
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-semibold">Address:</span> 
                                        <p className="mt-1 text-gray-600 dark:text-gray-300">{sale.delivery.address}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Delivery Status:</span>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                                            sale.delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            sale.delivery.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                        }`}>
                                            {sale.delivery.status}
                                        </span>
                                    </div>
                                    {sale.delivery.deliveryDate && (
                                        <div>
                                            <span className="font-semibold">Delivered On:</span>
                                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                                {new Date(sale.delivery.deliveryDate).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Report Details Modal Component (keeping existing)
function ReportDetailsModal({ report, onClose }) {
    if (!report) return null;

    let content;
    try {
        content = typeof report.content === 'string' ? JSON.parse(report.content) : report.content;
    } catch (error) {
        content = { error: 'Failed to parse report content', raw: report.content };
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">
                            {report.reportType === 'SALES_SUMMARY' ? '📈 Sales Summary Report' : '⚠️ Low Stock Report'} - #{report.id}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Generated on {new Date(report.generatedDate).toLocaleString()}
                    </div>

                    {content.error ? (
                        <div className="text-red-500">
                            <p>Failed to load report content.</p>
                            <p>Error: {content.error}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-auto">
                                {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
