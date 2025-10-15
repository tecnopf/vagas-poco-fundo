import './Footer.scss'
import { BsWhatsapp } from "react-icons/bs";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from '../../hooks/UseIsMobile';

gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!imgRef.current) return;

    gsap.to(imgRef.current, {
      scale: 2.2, 
      ease: "sine",
      transformOrigin: isMobile? "0% 40%" : "15% 40%",
      duration: 2,
      scrollTrigger: {
        trigger: imgRef.current,
        start: "center bottom", 
        end: "center center", 
        scrub: true
             
      }
    });
  }, []);

  return (
    <footer className="footer">
      <img src='/wallpaper.jpg' alt="Wallpaper" className="footer-bg" ref={imgRef} />
      <div className="overlay"></div>
      <div className='content'>
        <p>Dúvidas, sugestões ou reportar erros: </p>
        <a href="https://wa.link/h027we" target="_blank">
            <BsWhatsapp style={{width: 40, height: 40, zIndex: 3}}/>
        </a>
        <p>© 2025 Vagas Poço Fundo</p>
      </div>
    </footer>
  );
};

export default Footer;
