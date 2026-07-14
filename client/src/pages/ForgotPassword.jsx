import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../config'

function ForgotPassword() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setIsLoading(true)
        try {
            const { data } = await axios.post(
                `${API_BASE_URL}/api/auth/forgot-password`,
                {
                    email: formData.email,
                    password: formData.password,
                }
            )

            toast.success(data.message || "Password reset successfully")
            navigate('/')
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
            {/* Card Wrapper */}
            <div className="bg-[#161B22] border border-[#30363D] p-8 rounded-[12px] flex flex-col gap-4 w-[360px] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)]">
                <div className="text-center mb-2">
                    <h1 className="text-lg font-bold text-[#E6EDF3] uppercase tracking-wider">
                        Reset Password
                    </h1>
                    <p className="text-xs text-[#8B949E] mt-1 font-medium">
                        Enter your email and choose a new password
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3.5"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-xs transition-all duration-200"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider ml-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-xs transition-all duration-200"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider ml-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            className="px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] text-xs transition-all duration-200"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <p className="text-center text-xs font-medium text-[#8B949E] mt-1">
                    <Link
                        to="/"
                        className="text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword