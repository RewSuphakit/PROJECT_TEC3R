import React, { useRef, useState, useEffect } from 'react';
import 'daisyui/dist/full.css';

const CameraCapture = ({ onCapture, recordId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // เพิ่มสถานะเก็บรูปภาพที่จับได้

  // เปิดกล้องเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    };

    if (isModalOpen) {
      getUserMedia();
    }

    // Cleanup เมื่อ component ถูก unmount หรือ modal ปิด
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
       <div className="relative group block md:hidden">
    {capturedImage ? (
      <img src={capturedImage} alt="Captured" className="w-20 h-20 rounded-lg object-cover" />
    ) : (
      <>
     
          {/* Tooltip ด้านบน */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-800 text-white text-xs py-1.5 px-3 rounded-md whitespace-nowrap">
              ถ่ายภาพ
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="border-x-8 border-t-8 border-x-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
  
          {/* ปุ่มเปิดกล้อง */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 
                      hover:bg-green-50 hover:border-green-200 
                      dark:border-gray-700 
                      dark:hover:bg-gray-700 
                      transition-all duration-150 group"
          >
            <svg
              className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
      
  
        {/* Modal สำหรับถ่ายภาพ */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-40">
            <div className="modal modal-open z-50">
              <div className="modal-box">
                <h2 className="text-center text-lg mb-4">ถ่ายภาพ</h2>
                <video ref={videoRef} autoPlay width="100%" height="auto" className="mb-4" />
                <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
                <div className="flex justify-center">
                  <button onClick={() => setIsModalOpen(false)} className="btn btn-error">Close</button>
                  <button onClick={handleCapture} className="btn btn-success mr-2">Capture</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )}
    </div>
  </>
  
  );
};

export default CameraCapture;