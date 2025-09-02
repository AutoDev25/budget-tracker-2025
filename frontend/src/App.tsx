import { useState } from 'react'
import Dashboard from './components/Dashboard'
import TransactionList from './components/TransactionList'
import CategoryManager from './components/CategoryManager'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker 2025</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'transactions' && <TransactionList />}
        {activeTab === 'categories' && <CategoryManager />}
      </main>
    </div>
  )
}

export default App
