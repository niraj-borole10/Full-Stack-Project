import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const { data } = await axios.post(
                'http://localhost:8080/api/auth/login',
                formData
            )

            localStorage.setItem('token', data.token)

            alert('Login Successful')

            navigate('/home')
        } catch (error) {
            alert(error.response?.data?.message || 'Error')
        }
    }

    return (
        <div className='h-screen flex justify-center items-center bg-slate-900'>
            <form
                onSubmit={handleSubmit}
                className='bg-slate-800 p-8 rounded-xl flex flex-col gap-4 w-[400px]'
            >
                <h1 className='text-3xl font-bold text-center text-white'>
                    Login
                </h1>

                <input
                    type='email'
                    name='email'
                    placeholder='Enter Email'
                    className='p-3 rounded'
                    onChange={handleChange}
                />

                <input
                    type='password'
                    name='password'
                    placeholder='Enter Password'
                    className='p-3 rounded'
                    onChange={handleChange}
                />

                <button className='bg-blue-500 p-3 rounded font-bold text-white'>
                    Login
                </button>

                <p className='text-center text-white'>
                    Don’t have an account?{' '}
                    <Link
                        to='/register'
                        className='text-green-400'
                    >
                        Create Account
                    </Link>
                </p>

                <p className='text-center'>
                    <Link
                        to='/forgot-password'
                        className='text-red-400'
                    >
                        Forgot Password?
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Login