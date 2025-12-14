import { Outlet, NavLink } from 'react-router';

interface LayoutProps {
    theme: string;
    handleThemeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Layout({ theme, handleThemeChange }: LayoutProps) {
    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {/* Navbar */}
                <nav className="navbar w-full bg-base-300">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                        {/* Sidebar toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                    </label>
                    <div className="flex-1 px-4 font-bold justify-between items-center">
                        <span>STI Grade Calculator</span>


                    </div>
                    <div>
                        <label className="toggle text-base-content">
                            <input
                                type="checkbox"
                                value="lofi"
                                className="theme-controller"
                                checked={theme === "lofi"}
                                onChange={handleThemeChange}
                            />

                            <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>

                            <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>

                        </label>
                    </div>
                </nav>
                {/* Page content here */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 m-4 gap-4 lg:gap-2'>
                    <Outlet />
                </div>
            </div>

            <div className="drawer-side is-drawer-close:overflow-visible">
                <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {/* List item */}
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active' : ''}`
                                }
                                data-tip="Calculator"
                            >
                                {/* Calculator icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                <span className="is-drawer-close:hidden">Calculator</span>
                            </NavLink>
                        </li>

                        {/* List item */}
                        <li>
                            <NavLink
                                to="/history"
                                className={({ isActive }) =>
                                    `is-drawer-close:tooltip is-drawer-close:tooltip-right ${isActive ? 'active' : ''}`
                                }
                                data-tip="History"
                            >
                                {/* History icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="my-1.5 inline-block size-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span className="is-drawer-close:hidden">History</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
