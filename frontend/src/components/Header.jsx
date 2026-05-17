import mylogo from '../assets/logo.png';

function Header() {
    return (
        <header className="sticky top-0 z-50 bg-green/80 backdrop-blur-md border-[transparent] border-slate-200 h-15 flex items-center px-6">
            <div className="max-w-md mx-auto w-full flex items-center gap-2 flex justify-center items-center ">
                <img src={mylogo} alt="Logo" className='h-[50px] w-auto text-white px-0 py-0 rounded'/>
            </div>
        </header>
    )
};

export default Header;