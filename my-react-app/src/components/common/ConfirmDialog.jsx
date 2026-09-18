import React from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Confirm Action"}>
      <p className="text-slate-300 text-sm mb-6">{message || "Are you sure you want to proceed?"}</p>
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>
          Confirm
        </Button>
      </div>
    </Modal>
  )
}