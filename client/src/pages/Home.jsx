import React, { useRef, useState } from 'react';

const Home = () => {
  const videoRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageDataURL = canvas.toDataURL('image/png');
    setCapturedImage(imageDataURL);
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: JSON.stringify({ image: capturedImage }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        console.log('Upload successful');
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div>
      <button onClick={startCamera}>Start Camera</button>
      <video ref={videoRef} style={{ display: 'block', width: '100%' }}></video>
      <button onClick={captureImage}>Capture Image</button>
      {capturedImage && (
        <div>
          <img src={capturedImage} alt="Captured" style={{ width: '50%', marginTop: '10px' }} />
          <button onClick={uploadImage}>Upload Image</button>
        </div>
      )}
    </div>
  );
};

export default Home;
