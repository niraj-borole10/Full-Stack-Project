import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../config'

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
                `${API_BASE_URL}/api/auth/register`,
                formData
            )

            toast.success("Account Created Successfully")

            navigate('/')
        } catch (error) {
            toast.error(error.response?.data?.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
            {/* Card Wrapper */}
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded-[12px] flex flex-col gap-4 w-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                <h1 className="text-lg font-bold text-center text-[#E6EDF3] uppercase tracking-wider">
                    Create Account
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3.5"
                >
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs"
                        onChange={handleChange}
                        required
                    />

                    <button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2 px-3 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                        Register
                    </button>
                </form>

                <p className="text-center text-xs font-medium text-[#8B949E] mt-1">
                    Already have an account?{' '}
                    <Link
                        to="/"
                        className="text-[#3B82F6] hover:text-[#2563EB]"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register