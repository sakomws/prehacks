'use client';

import { useState, useEffect, useRef } from 'react';

interface AgentStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  port: number;
  lastChecked: string;
  responseTime?: number;
}

export default function AgentStatus() {
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: 'Flight Agent', status: 'checking', port: 8000, lastChecked: '' },
    { name: 'Food Agent', status: 'checking', port: 8001, lastChecked: '' },
    { name: 'Leisure Agent', status: 'checking', port: 8002, lastChecked: '' },
    { name: 'Shopping Agent', status: 'checking', port: 8003, lastChecked: '' },
    { name: 'Stay Agent', status: 'checking', port: 8004, lastChecked: '' },
    { name: 'Work Agent', status: 'checking', port: 8005, lastChecked: '' },
    { name: 'Commute Agent', status: 'checking', port: 8006, lastChecked: '' },
  ]);

  const isMountedRef = useRef(true);
  const isCheckingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);

  const checkAgentHealth = async (agent: AgentStatus) => {
    const startTime = Date.now();
    try {
      // Map agent names to correct proxy names
      const agentMap: { [key: string]: string } = {
        'Flight Agent': 'flights',
        'Food Agent': 'food',
        'Leisure Agent': 'leisure',
        'Shopping Agent': 'shopping',
        'Stay Agent': 'hotels',
        'Work Agent': 'work',
        'Commute Agent': 'commute'
      };
      
      const agentName = agentMap[agent.name] || agent.name.toLowerCase().split(' ')[0];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`/api/proxy?agent=${agentName}&action=health`, {
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        // Try to parse JSON, but don't fail if it's empty
        try {
          const text = await response.text();
          if (text) {
            JSON.parse(text); // Validate it's JSON, but we don't need the data
          }
        } catch {
          // Not JSON, but response was OK, so consider it healthy
        }
        
        return {
          ...agent,
          status: 'healthy' as const,
          lastChecked: new Date().toLocaleTimeString(),
          responseTime
        };
      } else {
        return {
          ...agent,
          status: 'unhealthy' as const,
          lastChecked: new Date().toLocaleTimeString(),
          responseTime
        };
      }
    } catch {
      return {
        ...agent,
        status: 'unhealthy' as const,
        lastChecked: new Date().toLocaleTimeString(),
        responseTime: Date.now() - startTime
      };
    }
  };

  const checkAllAgents = async () => {
    // Prevent concurrent checks and ensure minimum 30 seconds between checks
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTimeRef.current;
    
    if (isCheckingRef.current || (timeSinceLastCheck < 30000 && lastCheckTimeRef.current > 0)) {
      return; // Skip if already checking or too soon since last check
    }
    
    isCheckingRef.current = true;
    lastCheckTimeRef.current = now;
    
    if (!isMountedRef.current) {
      isCheckingRef.current = false;
      return;
    }
    
    const agentList: AgentStatus[] = [
      { name: 'Flight Agent', status: 'checking' as const, port: 8000, lastChecked: '' },
      { name: 'Food Agent', status: 'checking' as const, port: 8001, lastChecked: '' },
      { name: 'Leisure Agent', status: 'checking' as const, port: 8002, lastChecked: '' },
      { name: 'Shopping Agent', status: 'checking' as const, port: 8003, lastChecked: '' },
      { name: 'Stay Agent', status: 'checking' as const, port: 8004, lastChecked: '' },
      { name: 'Work Agent', status: 'checking' as const, port: 8005, lastChecked: '' },
      { name: 'Commute Agent', status: 'checking' as const, port: 8006, lastChecked: '' },
    ];
    
    // Update to checking state first
    if (isMountedRef.current) {
      setAgents(agentList);
    }
    
    // Then check health
    const updatedAgents = await Promise.all(
      agentList.map(agent => checkAgentHealth(agent))
    );
    
    if (isMountedRef.current) {
      setAgents(updatedAgents);
    }
    
    isCheckingRef.current = false;
  };

  useEffect(() => {
    isMountedRef.current = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    // Initial check
    checkAllAgents();
    
    // Set up interval - check every 30 seconds (not continuously)
    intervalId = setInterval(() => {
      if (isMountedRef.current) {
        checkAllAgents();
      }
    }, 30000); // 30 seconds between checks
    
    return () => {
      isMountedRef.current = false;
      isCheckingRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty array - only run once on mount/unmount

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      case 'checking':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      case 'checking':
        return '⏳';
      default:
        return '❓';
    }
  };

  const healthyCount = agents.filter(agent => agent.status === 'healthy').length;
  const totalCount = agents.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            B
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            Agent Status
          </h3>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {healthyCount}/{totalCount} agents healthy
          </span>
          <button
            onClick={() => checkAllAgents()}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{agent.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                {getStatusIcon(agent.status)} {agent.status}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div>Port: {agent.port}</div>
              <div>Last checked: {agent.lastChecked || 'Never'}</div>
              {agent.responseTime && (
                <div>Response time: {agent.responseTime}ms</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {healthyCount === totalCount && (
        <div className="text-center text-green-600 font-medium">
          🎉 All agents are running smoothly!
        </div>
      )}

      {healthyCount < totalCount && (
        <div className="text-center text-yellow-600 font-medium">
          ⚠️ Some agents may be experiencing issues. Check the logs for details.
        </div>
      )}
    </div>
  );
}
