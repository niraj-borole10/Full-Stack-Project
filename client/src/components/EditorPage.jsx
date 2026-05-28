import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import socket from '../socket'

function EditorPage() {
    const { roomId } = useParams()

    const [code, setCode] = useState('// Start Coding Here')

    useEffect(() => {
        socket.emit('join-room', roomId)

        socket.on('receive-code', (newCode) => {
            setCode(newCode)
        })

        return () => {
            socket.off('receive-code')
        }
    }, [])

    const handleCodeChange = (value) => {
        setCode(value)

        socket.emit('code-change', {
            roomId,
            code: value,
        })
    }

    return (
        <div className='h-screen'>
            <div className='bg-slate-900 p-4 flex justify-between'>
                <h1 className='font-bold text-xl'>Room: {roomId}</h1>
            </div>
            <Editor
                height='90vh'
                defaultLanguage='cpp'
                theme='vs-dark'
                value={code}
                onChange={handleCodeChange}
            />
        </div>
    )
}

export default EditorPage