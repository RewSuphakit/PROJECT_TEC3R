import React, { useRef, useState, useEffect } from 'react';
import 'daisyui/dist/full.css'; // อย่าลืมติดตั้ง DaisyUI

const CameraCapture = ({ onCapture, recordId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // เพิ่มสถานะเก็บรูปภาพที่จับได้
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back camera, 'user' = front camera

  // Function to stop current camera stream
  const stopCurrentStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // Function to start camera with specified facing mode
  const startCamera = async (mode) => {
    try {
      stopCurrentStream(); // Stop any existing stream first
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode }
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  // Switch camera between front and back
  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // เปิดกล้องเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    if (isModalOpen) {
      startCamera(facingMode);
    }

    // Cleanup เมื่อ component ถูก unmount หรือ modal ปิด
    return () => {
      stopCurrentStream();
    };
  }, [isModalOpen]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video && canvas && context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        // ส่งภาพในรูปแบบ Blob และ recordId กลับไป
        const imageFile = new File([blob], 'captured-image.png', { type: 'image/png' });
        onCapture(imageFile, recordId); // ส่งไฟล์และ recordId
        setCapturedImage(URL.createObjectURL(blob));  // เก็บไฟล์ที่จับได้ในสถานะ
        setIsModalOpen(false);  // ปิด modal หลังถ่ายภาพ
      }, 'image/png');
    }
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
              <div className="fixed inset-0 flex items-start justify-center bg-black/70 z-[9999] p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm mx-auto shadow-2xl overflow-hidden my-auto">
                  <div className="p-4">
                    <h2 className="text-center text-lg font-semibold mb-3">ถ่ายภาพ</h2>
                    {/* Video container with fixed height */}
                    <div className="relative w-full h-[40vh] bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      {/* ปุ่มสลับกล้อง */}
                      <button
                        onClick={switchCamera}
                        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-150 z-10"
                        title={facingMode === 'environment' ? 'สลับเป็นกล้องหน้า' : 'สลับเป็นกล้องหลัง'}
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </button>
                    </div>
                    <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
                    {/* Buttons always visible */}
                    <div className="flex justify-center gap-3 mt-4">
                      <button onClick={() => setIsModalOpen(false)} className="btn btn-error px-6">Close</button>
                      <button onClick={handleCapture} className="btn btn-success px-6">Capture</button>
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
