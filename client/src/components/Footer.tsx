import logo from "../assets/logo.png";


const Footer = () => {
  return <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="EV SmartCharge" className="h-8 w-8" />
            <span className="text-sm text-muted-foreground">© 2024 EV SmartCharge</span>
          </div>
          
        </div>
      </div>
    </footer>;
};
export default Footer;
