import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../config'

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
                `${API_BASE_URL}/api/auth/login`,
                formData
            )

            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('username', data.user.name)

            toast.success("Login Successful")

            navigate('/home')
        } catch (error) {
            toast.error(error.response?.data?.message)
        }
    }

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
            {/* Main Card */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-[12px] p-8 w-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
                
                <div className="text-center mb-6">
                    <h1 className="text-lg font-bold text-[#E6EDF3] uppercase tracking-wider">
                        Code Collaborator
                    </h1>
                    <p className="text-xs text-[#8B949E] mt-1 font-medium">
                        Real-time collaborative coding platform
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className="w-full px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="w-full px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs"
                        onChange={handleChange}
                        required
                    />

                    <button
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2 px-3 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-5 flex justify-between text-xs font-medium">
                    <Link
                        to="/register"
                        className="text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                    >
                        Create Account
                    </Link>
                    <Link
                        to="/forgot-password"
                        className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Login