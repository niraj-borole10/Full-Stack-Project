import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [roomId, setRoomId] = useState('')

    const navigate = useNavigate()

    const joinRoom = () => {
        if (!roomId) return

        navigate(`/editor/${roomId}`)
    }

    const handleLogout = () => {
        sessionStorage.clear()
        navigate('/')
    }

    return (
        <div className='h-screen flex justify-center items-center bg-[#0D1117]'>
            <div className='bg-[#161B22] border border-[#30363D] p-8 rounded-[12px] flex flex-col gap-4 w-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'>
                <h1 className='text-lg font-bold text-center text-[#E6EDF3] uppercase tracking-wider'>
                    Code Collaborator
                </h1>
                
                <input
                    type='text'
                    placeholder='Enter Room ID'
                    className='px-3 py-2 bg-[#1C2128] border border-[#30363D] rounded-[10px] text-[#E6EDF3] placeholder-[#8B949E] outline-none focus:border-[#3B82F6] text-xs'
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <button
                    className='bg-[#3B82F6] hover:bg-[#2563EB] text-white py-2 px-3 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                    onClick={joinRoom}
                >
                    Join Room
                </button>

                <button
                    className='bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 px-3 rounded-[10px] text-xs font-semibold transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Home