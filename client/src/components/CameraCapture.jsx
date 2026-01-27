import React, { useRef, useState, useEffect } from 'react';
import 'daisyui/dist/full.css';

const CameraCapture = ({ onCapture, recordId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // รูปที่โชว์หน้าเว็บหลัก
  const [tempImage, setTempImage] = useState(null); // รูป preview ในโหมดกล้อง
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [loading, setLoading] = useState(false);

  // Stop camera stream
  const stopCurrentStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Start camera
  const startCamera = async (mode) => {
    setLoading(true);
    try {
      stopCurrentStream();
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 }, // ขอความละเอียดสูงขึ้น
            height: { ideal: 720 },
          },
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera: ', err);
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งาน');
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  useEffect(() => {
    if (isModalOpen && !tempImage) {
      startCamera(facingMode);
    }
    return () => {
      stopCurrentStream();
    };
  }, [isModalOpen, tempImage]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      // ตั้งค่าขนาด canvas ให้เท่ากับ video stream จริงๆ เพื่อภาพที่ไม่บิดเบี้ยว
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Flip ภาพแนวนอนถ้าเป็นกล้องหน้า เพื่อให้เหมือนกระจกเงา
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setTempImage({ blob, url }); // เก็บไว้ใน Temp ก่อน ยังไม่ส่ง
      }, 'image/png');
    }
  };

  const confirmImage = () => {
    if (tempImage) {
      const imageFile = new File([tempImage.blob], `capture-${recordId}.png`, { type: 'image/png' });
      onCapture(imageFile, recordId);
      setCapturedImage(tempImage.url); // อัปเดต UI หน้าหลัก
      setTempImage(null); // เคลียร์ temp
      setIsModalOpen(false); // ปิด modal
    }
  };

  const retakeImage = () => {
    setTempImage(null); // เคลียร์ temp เพื่อกลับไปหน้ากล้อง
    // useEffect จะทำงานอัตโนมัติเพื่อเปิดกล้องใหม่
  };

  const closeModal = () => {
    setTempImage(null);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* --- ส่วนแสดงผลบนหน้าจอหลัก (Thumbnail & Button) --- */}
      <div className="relative group md:hidden w-full max-w-[120px]">
        {capturedImage ? (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition"
              onClick={() => setIsModalOpen(true)}
            />
             <button 
                onClick={() => setIsModalOpen(true)}
                className="absolute -bottom-2 -right-2 bg-gray-800 text-white p-1.5 rounded-full shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50 transition-all duration-200 gap-2"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">ถ่ายภาพ</span>
          </button>
        )}
      </div>

      {/* --- Full Screen Camera Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
          
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pt-safe">
            <button 
              onClick={closeModal} 
              className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* ปุ่มสลับกล้อง (ซ่อนถ้าอยู่ในโหมด Preview) */}
            {!tempImage && (
              <button 
                onClick={switchCamera}
                className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
          </div>

          {/* Main Display Area */}
          <div className="relative w-full h-full bg-black flex items-center justify-center">
             {/* Hidden Canvas for Processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {tempImage ? (
              /* Image Preview Mode */
              <img 
                src={tempImage.url} 
                alt="Preview" 
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              /* Camera View Mode */
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
            )}
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pb-safe bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-8">
              
              {tempImage ? (
                // --- Controls for Preview Mode ---
                <>
                  <button 
                    onClick={retakeImage}
                    className="flex-1 btn btn-circle btn-ghost text-white border-2 border-white/30 hover:bg-white/20"
                  >
                     <span className="text-xs font-bold">ถ่ายใหม่</span>
                  </button>
                  
                  <button 
                    onClick={confirmImage}
                    className="flex-1 btn btn-circle btn-lg bg-green-500 hover:bg-green-400 border-none text-white shadow-lg shadow-green-500/30 scale-110"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </button>

                   <div className="flex-1"></div> {/* Spacer to center the confirm button visually if needed, or remove flex-1 from others */}
                </>
              ) : (
                // --- Controls for Camera Mode ---
                <button
                  onClick={handleCapture}
                  className="group relative"
                  disabled={loading}
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-transform group-active:scale-95">
                    <div className="w-16 h-16 bg-white rounded-full transition-all group-hover:bg-gray-100 group-active:scale-90" />
                  </div>
                </button>
              )}

            </div>
            
            {/* Helper Text */}
            {!tempImage && (
               <p className="text-center text-white/70 text-sm mt-4 font-light">แตะปุ่มเพื่อถ่ายภาพ</p>
            )}
            {tempImage && (
               <p className="text-center text-white/70 text-sm mt-4 font-light">ตรวจสอบภาพก่อนยืนยัน</p>
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default CameraCapture;