import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
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
            await axios.post(
                'http://localhost:8080/api/auth/register',
                formData
            )

            alert('Registration Successful')

            navigate('/')
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
                    Create Account
                </h1>

                <input
                    type='text'
                    name='name'
                    placeholder='Enter Name'
                    className='p-3 rounded'
                    onChange={handleChange}
                />

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
                    placeholder='Create Password'
                    className='p-3 rounded'
                    onChange={handleChange}
                />

                <button className='bg-green-500 p-3 rounded font-bold text-white'>
                    Register
                </button>

                <p className='text-center text-white'>
                    Already have an account?{' '}
                    <Link
                        to='/'
                        className='text-blue-400'
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    )
}

export default Register