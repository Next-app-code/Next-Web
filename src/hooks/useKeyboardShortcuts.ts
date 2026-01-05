import { useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function useKeyboardShortcuts() {
  const {
    selectedNodeId,
    deleteNode,
    nodes,
    edges,
    setNodes,
    setEdges,
  } = useWorkspaceStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;

      // Don't trigger shortcuts when typing in input fields
      if (isInputField && !e.ctrlKey && !e.metaKey) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Delete key
      if (e.key === 'Delete' && selectedNodeId && !isInputField) {
        e.preventDefault();
        deleteNode(selectedNodeId);
        return;
      }

      // Ctrl/Cmd + Z (Undo)
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Undo functionality (to be implemented)
        console.log('Undo');
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y (Redo)
      if ((modifier && e.shiftKey && e.key === 'z') || (modifier && e.key === 'y')) {
        e.preventDefault();
        // Redo functionality (to be implemented)
        console.log('Redo');
        return;
      }

      // Ctrl/Cmd + C (Copy)
      if (modifier && e.key === 'c' && selectedNodeId && !isInputField) {
        e.preventDefault();
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          localStorage.setItem('copiedNode', JSON.stringify(selectedNode));
          console.log('Node copied');
        }
        return;
      }

      // Ctrl/Cmd + V (Paste)
      if (modifier && e.key === 'v' && !isInputField) {
        e.preventDefault();
        const copiedNodeStr = localStorage.getItem('copiedNode');
        if (copiedNodeStr) {
          try {
            const copiedNode = JSON.parse(copiedNodeStr);
            const newNode = {
              ...copiedNode,
              id: `${copiedNode.type}-${Date.now()}`,
              position: {
                x: copiedNode.position.x + 50,
                y: copiedNode.position.y + 50,
              },
              selected: false,
            };
            setNodes([...nodes, newNode]);
            console.log('Node pasted');
          } catch (error) {
            console.error('Failed to paste node:', error);
          }
        }
        return;
      }

      // Ctrl/Cmd + D (Duplicate)
      if (modifier && e.key === 'd' && selectedNodeId && !isInputField) {
        e.preventDefault();
        const selectedNode = nodes.find(n => n.id === selectedNodeId);
        if (selectedNode) {
          const newNode = {
            ...selectedNode,
            id: `${selectedNode.type}-${Date.now()}`,
            position: {
              x: selectedNode.position.x + 50,
              y: selectedNode.position.y + 50,
            },
            selected: false,
          };
          setNodes([...nodes, newNode]);
          console.log('Node duplicated');
        }
        return;
      }

      // Ctrl/Cmd + A (Select All)
      if (modifier && e.key === 'a' && !isInputField) {
        e.preventDefault();
        const updatedNodes = nodes.map(node => ({ ...node, selected: true }));
        setNodes(updatedNodes);
        console.log('All nodes selected');
        return;
      }

      // Escape (Deselect)
      if (e.key === 'Escape') {
        e.preventDefault();
        const updatedNodes = nodes.map(node => ({ ...node, selected: false }));
        setNodes(updatedNodes);
        useWorkspaceStore.getState().selectNode(null);
        console.log('Deselected');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, nodes, edges, deleteNode, setNodes, setEdges]);
}


