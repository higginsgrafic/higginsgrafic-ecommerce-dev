import React from 'react';
import { Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export default function EditWrapper({
  children,
  editPath,
  onEdit,
  section = 'section',
  className = ''
}) {
  const { isAdmin, editMode, setEditMode } = useAdmin();
  const navigate = useNavigate();

  if (!isAdmin) {
    return children;
  }

  const handleEditClick = () => {
    setEditMode(true);
    if (typeof onEdit === 'function') {
      onEdit();
      return;
    }
    navigate(editPath, { state: { editMode: true } });
  };

  return (
    <div className={`relative group ${className}`}>
      {children}
      <button
        onClick={handleEditClick}
        className={`absolute top-4 right-4 z-[11000] p-2 bg-blue-600 text-white rounded-lg shadow-lg transition-opacity hover:bg-blue-700 pointer-events-auto ${isAdmin ? 'opacity-100' : editMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        title={`Editar ${section}`}
      >
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  );
}
