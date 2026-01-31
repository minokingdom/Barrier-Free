import React from 'react';
import { playClickSound } from '../utils/sound';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative z-10 text-center border border-white/20">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl shadow-lg shadow-blue-100">
                    <i className="fa-solid fa-check"></i>
                </div>

                {title && <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>}
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={() => {
                        playClickSound();
                        onClose();
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default CustomModal;
