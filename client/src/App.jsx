import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './components/Home'
import EditorPage from './components/EditorPage'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Login />} />

        <Route path='/register' element={<Register />} />

        <Route
          path='/forgot-password'
          element={<ForgotPassword />}
        />

        <Route path='/home' element={<Home />} />

        <Route
          path='/editor/:roomId'
          element={<EditorPage />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App