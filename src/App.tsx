import { useRef, useState } from 'react'

import './App.css'

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

  const [finalGrade, setFinalGrade] = useState<Number>();

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


    const weight = 20
    const finalWeight = 40;

    const finalGrade = (prelims * weight + midterm * weight +
      prefinals * weight + finals * finalWeight) / 100

    setFinalGrade(finalGrade);

    if (modalRef.current) {
      modalRef.current?.showModal();
    }
  }


  return (
    <>
      {/*Modal*/}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click the button below to close</p>
          <div className="modal-action">
            <button className="btn" onClick={() => modalRef.current?.close()}>Close</button>
          </div>
        </div>
      </dialog>
      <div className='min-h-screen grid place-items-center lg:m-0 m-4'>
        <div>
          {/**Content */}
          <div className='ring ring-inset ring-base-300 rounded-md p-8 lg:w-xl'>
            <div className='mb-4'>
              <h1 className='text-2xl font-bold'>STI College Grades Calculator</h1>
              <p>
                A web-based grade calculator designed for STI students to compute grades quickly and accurately.
              </p>
            </div>
            <div className='mb-2'>
              <label htmlFor="prelims">Enter Grade for Prelims</label>
              <input type="text" className='input inline-block w-full' placeholder='eg: 75' name='prelims' value={grades.prelims} onChange={handleInputChange} id='prelims' />
            </div>
            <div className='mb-2'>
              <label htmlFor="midterm">Enter Grade for Midterm</label>
              <input type="text" className='input inline-block w-full' placeholder='eg: 75' name='midterm' value={grades.midterm} onChange={handleInputChange} id='midterm' />
            </div>
            <div className='mb-2'>
              <label htmlFor="prefinals">Enter Grade for Pre-Finals</label>
              <input type="text" className='input inline-block w-full' placeholder='eg: 75' name='prefinals' value={grades.prefinals} onChange={handleInputChange} id='prefinals' />
            </div>
            <div >
              <label htmlFor="finals">Enter Grade for Finals</label>
              <input type="text" className='input inline-block w-full' placeholder='eg: 75' name='finals' value={grades.finals} onChange={handleInputChange} id='finals' />
            </div>
            <button className='mt-3 btn btn-primary w-full' onClick={handleCalculate}>Calculate</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
