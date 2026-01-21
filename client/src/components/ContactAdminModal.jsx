
import icon from '../assets/rmutikkc.png'
import qrCode from '../assets/Ozff.png'
import { createPortal } from 'react-dom';

const ContactAdminModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <dialog className="modal modal-open">
      <div className="modal-box bg-white p-0 overflow-hidden relative shadow-2xl rounded-2xl max-w-sm">
        {/* Header Pattern */}
        <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 w-full relative">
           <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white hover:bg-white/20"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
             <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg flex items-center justify-center">
                <img src={icon} alt="RMUTI Logo" className="w-16 h-16 object-contain" />
             </div>
          </div>
        </div>

        <div className="pt-12 pb-6 px-6 text-center">
          <h3 className="font-bold text-xl text-gray-800 mb-1">ติดต่อผู้ดูแลระบบ</h3>
          <p className="text-sm text-gray-500 mb-6">สแกน QR Code เพื่อติดต่อสอบถาม</p>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 mb-4 flex justify-center">
             <img 
              src={qrCode} 
              alt="Contact QR Code" 
              className="w-48 h-48 object-contain"
             />
          </div>

          <div className="text-xs text-gray-400">
            <p>หรือติดต่อที่ห้องพักครู</p>
            <p>สาขาครุศาสตร์อุตสาหกรรมคอมพิวเตอร์</p>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop bg-black/40" onClick={onClose}>
           <button type="button" className='cursor-default'>close</button>
        </form>
      </div>
       <form method="dialog" className="modal-backdrop" onClick={onClose}>
          <button type="button">close</button>
      </form>
    </dialog>,
    document.body
  );
};

export default ContactAdminModal;
