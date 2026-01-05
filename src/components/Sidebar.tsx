'use client';

import { useState, useMemo } from 'react';
import { nodeDefinitions, categoryInfo } from '@/data/nodeDefinitions';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { NodeCategory } from '@/types/nodes';

export function Sidebar() {
  const { isSidebarCollapsed, searchQuery, setSearchQuery, activeCategory, setActiveCategory } = useWorkspaceStore();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['rpc', 'wallet', 'utility', 'input', 'output']));

  const filteredNodes = useMemo(() => {
    let nodes = nodeDefinitions;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query)
      );
    }
    
    if (activeCategory !== 'all') {
      nodes = nodes.filter((node) => node.category === activeCategory);
    }
    
    return nodes;
  }, [searchQuery, activeCategory]);

  const groupedNodes = useMemo(() => {
    const groups: Record<string, typeof nodeDefinitions> = {};
    filteredNodes.forEach((node) => {
      if (!groups[node.category]) {
        groups[node.category] = [];
      }
      groups[node.category].push(node);
    });
    return groups;
  }, [filteredNodes]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  if (isSidebarCollapsed) {
    return (
      <div className="w-12 bg-node-surface border-r border-node-border flex flex-col items-center py-4 space-y-4">
        {Object.entries(categoryInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as NodeCategory)}
            className={`
              w-8 h-8 rounded-md flex items-center justify-center
              transition-all duration-150
              ${activeCategory === key ? 'ring-2 ring-node-accent' : ''}
            `}
            style={{ background: info.color + '20', color: info.color }}
            title={info.label}
          >
            <span className="text-xs font-bold">{info.label.slice(0, 2)}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 bg-node-surface border-r border-node-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-node-border">
        <h2 className="text-sm font-semibold text-gray-300 tracking-tight mb-3">Nodes</h2>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-node-bg border border-node-border rounded-md text-sm text-gray-300 placeholder-gray-500 focus:border-node-accent transition-colors"
        />
      </div>

      {/* Category Filters */}
      <div className="px-4 py-3 border-b border-node-border">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`
              px-2 py-1 text-xs rounded-md transition-all
              ${activeCategory === 'all' 
                ? 'bg-white text-black font-medium' 
                : 'bg-node-bg text-gray-400 hover:bg-node-border'
              }
            `}
          >
            All
          </button>
          {Object.entries(categoryInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as NodeCategory)}
              className={`
                px-2 py-1 text-xs rounded-md transition-all
                ${activeCategory === key 
                  ? 'font-medium' 
                  : 'hover:opacity-80'
                }
              `}
              style={{
                background: activeCategory === key ? '#ffffff' : info.color + '30',
                color: activeCategory === key ? '#000000' : info.color,
              }}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category} className="mb-2">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: categoryInfo[category]?.color }}
                />
                {categoryInfo[category]?.label || category}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedCategories.has(category) && (
              <div className="space-y-1 mt-1">
                {nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                    className="
                      p-2 rounded-md cursor-grab active:cursor-grabbing
                      bg-node-bg border border-transparent
                      hover:border-node-border hover:bg-node-border/50
                      transition-all duration-150
                    "
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: node.color }}
                      />
                      <span className="text-sm text-gray-300 tracking-tight truncate">
                        {node.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 tracking-tight truncate pl-4">
                      {node.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


