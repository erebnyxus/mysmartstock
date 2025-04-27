<template>
  <div class="reports-page">
    <h1>Reports</h1>
    <p>View and analyze your reports here.</p>

    <!-- Merged Inventory Report -->
    <section class="report-section">
      <h2>Inventory Transactions Report</h2>

      <!-- Table directly below the heading -->
      <table class="report-table">
        <thead>
          <tr>
            <th @click="toggleSortOrder('date')" class="sortable">
              Date
              <span class="sort-arrow">
                {{ sortColumn === 'date' && sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="toggleSortOrder('product')" class="sortable">
              Product
              <span class="sort-arrow">
                {{ sortColumn === 'product' && sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="toggleSortOrder('category')" class="sortable">
              Category
              <span class="sort-arrow">
                {{ sortColumn === 'category' && sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="toggleSortOrder('quantity')" class="sortable">
              Quantity
              <span class="sort-arrow">
                {{ sortColumn === 'quantity' && sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
            <th @click="toggleSortOrder('party')" class="sortable">
              Party
              <span class="sort-arrow">
                {{ sortColumn === 'party' && sortOrder === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in paginatedInventoryReport"
            :key="entry.id"
            :class="entry.transactionType === 'In' ? 'transaction-in' : 'transaction-out'"
          >
            <td>{{ entry.date }}</td>
            <td>{{ entry.product }}</td>
            <td>{{ entry.category }}</td>
            <td>{{ entry.quantity }}</td>
            <td>{{ entry.party }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </section>

    <!-- Line Charts Section -->
    <section class="charts-section">
      <div class="chart-container">
        <h2>Item In</h2>
        <LineChart :chartData="chartDataIn" :chartOptions="chartOptions" />
      </div>
      <div class="chart-container">
        <h2>Item Out</h2>
        <LineChart :chartData="chartDataOut" :chartOptions="chartOptions" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import LineChart from '@/components/Charts/LineChart.vue';

// Utility function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // Formats to dd-mm-yyyy
};

// Sample data for inventory in and out reports
const inventoryInReport = ref([
  {
    id: 1,
    date: '2025-04-01',
    product: 'Laptop',
    category: 'Electronics',
    quantity: 50,
    supplier: 'Tech Supplies Inc.',
  },
  {
    id: 2,
    date: '2025-04-02',
    product: 'Smartphone',
    category: 'Electronics',
    quantity: 30,
    supplier: 'Gadget World',
  },
  {
    id: 3,
    date: '2025-04-03',
    product: 'Desk Chair',
    category: 'Furniture',
    quantity: 40,
    supplier: 'Office Essentials',
  },
  {
    id: 4,
    date: '2025-04-04',
    product: 'Monitor',
    category: 'Electronics',
    quantity: 25,
    supplier: 'Tech Supplies Inc.',
  },
  {
    id: 5,
    date: '2025-04-05',
    product: 'Notebook',
    category: 'Stationery',
    quantity: 60,
    supplier: 'Paper Goods Co.',
  },
  {
    id: 6,
    date: '2025-04-06',
    product: 'Pen',
    category: 'Stationery',
    quantity: 35,
    supplier: 'Stationery Hub',
  },
  {
    id: 7,
    date: '2025-04-07',
    product: 'Keyboard',
    category: 'Electronics',
    quantity: 45,
    supplier: 'Tech Supplies Inc.',
  },
  {
    id: 8,
    date: '2025-04-08',
    product: 'Desk Lamp',
    category: 'Furniture',
    quantity: 20,
    supplier: 'Office Essentials',
  },
  {
    id: 9,
    date: '2025-04-09',
    product: 'Printer',
    category: 'Electronics',
    quantity: 55,
    supplier: 'Gadget World',
  },
  {
    id: 10,
    date: '2025-04-10',
    product: 'Whiteboard',
    category: 'Furniture',
    quantity: 50,
    supplier: 'Office Essentials',
  },
]);

const inventoryOutReport = ref([
  {
    id: 11,
    date: '2025-04-01',
    product: 'Laptop',
    category: 'Electronics',
    quantity: 20,
    customer: 'John Doe',
  },
  {
    id: 12,
    date: '2025-04-02',
    product: 'Smartphone',
    category: 'Electronics',
    quantity: 15,
    customer: 'Jane Smith',
  },
  {
    id: 13,
    date: '2025-04-03',
    product: 'Desk Chair',
    category: 'Furniture',
    quantity: 25,
    customer: 'Acme Corp.',
  },
  {
    id: 14,
    date: '2025-04-04',
    product: 'Monitor',
    category: 'Electronics',
    quantity: 10,
    customer: 'Global Tech',
  },
  {
    id: 15,
    date: '2025-04-05',
    product: 'Notebook',
    category: 'Stationery',
    quantity: 30,
    customer: 'Paper Supplies Ltd.',
  },
  {
    id: 16,
    date: '2025-04-06',
    product: 'Pen',
    category: 'Stationery',
    quantity: 20,
    customer: 'Stationery World',
  },
  {
    id: 17,
    date: '2025-04-07',
    product: 'Keyboard',
    category: 'Electronics',
    quantity: 35,
    customer: 'Tech Solutions',
  },
  {
    id: 18,
    date: '2025-04-08',
    product: 'Desk Lamp',
    category: 'Furniture',
    quantity: 10,
    customer: 'Office Depot',
  },
  {
    id: 19,
    date: '2025-04-09',
    product: 'Printer',
    category: 'Electronics',
    quantity: 40,
    customer: 'Print Solutions',
  },
  {
    id: 20,
    date: '2025-04-10',
    product: 'Whiteboard',
    category: 'Furniture',
    quantity: 25,
    customer: 'Classroom Supplies',
  },
]);

// Merge inventory in and out reports
const mergedInventoryReport = ref([
  ...inventoryInReport.value.map((entry) => ({
    id: entry.id,
    date: entry.date,
    product: entry.product,
    category: entry.category,
    quantity: entry.quantity,
    transactionType: 'In',
    party: entry.supplier,
  })),
  ...inventoryOutReport.value.map((entry) => ({
    id: entry.id,
    date: entry.date,
    product: entry.product,
    category: entry.category,
    quantity: entry.quantity,
    transactionType: 'Out',
    party: entry.customer,
  })),
]);

// Unique products, categories, and parties for dropdowns
const uniqueProducts = computed(() => [
  ...new Set(mergedInventoryReport.value.map((entry) => entry.product)),
]);
const uniqueCategories = computed(() => [
  ...new Set(mergedInventoryReport.value.map((entry) => entry.category)),
]);
const uniqueParties = computed(() => [
  ...new Set(mergedInventoryReport.value.map((entry) => entry.party)),
]);

// Sort order (ascending or descending) and column
const sortOrder = ref('asc');
const sortColumn = ref('date');

// Computed property to sort the merged inventory report
const sortedInventoryReport = computed(() => {
  return [...mergedInventoryReport.value].sort((a, b) => {
    let valueA = a[sortColumn.value];
    let valueB = b[sortColumn.value];

    // Convert to numbers for quantity sorting
    if (sortColumn.value === 'quantity') {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }

    // Convert to dates for date sorting
    if (sortColumn.value === 'date') {
      valueA = new Date(valueA);
      valueB = new Date(valueB);
    }

    return sortOrder.value === 'asc' ? (valueA > valueB ? 1 : -1) : valueA < valueB ? 1 : -1;
  });
});

// Toggle sort order and column
const toggleSortOrder = (column) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortOrder.value = 'asc';
  }
};

// Computed property for paginated data with formatted dates
const paginatedInventoryReport = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedInventoryReport.value.slice(start, end).map((entry) => ({
    ...entry,
    date: formatDate(entry.date), // Format the date
  }));
});

// Chart data for "Item In" with formatted dates
const chartDataIn = ref({
  labels: inventoryInReport.value.map((entry) => formatDate(entry.date)), // Format the dates
  datasets: [
    {
      label: 'Item In Quantity',
      data: inventoryInReport.value.map((entry) => entry.quantity),
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.2)',
      fill: true,
    },
  ],
});

// Chart data for "Item Out" with formatted dates
const chartDataOut = ref({
  labels: inventoryOutReport.value.map((entry) => formatDate(entry.date)), // Format the dates
  datasets: [
    {
      label: 'Item Out Quantity',
      data: inventoryOutReport.value.map((entry) => entry.quantity),
      borderColor: '#dc3545',
      backgroundColor: 'rgba(220, 53, 69, 0.2)',
      fill: true,
    },
  ],
});

// Chart options
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

// Total pages
const totalPages = computed(() => {
  return Math.ceil(sortedInventoryReport.value.length / itemsPerPage);
});

// Pagination controls
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
</script>

<style scoped>
.reports-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center the content horizontally */
}

.report-section {
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Transaction Row Colors */
.transaction-in td {
  color: #28a745 !important; /* Green font for IN transactions */
}

.transaction-out td {
  color: #dc3545 !important; /* Red font for OUT transactions */
}

/* General Table Styles */
.report-table {
  width: 80%;
  border-collapse: collapse;
  margin-top: 8px;
  text-align: center;
}

.report-table th,
.report-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.report-table th {
  background-color: #2a36bc;
  color: white;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #e9e9e9;
  cursor: not-allowed;
}

/* Charts Section */
.charts-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.chart-container {
  flex: 1 1 100%; /* Take full width by default */
  text-align: center;
}

.chart-container canvas {
  width: 100% !important; /* Make the chart responsive */
  height: 600px !important; /* Increase the height for better visibility */
}

@media (min-width: 768px) {
  .chart-container {
    flex: 1 1 100%; /* Take full width on larger screens */
  }
}

@media (min-width: 1200px) {
  .chart-container {
    flex: 1 1 48%; /* Side-by-side on very large screens */
    max-width: 48%;
  }

  .chart-container canvas {
    height: 500px !important; /* Adjust height for side-by-side layout */
  }
}
</style>
