import { useState, useCallback } from 'react';
import ContactModal from './ContactModal';
import { getApiConfig, testApiConnection } from '@/utils/contactApi';

export default function ContactModalTest() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const [isTesting, setIsTesting] = useState(false);

  // Debug: Log when component renders
  console.log('ContactModalTest rendered at:', new Date().toISOString());

  const handleTestApi = useCallback(async () => {
    if (isTesting) return; // Prevent multiple simultaneous calls
    
    setIsTesting(true);
    setApiStatus('unknown');
    
    try {
      const isConnected = await testApiConnection();
      setApiStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Test failed:', error);
      setApiStatus('disconnected');
    } finally {
      setIsTesting(false);
    }
  }, [isTesting]);

  const apiConfig = getApiConfig();

  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '10px',
      margin: '2rem 0'
    }}>
      <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
        Contact Modal Test
      </h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          Open Contact Modal
        </button>
        
        <button
          onClick={handleTestApi}
          disabled={isTesting}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isTesting ? '#ccc' : 'var(--secondary)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isTesting ? 'not-allowed' : 'pointer',
            opacity: isTesting ? 0.7 : 1
          }}
        >
          {isTesting ? 'Testing...' : 'Test API Connection'}
        </button>
      </div>

      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        <p><strong>API Configuration:</strong></p>
        <ul>
          <li>Environment: {apiConfig.environment}</li>
          <li>Base URL: {apiConfig.baseUrl}</li>
          <li>Endpoint: {apiConfig.contactEndpoint}</li>
          <li>Has API Key: {apiConfig.hasApiKey ? 'Yes' : 'No'}</li>
        </ul>
        
        <p><strong>API Status:</strong> 
          <span style={{ 
            color: apiStatus === 'connected' ? 'green' : 
                  apiStatus === 'disconnected' ? 'red' : 'orange',
            fontWeight: 'bold'
          }}>
            {apiStatus === 'connected' ? '✅ Connected' : 
             apiStatus === 'disconnected' ? '❌ Disconnected' : '❓ Unknown'}
          </span>
        </p>
        
        {isTesting && (
          <p style={{ color: '#ff6b35', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            ⚠️ Sending test message to API...
          </p>
        )}
      </div>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
