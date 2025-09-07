import React from 'react';

function Footer() {
  return (
    <footer className="fixed bottom-0 w-full  py-8 px-4 shadow-md rounded-t-md" style={{backgroundColor: '#f3e7e9'}}> 
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Copyright © 2024 by Jirasak & Supakit
        </div>
        <div className="flex gap-4">
          <p className="text-gray-700 hover:text-gray-900 dark:text-gray-500 hover:dark:text-gray-700">
            โครงการนี้สร้างขึ้นเพื่อการศึกษา
          </p>
          <p className="text-gray-700 hover:text-gray-900 dark:text-gray-500 hover:dark:text-gray-700">
            ใช้งานในสาขาครุศาสตร์
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
