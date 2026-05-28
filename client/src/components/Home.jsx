import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
    const [roomId, setRoomId] = useState('')

    const navigate = useNavigate()

    const joinRoom = () => {
        if (!roomId) return

        navigate(`/editor/${roomId}`)
    }

    return (
        <div className='h-screen flex justify-center items-center'>
            <div className='bg-slate-800 p-10 rounded-xl flex flex-col gap-4 w-[400px]'>
                <h1 className='text-3xl font-bold text-center'>
                    Collaborative Code Editor
                </h1>
                <input
                    type='text'
                    placeholder='Enter Room ID'
                    className='p-3 rounded text-black'
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <button
                    className='bg-green-500 p-3 rounded font-bold'
                    onClick={joinRoom}
                >
                    Join Room
                </button>
            </div>
        </div>
    )
}

export default Home