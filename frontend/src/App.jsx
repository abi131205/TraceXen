import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Cases from './pages/Cases';
import Investigation from './pages/Investigation';
import GraphExplorer from './pages/GraphExplorer';
import Benchmark from './pages/Benchmark';
import System from './pages/System';
import { fetchCases, fetchSystemStatus } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCaseId, setSelectedCaseId] = useState('HHG-001');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    tigergraph_connected: true,
    mock_fallback_active: false,
    environment: 'AP-SOUTH-1 Savanna',
    database: 'TraceXenGraph'
  });
  const [casesList, setCasesList] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  // Fetch initial system status & case list on mount
  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [statusData, casesData] = await Promise.all([
          fetchSystemStatus().catch(() => null),
          fetchCases().catch(() => [])
        ]);

        if (isMounted) {
          if (statusData) {
            setSystemStatus(statusData);
          }
          const casesArray = Array.isArray(casesData) ? casesData : (casesData?.cases || []);
          if (casesArray.length > 0) {
            setCasesList(casesArray);
          }
        }
      } catch (err) {
        console.warn('Backend server load fallback active:', err);
      } finally {
        if (isMounted) {
          setLoadingCases(false);
        }
      }
    }

    loadInitialData();
  }, []);

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId);
    setActiveTab('investigation');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview 
            onNavigate={setActiveTab} 
            onSelectCase={handleSelectCase} 
            systemStatus={systemStatus}
          />
        );
      case 'cases':
        return (
          <Cases 
            casesList={casesList} 
            onSelectCase={handleSelectCase} 
            onNavigate={setActiveTab}
          />
        );
      case 'investigation':
        return (
          <Investigation 
            selectedCaseId={selectedCaseId} 
            casesList={casesList} 
            onSelectCase={handleSelectCase}
          />
        );
      case 'graph':
        return (
          <GraphExplorer 
            selectedCaseId={selectedCaseId}
            casesList={casesList}
            onSelectCase={handleSelectCase} 
            onNavigate={setActiveTab}
          />
        );
      case 'benchmark':
        return (
          <Benchmark 
            casesList={casesList} 
            onSelectCase={handleSelectCase} 
            onNavigate={setActiveTab}
          />
        );
      case 'system':
        return (
          <System 
            systemStatus={systemStatus}
          />
        );
      default:
        return (
          <Overview 
            onNavigate={setActiveTab} 
            onSelectCase={handleSelectCase} 
            systemStatus={systemStatus}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-sea-bg text-sand font-mono">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
      />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header 
          activeTab={activeTab} 
          selectedCaseId={selectedCaseId} 
          systemStatus={systemStatus}
          onSearch={(query) => {
            if (query.toUpperCase().startsWith('HHG-')) {
              handleSelectCase(query.toUpperCase());
            } else {
              setActiveTab('graph');
            }
          }}
        />
        <main className="flex-1 overflow-y-auto bg-sea-bg relative">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
