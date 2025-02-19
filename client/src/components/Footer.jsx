import React from 'react'

function Footer() {
  return (

    <footer className="bg-gray-200 py-8 px-4   shadow-md fixed bottom-0 left-0 w-full flex justify-center items-center dark:text-white z-50">
      <div className="text-sm text-gray-600 ">
        Copyright © 2024 by Jirasak & Supakit
      </div>
      <div className="flex ml-auto gap-4">
        <a
          href="#"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-500 hover:dark:text-gray-700"
        >
          โครงการนี้สร้างขึ้นเพื่อการศึกษา
        </a>
        <a
          href="#"
          className="text-gray-700 hover:text-gray-900 dark:text-gray-500 hover:dark:text-gray-700"
        >
          ใช้งานในสาขาครุศาสตร์
        </a>
      </div>
    </footer>
  )
}

export default Footer
