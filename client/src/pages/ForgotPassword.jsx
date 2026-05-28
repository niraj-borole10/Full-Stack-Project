import { Link } from 'react-router-dom'

function ForgotPassword() {
    return (
        <div className='h-screen flex justify-center items-center bg-slate-900'>
            <div className='bg-slate-800 p-8 rounded-xl flex flex-col gap-4 w-[400px]'>
                <h1 className='text-3xl font-bold text-center text-white'>
                    Forgot Password
                </h1>

                <input
                    type='email'
                    placeholder='Enter Email'
                    className='p-3 rounded'
                />

                <button className='bg-red-500 p-3 rounded font-bold text-white'>
                    Send Reset Link
                </button>

                <p className='text-center'>
                    <Link
                        to='/'
                        className='text-blue-400'
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword