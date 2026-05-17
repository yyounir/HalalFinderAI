import { useEffect, useState } from 'react'
import mylogo from '../assets/logo.png'
import { DownloadCloud } from 'lucide-react'

function Header() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [canInstall, setCanInstall] = useState(false)
    const [installed, setInstalled] = useState(false)

    useEffect(() => {
        const beforeHandler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            try {
                const dismissed = localStorage.getItem('pwaInstallDismissed')
                if (dismissed) {
                    const ts = parseInt(dismissed, 10)
                    const sevenDays = 7 * 24 * 60 * 60 * 1000
                    if (Date.now() - ts < sevenDays) return
                }
            } catch (err) {}
            setCanInstall(true)
        }

        const appInstalled = () => {
            setInstalled(true)
            setCanInstall(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', beforeHandler)
        window.addEventListener('appinstalled', appInstalled)

        if (window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone)) {
            setInstalled(true)
            setCanInstall(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', beforeHandler)
            window.removeEventListener('appinstalled', appInstalled)
        }
    }, [])

    const onInstallClick = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice && choice.outcome === 'accepted') {
            setInstalled(true)
            setCanInstall(false)
            setDeferredPrompt(null)
            localStorage.removeItem('pwaInstallDismissed')
        } else {
            try { localStorage.setItem('pwaInstallDismissed', String(Date.now())) } catch (e) {}
            setCanInstall(false)
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-green/80 backdrop-blur-md border-[transparent] border-slate-200 h-15">
            <div className="max-w-6xl mx-auto w-full flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <img
                        onClick={() => window.location.reload()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') { e.preventDefault(); window.location.reload(); } }}
                        role="button"
                        tabIndex={0}
                        src={mylogo}
                        alt="Logo"
                        className="h-[50px] w-auto rounded cursor-pointer"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {canInstall && !installed ? (
                        <button
                            onClick={onInstallClick}
                            className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-md"
                            aria-label="Install app"
                        >
                            <DownloadCloud size={18} />
                        </button>
                    ) : null}
                </div>
            </div>
        </header>
    )
}

export default Header