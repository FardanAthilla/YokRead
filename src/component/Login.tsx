import { motion, AnimatePresence } from "framer-motion";
import { LogIn } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../API/firebase";

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal = ({ show, onClose, onSuccess }: LoginModalProps) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error("Login gagal:", error);
    }
  };

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
            className="bg-white w-80 sm:w-96 p-6 rounded-2xl shadow-2xl text-center relative"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Login untuk Melanjutkan
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Gunakan akun Google kamu untuk masuk ke aplikasi.
            </p>

            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 w-full rounded-lg transition duration-200"
            >
              <LogIn className="w-5 h-5" />
              Login dengan Google
            </button>

            <button
              onClick={onClose}
              className="mt-5 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Batal
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
