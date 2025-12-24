import React, { useEffect, useRef, useState } from 'react';

function Footer() {
  const footerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`transition-opacity duration-700 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      } py-3 px-4 shadow-lg bg-gradient-to-r from-gray-500 to-gray-500 text-white text-sm `}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
        {/* ส่วนชื่อมหาวิทยาลัย */}
        <div className="text-xs md:text-left text-center">
          © 2025 คณะครุศาสตร์อุตสาหกรรม, มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น<br />
          150 ถ.ศรีจันทร์ อ.เมือง จ.ขอนแก่น 40000 <br />
          
        
        </div>

        {/* ส่วนอีเมลและเว็บไซต์ */}
        <div className="text-xs md:text-right text-center mt-1 md:mt-0 flex flex-col md:flex-row gap-1 md:gap-3">
          <a href="mailto:Tec13303rmuti@gmail.com" className="hover:underline">
            Tec13303rmuti@gmail.com
          </a>
          <a
            href="https://www.fte.rmuti.ac.th/main/th/node/80"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            www.fte.rmuti.ac.th
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
