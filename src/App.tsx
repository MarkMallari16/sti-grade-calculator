import { useRef, useState } from 'react'

type Grades = {
  prelims: "",
  midterm: "",
  prefinals: "",
  finals: ""
}
function App() {
  const modalRef = useRef<HTMLDialogElement>(null);

  const [grades, setGrades] = useState<Grades>({
    prelims: "",
    midterm: "",
    prefinals: "",
    finals: ""
  });

  const [finalGrade, setFinalGrade] = useState<number>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setGrades((prevGrades) => ({
      ...prevGrades,
      [name]: value
    }));
  }

  const handleCalculate = () => {
    const prelims = Number(grades.prelims)
    const midterm = Number(grades.midterm)
    const prefinals = Number(grades.prefinals)
    const finals = Number(grades.finals)

    if (grades.prelims === "" || grades.midterm === "" || grades.prefinals === "" || grades.finals === "") {
      alert("Please fill in all fields")
      return;
    }
    const weight = 20
    const finalWeight = 40;

    const finalGrade = (prelims * weight + midterm * weight +
      prefinals * weight + finals * finalWeight) / 100

    setFinalGrade(finalGrade);

    if (modalRef.current) {
      modalRef.current?.showModal();
    }
  }
  const resetFields = () => {
    setGrades({
      prelims: "",
      midterm: "",
      prefinals: "",
      finals: ""
    });

    if (modalRef.current) {
      modalRef.current?.close()
    }
  }

  return (
    <>
      {/*Modal*/}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-2xl">Hello!, Your Final Grade is {finalGrade}</h3>
          <div className="modal-action">
            <button className="btn" onClick={() => modalRef.current?.close()}>Close</button>
            <button className="btn btn-primary" onClick={resetFields}>Calculate Again</button>
          </div>
        </div>
      </dialog>

      <div className="drawer lg:drawer-open">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Navbar */}
          <nav className="navbar w-full bg-base-300">
            <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
              {/* Sidebar toggle icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
            </label>
            <div className="px-4 font-bold">
              STI Grade Calculator</div>
          </nav>
          {/* Page content here */}
          <div className='min-h-screen grid grid-cols-2  m-4'>
            <div>
              {/**Content */}
              <div className='ring ring-inset ring-base-300 rounded-md p-10 w-lg'>
                <div className='mb-4'>
                  <h1 className='text-2xl font-bold'>STI College Grades Calculator</h1>
                  <p>
                    A web-based grade calculator designed for STI students to compute grades quickly and accurately.
                  </p>
                </div>
                <div className='mb-2'>
                  <label htmlFor="prelims">Enter Grade for Prelims</label>
                  <input type="number" className='input inline-block w-full' placeholder='eg: 75' name='prelims' value={grades.prelims} onChange={handleInputChange} id='prelims' />
                </div>
                <div className='mb-2'>
                  <label htmlFor="midterm">Enter Grade for Midterm</label>
                  <input type="number" className='input inline-block w-full' placeholder='eg: 75' name='midterm' value={grades.midterm} onChange={handleInputChange} id='midterm' />
                </div>
                <div className='mb-2'>
                  <label htmlFor="prefinals">Enter Grade for Pre-Finals</label>
                  <input type="number" className='input inline-block w-full' placeholder='eg: 75' name='prefinals' value={grades.prefinals} onChange={handleInputChange} id='prefinals' />
                </div>
                <div >
                  <label htmlFor="finals">Enter Grade for Finals</label>
                  <input type="number" className='input inline-block w-full' placeholder='eg: 75' name='finals' value={grades.finals} onChange={handleInputChange} id='finals' />
                </div>
                <button className='mt-3 btn btn-primary w-full' onClick={handleCalculate}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>

                  Calculate
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="drawer-side is-drawer-close:overflow-visible">
          <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-14 is-drawer-open:w-64">
            {/* Sidebar content here */}
            <ul className="menu w-full grow">
              {/* List item */}
              <li>
                <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                  {/* Home icon */}

                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                  <span className="is-drawer-close:hidden">Homepage</span>
                </button>
              </li>

              {/* List item */}
              <li>
                <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Settings">
                  {/* Settings icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
                  <span className="is-drawer-close:hidden">Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
