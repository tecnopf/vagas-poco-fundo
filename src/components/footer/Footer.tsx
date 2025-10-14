import './Footer.scss'
import Wallpaper from '../../assets/wallpaper.jpg'
import { BsWhatsapp } from "react-icons/bs";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <img src={Wallpaper} alt="Wallpaper" className="footer-bg" />
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
