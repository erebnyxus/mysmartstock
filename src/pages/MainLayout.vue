<!-- filepath: c:\Users\nblhn\OneDrive\Desktop\mysmartstock\src\layouts\MainLayout.vue -->
<template>
  <div class="main-layout">
    <header>
      <h1>SmartStock</h1>
      <nav>
        <router-link to="/">Dashboard</router-link>
        <router-link to="/products">Products</router-link>
        <router-link to="/inventory">Inventory</router-link>
        <router-link to="/reports">Reports</router-link>
        <router-link to="/settings">Settings</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>&copy; 2025 SmartStock. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
// Add any required logic here
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #4caf50;
  color: white;
  padding: 1rem;
}

header nav {
  margin-top: 0.5rem;
}

header nav a {
  margin-right: 1rem;
  color: white;
  text-decoration: none;
}

header nav a:hover {
  text-decoration: underline;
}

main {
  flex: 1;
  padding: 1rem;
}

footer {
  background-color: #f1f1f1;
  text-align: center;
  padding: 1rem;
}
</style>
