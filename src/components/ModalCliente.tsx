import React, { useState } from 'react';
import { X, Plus, Trash2, Mail, Phone, UserCheck } from 'lucide-react';
import { Cliente, ClienteContact } from '../types';

interface ModalClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onSaveCliente: (cliente: Cliente) => void;
}

export const ModalCliente: React.FC<ModalClienteProps> = ({
  isOpen,
  onClose,
  cliente,
  onSaveCliente
}) => {
  const [formCliente, setFormCliente] = useState<Cliente>({ ...cliente });
  const [newContact, setNewContact] = useState<Partial<ClienteContact>>({
    nombre: '',
    cargo: '',
    email: '',
    telefono: ''
  });

  if (!isOpen) return null;

  const handleAddContact = () => {
    if (!newContact.nombre || !newContact.email) return;
    const contacts = formCliente.contacts || [];
    setFormCliente({
      ...formCliente,
      contacts: [...contacts, newContact as ClienteContact]
    });
    setNewContact({ nombre: '', cargo: '', email: '', telefono: '' });
  };

  const handleRemoveContact = (index: number) => {
    const contacts = (formCliente.contacts || []).filter((_, i) => i !== index);
    setFormCliente({ ...formCliente, contacts });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCliente(formCliente);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/40 backdrop-blur-sm z-[9999] overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-6 space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3">
          <h3 className="text-lg font-extrabold text-[#2D3436]">
            Gestionar Contactos - {cliente.razonSocial}
          </h3>
          <button onClick={onClose} className="text-[#B2BEC3] font-bold text-lg hover:text-[#2D3436]">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contacto Principal */}
          <div className="bg-[#F1F3F5] p-4 rounded-xl border border-[#E0E0E0] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2D3436]">
              <UserCheck size={16} />
              Contacto Principal (Información de Cliente)
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Nombre</label>
                <input
                  type="text"
                  value={formCliente.contactoPrincipal}
                  onChange={(e) => setFormCliente({ ...formCliente, contactoPrincipal: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Cargo</label>
                <input
                  type="text"
                  value={formCliente.cargo}
                  onChange={(e) => setFormCliente({ ...formCliente, cargo: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Email</label>
                <input
                  type="email"
                  value={formCliente.email}
                  onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formCliente.telefono}
                  onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>
          </div>

          {/* Lista de Contactos Adicionales */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2D3436] flex items-center gap-2">
              <Mail size={16} /> Contactos Adicionales
            </h4>

            {(!formCliente.contacts || formCliente.contacts.length === 0) ? (
              <p className="text-xs text-[#B2BEC3] italic">No hay contactos adicionales.</p>
            ) : (
              <div className="space-y-2">
                {formCliente.contacts.map((contact, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-[#E0E0E0] flex items-start justify-between gap-3">
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-[#2D3436]">{contact.nombre}</p>
                      <p className="text-[#636E72]">{contact.cargo}</p>
                      <div className="flex gap-2 mt-1 text-[#C8102E] font-semibold">
                        <a href={`mailto:${contact.email}`} className="hover:underline flex items-center gap-1">
                          <Mail size={12} /> {contact.email}
                        </a>
                        {contact.telefono && (
                          <a href={`tel:${contact.telefono}`} className="hover:underline flex items-center gap-1">
                            <Phone size={12} /> {contact.telefono}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar Nuevo Contacto */}
          <div className="bg-[#F1F3F5] p-4 rounded-xl border border-[#E0E0E0] border-dashed space-y-3">
            <h4 className="text-sm font-bold text-[#2D3436] flex items-center gap-2">
              <Plus size={16} /> Agregar Contacto
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newContact.nombre || ''}
                onChange={(e) => setNewContact({ ...newContact, nombre: e.target.value })}
                className="p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
              />
              <input
                type="text"
                placeholder="Cargo"
                value={newContact.cargo || ''}
                onChange={(e) => setNewContact({ ...newContact, cargo: e.target.value })}
                className="p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
              />
              <input
                type="email"
                placeholder="Email"
                value={newContact.email || ''}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={newContact.telefono || ''}
                onChange={(e) => setNewContact({ ...newContact, telefono: e.target.value })}
                className="p-2.5 bg-white border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8102E]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddContact}
              disabled={!newContact.nombre || !newContact.email}
              className="w-full py-2 px-3 rounded-lg bg-[#C8102E] text-white font-bold text-xs hover:bg-[#A60D26] disabled:opacity-40 transition-colors"
            >
              + Agregar Contacto
            </button>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2.5 border-t border-[#F1F3F5] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors hover:bg-[#A60D26]"
              style={{ backgroundColor: '#C8102E' }}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
