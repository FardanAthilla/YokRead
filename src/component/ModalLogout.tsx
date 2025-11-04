// components/LogoutModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface LogoutModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({ show, onClose, onConfirm }: LogoutModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/90 w-80 sm:w-96 p-6 rounded-2xl shadow-2xl text-center relative"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Tombol close di pojok kanan atas */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Konfirmasi Logout
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Apakah kamu yakin ingin keluar dari akunmu?
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 bg-red-500 text-white font-medium py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
              >
                Ya, Logout
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-600 font-medium py-2 rounded-md hover:bg-gray-200 transition-colors duration-300"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
