import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

interface SoftDeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityType: 'obra' | 'cliente' | 'equipo';
  entityName: string;
}

export const SoftDeleteConfirm: React.FC<SoftDeleteConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  entityType,
  entityName
}) => {
  if (!isOpen) return null;

  const getTypeLabel = () => {
    switch (entityType) {
      case 'obra':
        return 'Obra';
      case 'cliente':
        return 'Cliente';
      case 'equipo':
        return 'Equipo';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#2D3436]">Eliminar {getTypeLabel()}</h2>
            <p className="text-xs text-[#B2BEC3] mt-1">Esta acción no se puede deshacer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-sm text-[#2D3436]">
            Estás a punto de eliminar el siguiente {getTypeLabel().toLowerCase()}:
          </p>
          <div className="p-4 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0]">
            <p className="font-bold text-[#2D3436]">{entityName}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <p className="text-xs font-bold text-amber-900">ℹ️ Eliminación Lógica</p>
            <p className="text-xs text-amber-800">
              El registro se marcará como eliminado y no aparecerá en las vistas operativas, pero se conservará en la base de datos para auditoría. Un Superadmin puede restaurarlo si es necesario.
            </p>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200 mb-6">
          <input
            type="checkbox"
            id="confirm-delete"
            required
            className="w-4 h-4 rounded cursor-pointer mt-0.5"
          />
          <label htmlFor="confirm-delete" className="flex-1 text-xs font-bold text-red-900 cursor-pointer">
            Entiendo que esta acción elimina el {getTypeLabel().toLowerCase()} de forma irreversible
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              const confirmed = (document.getElementById('confirm-delete') as HTMLInputElement)?.checked;
              if (confirmed) {
                onConfirm();
                onClose();
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-md hover:bg-red-700 transition-all text-sm"
            style={{ backgroundColor: '#DC3545' }}
          >
            <Trash2 size={16} />
            Eliminar {getTypeLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};
